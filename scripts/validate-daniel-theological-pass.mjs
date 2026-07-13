import { readdirSync, readFileSync, statSync } from "node:fs";
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

const includeRoots = [
  "index.html",
  "index.txt",
  "background",
  "chapters",
  "articles",
  "charts",
  "schools",
];

const textExtensions = new Set([".html", ".txt"]);
const failures = [];
const warnings = [];

function collectFiles(entry) {
  const fullPath = join(root, entry);
  const stat = statSync(fullPath);
  if (stat.isFile()) return textExtensions.has(fullPath.slice(fullPath.lastIndexOf("."))) ? [fullPath] : [];

  const files = [];
  for (const child of readdirSync(fullPath)) {
    if (child === ".git" || child === "_next" || child === "assets" || child === "scripts") continue;
    files.push(...collectFiles(join(entry, child)));
  }
  return files;
}

function readAll(files) {
  return files.map((file) => ({ file, text: readFileSync(file, "utf8") }));
}

function countMatches(text, pattern) {
  return [...text.matchAll(pattern)].length;
}

const files = includeRoots.flatMap(collectFiles);
const docs = readAll(files);
const allText = docs.map((doc) => doc.text).join("\n");

const statusCounts = new Map();
for (const match of allText.matchAll(/\\?"reviewStatus\\?":\\?"([^"\\]+)\\?"/g)) {
  statusCounts.set(match[1], (statusCounts.get(match[1]) || 0) + 1);
}

for (const [status, count] of statusCounts) {
  if (status !== "verified-seed") {
    failures.push(`Unexpected reviewStatus "${status}" appears ${count} times.`);
  }
}

const forbiddenMarkers = [
  /sourceId/i,
  /sourceAudit/i,
  /sourceProfile/i,
  /Needs page review/i,
  /Page\/location review pending/i,
  /Image pending review/i,
  /stefanovic/i,
  /maxwell/i,
  /pfandl/i,
  /holbrook/i,
  /doukhan/i,
  /shea-reader/i,
];

for (const marker of forbiddenMarkers) {
  const hit = docs.find((doc) => marker.test(doc.text));
  if (hit) failures.push(`Public source/review marker ${marker} remains in ${relative(root, hit.file)}.`);
}

const badTheologyPatterns = [
  /Daniel 9 teaches a future seven-year tribulation/i,
  /Daniel 9 predicts a future seven-year tribulation/i,
  /Daniel 9 requires a future seven-year tribulation/i,
  /the seventieth week is a future seven-year tribulation/i,
  /date for Christ'?s return/i,
  /predict(?:s|ed)? the date of Christ'?s return/i,
  /immortal soul/i,
  /disembodied soul/i,
  /conscious dead/i,
];

for (const pattern of badTheologyPatterns) {
  const hit = docs.find((doc) => pattern.test(doc.text));
  if (hit) failures.push(`Potential doctrinal regression ${pattern} found in ${relative(root, hit.file)}.`);
}

const requiredThemes = [
  [/historicist|historicism/i, "historicist method"],
  [/sanctuary/i, "sanctuary emphasis"],
  [/2300/i, "2300 days"],
  [/1844/i, "1844"],
  [/457 B\.C\./i, "457 B.C."],
  [/seventy weeks/i, "seventy weeks"],
  [/Messiah/i, "Messiah"],
  [/investigative judgment|judgment/i, "judgment"],
  [/Michael/i, "Michael"],
  [/resurrection/i, "resurrection"],
];

for (const [pattern, label] of requiredThemes) {
  if (!pattern.test(allText)) failures.push(`Missing expected Daniel theme: ${label}.`);
}

let totalUniqueVerses = 0;
for (const [chapter, expected] of expectedVerseCounts) {
  const file = join(root, "chapters", String(chapter), "index.txt");
  const text = readFileSync(file, "utf8");
  const refs = new Set();
  for (const match of text.matchAll(/"reference":"Daniel ([0-9]+):([0-9]+)"/g)) {
    if (Number(match[1]) === chapter) refs.add(`${match[1]}:${match[2]}`);
  }
  totalUniqueVerses += refs.size;
  if (refs.size !== expected) {
    failures.push(`Daniel ${chapter} has ${refs.size} unique verse notes; expected ${expected}.`);
  }
}

if (totalUniqueVerses !== 357) {
  failures.push(`Unique Daniel verse-note total is ${totalUniqueVerses}; expected 357.`);
}

const sourceArrayHits = countMatches(allText, /\\?"sources\\?":\[(?!\])/g);
if (sourceArrayHits > 0) {
  warnings.push(`${sourceArrayHits} non-empty sources arrays remain. Confirm they do not expose public citation/source metadata.`);
}

console.log("Daniel theological validation");
console.log(`Files checked: ${files.length}`);
console.log(`Review statuses: ${JSON.stringify(Object.fromEntries(statusCounts), null, 2)}`);
console.log(`Unique Daniel verse notes: ${totalUniqueVerses}`);

if (warnings.length) {
  console.log("\nWarnings:");
  for (const warning of warnings) console.log(`- ${warning}`);
}

if (failures.length) {
  console.error("\nFailures:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("\nPASS: Daniel theological pass checks completed.");
