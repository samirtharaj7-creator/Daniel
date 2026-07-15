import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import {
  buildAlignmentManifest,
  CHAPTER_SOURCE_PAGES,
  REVIEW_POLICY,
  SOURCE_STANDARD,
} from "./daniel-sdabc-alignment.mjs";

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

function decodeFlightChunks(html, file) {
  const pattern = /self\.__next_f\.push\(\[1,("(?:\\.|[^"\\])*")\]\)<\/script>/g;
  const chunks = [];
  for (const match of html.matchAll(pattern)) {
    try {
      chunks.push(JSON.parse(match[1]));
    } catch (error) {
      failures.push(`Invalid embedded route payload in ${relative(root, file)}: ${error.message}`);
    }
  }
  return chunks;
}

const files = includeRoots.flatMap(collectFiles);
const docs = readAll(files);
const allText = docs.map((doc) => doc.text).join("\n");
let flightTextRows = 0;

for (const doc of docs.filter(({ file }) => file.endsWith(".html"))) {
  const chunks = decodeFlightChunks(doc.text, doc.file);
  if (!chunks.length) continue;

  for (let index = 0; index < chunks.length; index += 1) {
    const textHeader = chunks[index].match(/(?:^|\n)([0-9a-f]+):T([0-9a-f]+),$/);
    if (!textHeader) continue;
    flightTextRows += 1;
    if (index + 1 >= chunks.length) {
      failures.push(`Flight text row ${textHeader[1]} has no data chunk in ${relative(root, doc.file)}.`);
      continue;
    }
    const declared = Number.parseInt(textHeader[2], 16);
    const actual = Buffer.byteLength(chunks[index + 1], "utf8");
    if (declared !== actual) {
      failures.push(
        `Flight text row ${textHeader[1]} in ${relative(root, doc.file)} declares ${declared} bytes but contains ${actual}.`,
      );
    }
  }

  const payloadFile = doc.file.slice(0, -"index.html".length) + "index.txt";
  if (existsSync(payloadFile)) {
    const embeddedPayload = chunks.join("");
    const routePayload = readFileSync(payloadFile, "utf8");
    if (embeddedPayload !== routePayload) {
      failures.push(`Embedded and .txt route payloads differ for ${relative(root, doc.file)}.`);
    }
  }
}

const statusCounts = new Map();
for (const match of allText.matchAll(/\\?"reviewStatus\\?":\\?"([^"\\]+)\\?"/g)) {
  statusCounts.set(match[1], (statusCounts.get(match[1]) || 0) + 1);
}

for (const [status, count] of statusCounts) {
  failures.push(`Public reviewStatus "${status}" appears ${count} times.`);
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
  /SDA Bible Commentary/i,
  /Seventh-day Adventist Bible Commentary/i,
  /SDA BC/i,
  /SdaBc-4/i,
  /d26bdcff5e776ccaebf4808bd52fcdd906bdca230f5b6185fae089bda3c649ae/i,
  /daniel-sdabc-alignment/i,
  /approvedPublicProseSha256/i,
  /\\?"reviewStatus\\?":/i,
  /\\?"sources\\?":/i,
  /\\?"confidence\\?":/i,
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
  /main conservative possibilities connect him with Gubaru/i,
  /best understood as spiritual Egypt/i,
  /Identity debated points to atheistic and anti-biblical opposition, especially seen in the French Revolution\./i,
  /Identity debated and open unbelief do not finally escape the northern movement\./i,
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
  [/(?:sixth|6th)[ -]century/i, "sixth-century setting and authorship"],
  [/Babylon.{0,100}Medo-Persia.{0,100}Greece.{0,100}Rome/is, "four-kingdom sequence"],
  [/pagan Rome/i, "pagan Rome"],
  [/papal Rome/i, "papal Rome"],
  [/year-day principle/i, "year-day principle"],
  [/A\.D\. 538/i, "A.D. 538"],
  [/A\.D\. 1798/i, "A.D. 1798"],
  [/heavenly judgment/i, "heavenly judgment"],
  [/A\.D\. 27/i, "A.D. 27"],
  [/A\.D\. 31/i, "A.D. 31"],
  [/A\.D\. 34/i, "A.D. 34"],
  [/Michael is (?:another name or title for )?Christ/i, "Michael as Christ"],
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

const alignmentRequirements = [
  [/Cyaxares II/i, "Cyaxares II as the favored Darius identification"],
  [/(?:incomplete|meager|ambiguous).{0,240}(?:Gubaru|Gobryas)|(?:Gubaru|Gobryas).{0,240}(?:proposal|reconstruction|incomplete|uncertain)/is, "qualified modern Darius proposals"],
  [/daily.{0,900}paganism.{0,900}Christ(?:'|&#x27;)s continual heavenly ministry/is, "both established readings of the daily"],
  [/(?:does not justify declaring either view final|without claiming a final resolution|neither should be presented as the settled final answer)/i, "unresolved status of the daily"],
  [/revolutionary France/i, "revolutionary-France reading of Daniel 11:36-39"],
  [/(?:Turkey-centered|Turkey as the king of the north)/i, "Turkey-centered reading of Daniel 11:40-45"],
  [/papal-climax/i, "papal-climax reading of Daniel 11:36-45"],
  [/(?:generally regarded|generally treated|generally understood) as future/i, "future-status caution for Daniel 11:45"],
];

for (const [pattern, label] of alignmentRequirements) {
  if (!pattern.test(allText)) failures.push(`Missing SDA alignment guardrail: ${label}.`);
}

const manifestPath = join(root, "scripts", "daniel-sdabc-alignment.manifest.json");
let approvedManifest;
try {
  approvedManifest = JSON.parse(readFileSync(manifestPath, "utf8"));
} catch (error) {
  failures.push(`Unable to read alignment manifest: ${error.message}`);
}

if (approvedManifest) {
  const computedManifest = buildAlignmentManifest(root);
  const storedItems = new Map(approvedManifest.items.map((entry) => [entry.id, entry]));
  const computedItems = new Map(computedManifest.items.map((entry) => [entry.id, entry]));

  if (approvedManifest.schemaVersion !== 1) failures.push("Alignment manifest schemaVersion must be 1.");
  if (approvedManifest.contentSet !== "daniel-public-teaching-surfaces") {
    failures.push("Alignment manifest has the wrong contentSet identifier.");
  }
  if (JSON.stringify(approvedManifest.source) !== JSON.stringify(SOURCE_STANDARD)) {
    failures.push("Alignment manifest source filename, page count, or SHA-256 does not match the controlling edition.");
  }
  if (JSON.stringify(approvedManifest.reviewPolicy) !== JSON.stringify(REVIEW_POLICY)) {
    failures.push("Alignment manifest review policy has changed without validator approval.");
  }
  if (JSON.stringify(approvedManifest.chapterPhysicalPageMap) !== JSON.stringify(CHAPTER_SOURCE_PAGES)) {
    failures.push("Alignment manifest physical page map does not match the approved chapter ranges.");
  }
  if (approvedManifest.items.length !== 410) {
    failures.push(`Alignment manifest contains ${approvedManifest.items.length} items; expected 410.`);
  }
  if (storedItems.size !== approvedManifest.items.length) {
    failures.push("Alignment manifest contains duplicate content identifiers.");
  }
  if (approvedManifest.counts?.["verse-note"] !== 357) {
    failures.push("Alignment manifest must cover exactly 357 verse notes.");
  }
  if (approvedManifest.counts?.article !== 30) {
    failures.push("Alignment manifest must cover all 30 articles.");
  }
  if (approvedManifest.counts?.["visual-prophecy-study"] !== 6) {
    failures.push("Alignment manifest must cover all six visual-prophecy studies.");
  }

  for (const entry of approvedManifest.items) {
    if (!["aligned", "corrected", "qualified", "restored"].includes(entry.classification)) {
      failures.push(`Alignment item ${entry.id} has invalid classification ${entry.classification}.`);
    }
    if (!Array.isArray(entry.reviewedFields) || entry.reviewedFields.length === 0) {
      failures.push(`Alignment item ${entry.id} has no reviewed fields.`);
    }
    if (!/^[a-f0-9]{64}$/.test(entry.approvedPublicProseSha256 || "")) {
      failures.push(`Alignment item ${entry.id} has an invalid approved prose hash.`);
    }
    if (!Array.isArray(entry.sourcePages) || entry.sourcePages.length === 0) {
      failures.push(`Alignment item ${entry.id} has no physical source pages.`);
    } else {
      for (const range of entry.sourcePages) {
        if (
          !Array.isArray(range) ||
          range.length !== 2 ||
          !Number.isInteger(range[0]) ||
          !Number.isInteger(range[1]) ||
          range[0] < 1 ||
          range[1] > SOURCE_STANDARD.physicalPages ||
          range[0] > range[1]
        ) {
          failures.push(`Alignment item ${entry.id} has an invalid physical page range.`);
        }
      }
    }
  }

  for (const [id, computed] of computedItems) {
    const stored = storedItems.get(id);
    if (!stored) {
      failures.push(`Alignment manifest is missing public teaching item ${id}.`);
      continue;
    }
    for (const field of [
      "kind",
      "sourcePages",
      "classification",
      "reviewedFields",
      "approvedPublicProseSha256",
    ]) {
      if (JSON.stringify(stored[field]) !== JSON.stringify(computed[field])) {
        failures.push(`Alignment item ${id} has stale or mismatched ${field}.`);
      }
    }
  }

  for (const id of storedItems.keys()) {
    if (!computedItems.has(id)) failures.push(`Alignment manifest contains obsolete item ${id}.`);
  }

  if (JSON.stringify(approvedManifest.counts) !== JSON.stringify(computedManifest.counts)) {
    failures.push("Alignment manifest coverage counts are stale.");
  }
}

if (process.env.DANIEL_SDABC_PDF) {
  try {
    const digest = createHash("sha256")
      .update(readFileSync(process.env.DANIEL_SDABC_PDF))
      .digest("hex");
    if (digest !== SOURCE_STANDARD.sha256) {
      failures.push(`Supplied source PDF SHA-256 is ${digest}; expected ${SOURCE_STANDARD.sha256}.`);
    }
  } catch (error) {
    failures.push(`Unable to hash DANIEL_SDABC_PDF: ${error.message}`);
  }
}

console.log("Daniel theological validation");
console.log(`Files checked: ${files.length}`);
console.log(`Review statuses: ${JSON.stringify(Object.fromEntries(statusCounts), null, 2)}`);
console.log(`Unique Daniel verse notes: ${totalUniqueVerses}`);
console.log(`Flight text rows checked: ${flightTextRows}`);
if (approvedManifest) console.log(`Alignment manifest items: ${approvedManifest.items.length}`);

if (failures.length) {
  console.error("\nFailures:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("\nPASS: Daniel theological pass checks completed.");
