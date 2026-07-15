import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

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
const legacyApplicationFields = ["application", "practicalApplication", "teachingAngle"];
const semanticHelperFields = [
  "explanation",
  "historicalBackground",
  "adventistInsight",
  "propheticSignificance",
  "technicalDetails",
  ...legacyApplicationFields,
];
const genericConclusionPatterns = [
  ["calls readers", /\b(?:calls?|invites?|encourages?) (?:the )?(?:reader|readers|us)\b/gi],
  ["modern life", /\b(?:modern life|today|our lives?)\b/gi],
  ["generic believer", /\b(?:believers?|Christians?|faithful people) (?:must|should|need|can)\b/gi],
  ["practical lesson", /\b(?:practical lesson|lesson for us|application for)\b/gi],
];

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

function extractObject(text, marker) {
  const start = text.indexOf(marker);
  if (start < 0) throw new Error(`Marker not found: ${marker}`);

  let depth = 0;
  let inString = false;
  let escaped = false;
  for (let index = start; index < text.length; index += 1) {
    const char = text[index];
    if (inString) {
      if (escaped) escaped = false;
      else if (char === "\\") escaped = true;
      else if (char === '"') inString = false;
      continue;
    }
    if (char === '"') inString = true;
    else if (char === "{") depth += 1;
    else if (char === "}") {
      depth -= 1;
      if (depth === 0) return JSON.parse(text.slice(start, index + 1));
    }
  }
  throw new Error(`Unterminated JSON object at ${marker}`);
}

function decodeFlightChunks(html) {
  const pattern = /self\.__next_f\.push\(\[1,("(?:\\.|[^"\\])*")\]\)<\/script>/g;
  return [...html.matchAll(pattern)].map((match) => JSON.parse(match[1])).join("");
}

function extractNotes() {
  const notes = [];
  for (const [chapter, expected] of expectedVerseCounts) {
    const file = join(chapterDir, String(chapter), "index.txt");
    const text = readFileSync(file, "utf8");
    const props = extractObject(text, `{"chapter":{"chapterNumber":${chapter},`);
    const byVerse = new Map();
    for (const source of props.chapter.verses) {
      const verse = Number(source.verse);
      if (source.reference !== `Daniel ${chapter}:${verse}` || byVerse.has(verse)) continue;
      const paragraphs = (source.detailedCommentary || []).filter(Boolean);
      byVerse.set(verse, {
        id: `Daniel ${chapter}:${verse}`,
        chapter,
        verse,
        paragraphs,
        text: paragraphs.join(" "),
        source,
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
const chapterPayloads = new Map();
const staleEmbeddedPayloads = [];
for (const chapter of expectedVerseCounts.keys()) {
  const txtPath = join(chapterDir, String(chapter), "index.txt");
  const htmlPath = join(chapterDir, String(chapter), "index.html");
  const text = readFileSync(txtPath, "utf8");
  chapterPayloads.set(
    chapter,
    extractObject(text, `{"chapter":{"chapterNumber":${chapter},`),
  );
  if (decodeFlightChunks(readFileSync(htmlPath, "utf8")) !== text) {
    staleEmbeddedPayloads.push(`Daniel ${chapter}`);
  }
}

const canonicalChapters = new Map(
  [...chapterPayloads.values()].map((payload) => [payload.chapter.chapterNumber, payload.chapter]),
);
const stalePrefetchedChapters = [];
const populatedPayloadApplications = [];
for (const [routeChapter, payload] of chapterPayloads) {
  for (const key of ["chapter", "previousChapter", "nextChapter"]) {
    const chapter = payload[key];
    if (!chapter || typeof chapter !== "object") continue;
    const canonical = canonicalChapters.get(chapter.chapterNumber);
    if (!canonical || JSON.stringify(chapter) !== JSON.stringify(canonical)) {
      stalePrefetchedChapters.push(`chapter ${routeChapter}.${key}`);
    }
    for (const note of chapter.verses || []) {
      for (const field of legacyApplicationFields) {
        if (String(note[field] || "").trim()) {
          populatedPayloadApplications.push(`chapter ${routeChapter}.${key}.${note.reference}.${field}`);
        }
      }
    }
  }
}
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
const emptyNotes = notes.filter((note) => !note.paragraphs.length || wordCount(note.text) < 60);
const populatedLegacyApplications = notes.flatMap((note) =>
  legacyApplicationFields
    .filter((field) => String(note.source[field] || "").trim())
    .map((field) => `${note.id}.${field}`),
);
const copiedHelperParagraphs = notes.flatMap((note) =>
  semanticHelperFields.flatMap((field) => {
    const value = String(note.source[field] || "").trim();
    if (!value || !note.paragraphs.includes(value)) return [];
    return [`${note.id}.${field}`];
  }),
);
const supportStates = notes.reduce(
  (counts, note) => {
    const hasSymbols = Boolean(note.source.symbolCards?.length || note.source.symbolNotes?.length);
    const hasReferences = Boolean(note.source.crossReferences?.length || note.source.crossReferenceNotes);
    const key = hasSymbols && hasReferences
      ? "both"
      : hasSymbols
        ? "symbolsOnly"
        : hasReferences
          ? "referencesOnly"
          : "neither";
    counts[key] += 1;
    return counts;
  },
  { both: 0, symbolsOnly: 0, referencesOnly: 0, neither: 0 },
);
const missingRequiredSupport = notes.flatMap((note) => {
  const failures = [];
  if (!(note.source.symbolCards?.length || note.source.symbolNotes?.length)) failures.push("Symbols");
  if (!note.source.crossReferences?.length) failures.push("Cross References");
  if (!Array.isArray(note.source.wordNotes) || note.source.wordNotes.length < 2) {
    failures.push("Word / Phrase Notes");
  } else {
    const terms = new Set();
    for (const item of note.source.wordNotes) {
      const term = String(item?.term || "").trim();
      const explanation = String(item?.explanation || "").trim();
      const references = item?.scriptureReferences;
      const normalizedTerm = normalizeSentence(term);
      if (!term || explanation.length < 20 || !Array.isArray(references) || !references.length) {
        failures.push("valid Word / Phrase Notes");
        break;
      }
      if (terms.has(normalizedTerm)) {
        failures.push("unique Word / Phrase Notes");
        break;
      }
      terms.add(normalizedTerm);
    }
  }
  return failures.map((failure) => `${note.id}: ${failure}`);
});

const staleStudySupportBundles = [];
for (const [chapter, canonical] of canonicalChapters) {
  const assetPath = join(root, "assets", "commentary", `daniel-${chapter}.json`);
  const bundle = JSON.parse(readFileSync(assetPath, "utf8"));
  const byVerse = new Map((bundle.notes || []).map((note) => [Number(note.verse), note]));
  if (byVerse.size !== canonical.verses.length) {
    staleStudySupportBundles.push(`Daniel ${chapter}: note count`);
    continue;
  }
  for (const note of canonical.verses) {
    const bundled = byVerse.get(Number(note.verse));
    if (!bundled ||
        JSON.stringify(bundled.crossReferences) !== JSON.stringify(note.crossReferences) ||
        JSON.stringify(bundled.symbols) !== JSON.stringify(note.symbolCards) ||
        JSON.stringify(bundled.wordNotes) !== JSON.stringify(note.wordNotes)) {
      staleStudySupportBundles.push(note.reference);
    }
  }
}

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
const genericConclusionCounts = Object.fromEntries(
  genericConclusionPatterns.map(([label, pattern]) => [label, [...noteText.matchAll(pattern)].length]),
);

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
console.log(`Support module states: ${JSON.stringify(supportStates)}`);
console.log(`Missing or invalid required supports: ${missingRequiredSupport.length}`);
console.log(`Stale browser support bundles: ${staleStudySupportBundles.length}`);
console.log(`Generic conclusion signals: ${JSON.stringify(genericConclusionCounts, null, 2)}`);
console.log(`Populated legacy application fields: ${populatedLegacyApplications.length}`);
console.log(`Populated legacy fields across all route payload copies: ${populatedPayloadApplications.length}`);
console.log(`Stale prefetched chapter copies: ${stalePrefetchedChapters.length}`);
console.log(`HTML/Flight payload mismatches: ${staleEmbeddedPayloads.length}`);
console.log(`Commentary paragraphs copied into helper fields: ${copiedHelperParagraphs.length}`);
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

const failures = [];
if (notes.length !== 357) failures.push(`Expected 357 Daniel notes; found ${notes.length}.`);
if (emptyNotes.length) failures.push(`${emptyNotes.length} notes are empty or shorter than 60 words.`);
if (populatedLegacyApplications.length) {
  failures.push(`${populatedLegacyApplications.length} legacy application fields are still populated.`);
}
if (populatedPayloadApplications.length) {
  failures.push(`${populatedPayloadApplications.length} legacy fields remain in duplicated route payloads.`);
}
if (stalePrefetchedChapters.length) {
  failures.push(`${stalePrefetchedChapters.length} prefetched chapter copies differ from their canonical chapters.`);
}
if (staleEmbeddedPayloads.length) {
  failures.push(`${staleEmbeddedPayloads.length} embedded HTML Flight payloads differ from their .txt exports.`);
}
if (copiedHelperParagraphs.length) {
  failures.push(`${copiedHelperParagraphs.length} commentary paragraphs are copied into helper fields.`);
}
if (repeatedParagraphs.length) failures.push(`${repeatedParagraphs.length} exact commentary paragraphs are repeated.`);
if (supportStates.both !== 357 || supportStates.symbolsOnly || supportStates.referencesOnly || supportStates.neither) {
  failures.push(`All 357 notes must include both Symbols and Cross References; found ${JSON.stringify(supportStates)}.`);
}
if (missingRequiredSupport.length) {
  failures.push(`${missingRequiredSupport.length} required support modules are missing or invalid.`);
}
if (staleStudySupportBundles.length) {
  failures.push(`${staleStudySupportBundles.length} browser support bundle entries differ from canonical notes.`);
}

if (failures.length) {
  console.error("\nFAIL");
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log("\nPASS: Daniel study notes satisfy the natural-flow structural checks.");
