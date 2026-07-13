import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const root = process.cwd();
const expectedVerseCounts = new Map([
  [1, 21],
  [2, 49],
  [3, 30],
  [4, 37],
  [5, 31],
  [6, 28],
  [7, 28],
  [8, 27],
  [9, 27],
  [10, 21],
  [11, 45],
  [12, 13],
]);

const chapterDir = join(root, "chapters");
const stringPattern = String.raw`"(?:\\.|[^"\\])*"`;
const stockPatterns = [
  ["This verse", /\bThis verse\b/gi],
  ["The verse", /\bThe verse\b/gi],
  ["This chapter", /\bThis chapter\b/gi],
  ["The chapter", /\bThe chapter\b/gi],
  ["The point is", /\bThe point is\b/gi],
  ["The issue is", /\bThe issue is\b/gi],
  ["At the same time", /\bAt the same time\b/gi],
  ["does not mean", /\bdoes not mean\b/gi],
  ["not merely", /\bnot merely\b/gi],
  ["not only", /\bnot only\b/gi],
  ["The practical", /\bThe practical\b/gi],
  ["The lesson", /\bThe lesson\b/gi],
];

function decodeJsonString(raw) {
  try {
    return JSON.parse(raw);
  } catch {
    return raw.slice(1, -1).replace(/\\"/g, '"');
  }
}

function wordCount(text) {
  const words = text.match(/[A-Za-z0-9]+(?:['-][A-Za-z0-9]+)?/g);
  return words ? words.length : 0;
}

function normalizeSentence(sentence) {
  return sentence
    .toLowerCase()
    .replace(/\\n/g, " ")
    .replace(/[^a-z0-9' ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokens(text) {
  return new Set(
    (text.toLowerCase().match(/[a-z0-9]+(?:'[a-z0-9]+)?/g) || []).filter((token) => token.length > 3),
  );
}

function jaccard(a, b) {
  const left = tokens(a);
  const right = tokens(b);
  if (!left.size || !right.size) return 0;
  let shared = 0;
  for (const token of left) if (right.has(token)) shared += 1;
  return shared / (left.size + right.size - shared);
}

function extractNotes() {
  const notes = [];
  for (const [chapter, expected] of expectedVerseCounts) {
    const file = join(chapterDir, String(chapter), "index.txt");
    const text = readFileSync(file, "utf8");
    const noteRegex = new RegExp(
      String.raw`"verse":(\d+),"reference":"Daniel ${chapter}:(\d+)","bibleText":${stringPattern},"detailedCommentary":\[(.*?)\],"explanation":`,
      "gs",
    );
    const byVerse = new Map();
    for (const match of text.matchAll(noteRegex)) {
      const verse = Number(match[1]);
      if (verse !== Number(match[2]) || byVerse.has(verse)) continue;
      const paragraphs = [...match[3].matchAll(new RegExp(stringPattern, "g"))].map((item) =>
        decodeJsonString(item[0]),
      );
      byVerse.set(verse, {
        id: `Daniel ${chapter}:${verse}`,
        chapter,
        verse,
        paragraphs,
        text: paragraphs.join(" "),
      });
    }
    if (byVerse.size !== expected) {
      console.warn(`WARN: Daniel ${chapter} extracted ${byVerse.size} notes; expected ${expected}.`);
    }
    notes.push(...[...byVerse.values()].sort((a, b) => a.verse - b.verse));
  }
  return notes;
}

function collectPublicTextFiles(entry) {
  const fullPath = join(root, entry);
  const stat = statSync(fullPath);
  if (stat.isFile()) return /\.(html|txt)$/.test(fullPath) ? [fullPath] : [];
  return readdirSync(fullPath).flatMap((child) => {
    if (child === ".git" || child === "_next" || child === "assets" || child === "scripts") return [];
    return collectPublicTextFiles(join(entry, child));
  });
}

const notes = extractNotes();
const allFiles = [
  "index.html",
  "index.txt",
  "background",
  "chapters",
  "articles",
  "charts",
  "schools",
].flatMap(collectPublicTextFiles);
const publicText = allFiles.map((file) => readFileSync(file, "utf8")).join("\n");
const noteText = notes.map((note) => note.text).join("\n");

const lengths = notes.map((note) => wordCount(note.text)).sort((a, b) => a - b);
const average = Math.round(lengths.reduce((sum, length) => sum + length, 0) / Math.max(lengths.length, 1));
const median = lengths[Math.floor(lengths.length / 2)] || 0;
const buckets = {
  under250: lengths.filter((length) => length < 250).length,
  from250to349: lengths.filter((length) => length >= 250 && length < 350).length,
  from350to450: lengths.filter((length) => length >= 350 && length <= 450).length,
  over450: lengths.filter((length) => length > 450).length,
};

const publicPhraseCounts = Object.fromEntries(
  stockPatterns.map(([label, pattern]) => [label, [...publicText.matchAll(pattern)].length]),
);
const notePhraseCounts = Object.fromEntries(
  stockPatterns.map(([label, pattern]) => [label, [...noteText.matchAll(pattern)].length]),
);
const negationFrames = [...publicText.matchAll(/\bnot\b[^.;!?]{0,120}\bbut\b/gi)].length;
const noteNegationFrames = [...noteText.matchAll(/\bnot\b[^.;!?]{0,120}\bbut\b/gi)].length;

const paragraphBuckets = notes.reduce((summary, note) => {
  const key = `${note.paragraphs.length} paragraphs`;
  summary[key] = (summary[key] || 0) + 1;
  return summary;
}, {});

const sentenceCounts = new Map();
for (const note of notes) {
  for (const sentence of note.text.split(/(?<=[.!?])\s+/)) {
    const normalized = normalizeSentence(sentence);
    if (wordCount(normalized) < 9) continue;
    sentenceCounts.set(normalized, (sentenceCounts.get(normalized) || 0) + 1);
  }
}

const repeatedSentences = [...sentenceCounts.entries()]
  .filter(([, count]) => count > 1)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 10);

const paragraphCounts = new Map();
for (const note of notes) {
  for (const paragraph of note.paragraphs) {
    const normalized = normalizeSentence(paragraph);
    if (wordCount(normalized) < 18) continue;
    paragraphCounts.set(normalized, (paragraphCounts.get(normalized) || 0) + 1);
  }
}

const repeatedParagraphs = [...paragraphCounts.entries()]
  .filter(([, count]) => count > 1)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 10);

const adjacentSimilarity = [];
for (const chapter of expectedVerseCounts.keys()) {
  const chapterNotes = notes.filter((note) => note.chapter === chapter);
  for (let index = 1; index < chapterNotes.length; index += 1) {
    adjacentSimilarity.push({
      pair: `${chapterNotes[index - 1].id} / ${chapterNotes[index].id}`,
      score: jaccard(chapterNotes[index - 1].text, chapterNotes[index].text),
    });
  }
}
adjacentSimilarity.sort((a, b) => b.score - a.score);

const topOpeners = new Map();
const topClosers = new Map();
for (const note of notes) {
  const opener = normalizeSentence(note.paragraphs[0] || "").split(" ").slice(0, 7).join(" ");
  const closer = normalizeSentence(note.paragraphs.at(-1) || "").split(" ").slice(0, 7).join(" ");
  if (!opener) continue;
  topOpeners.set(opener, (topOpeners.get(opener) || 0) + 1);
  if (closer) topClosers.set(closer, (topClosers.get(closer) || 0) + 1);
}

console.log("Daniel humanization audit");
console.log(`Notes extracted: ${notes.length}`);
console.log(`Public files scanned: ${allFiles.length}`);
console.log(`Word count average/median/min/max: ${average}/${median}/${lengths[0] || 0}/${lengths.at(-1) || 0}`);
console.log(`Length buckets: ${JSON.stringify(buckets)}`);
console.log(`Paragraph count buckets: ${JSON.stringify(paragraphBuckets)}`);
console.log(`Note stock phrase counts: ${JSON.stringify(notePhraseCounts, null, 2)}`);
console.log(`Public stock phrase counts: ${JSON.stringify(publicPhraseCounts, null, 2)}`);
console.log(`Note not ... but frames: ${noteNegationFrames}`);
console.log(`Public not ... but frames: ${negationFrames}`);
console.log("\nRepeated sentences:");
for (const [sentence, count] of repeatedSentences) console.log(`- ${count}x ${sentence}`);
console.log("\nRepeated paragraphs:");
for (const [paragraph, count] of repeatedParagraphs) console.log(`- ${count}x ${paragraph}`);
console.log("\nMost similar adjacent notes:");
for (const item of adjacentSimilarity.slice(0, 10)) console.log(`- ${item.score.toFixed(2)} ${item.pair}`);
console.log("\nRepeated note openers:");
for (const [opener, count] of [...topOpeners.entries()].filter(([, count]) => count > 1).sort((a, b) => b[1] - a[1]).slice(0, 10)) {
  console.log(`- ${count}x ${opener}`);
}
console.log("\nRepeated note closers:");
for (const [closer, count] of [...topClosers.entries()].filter(([, count]) => count > 1).sort((a, b) => b[1] - a[1]).slice(0, 10)) {
  console.log(`- ${count}x ${closer}`);
}

if (notes.length !== 357) {
  console.error("\nFAIL: Expected 357 Daniel notes.");
  process.exit(1);
}
