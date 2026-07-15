import { createHash } from "node:crypto";
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const SOURCE_STANDARD = Object.freeze({
  filename: "SdaBc-4 (27) Daniel.pdf",
  sha256: "d26bdcff5e776ccaebf4808bd52fcdd906bdca230f5b6185fae089bda3c649ae",
  physicalPages: 147,
});

export const CHAPTER_SOURCE_PAGES = Object.freeze({
  introduction: [[1, 10]],
  1: [[11, 22]],
  2: [[23, 35]],
  3: [[36, 44]],
  4: [[45, 57]],
  5: [[58, 67]],
  6: [[68, 76]],
  7: [[77, 101]],
  8: [[102, 110]],
  9: [[111, 119]],
  10: [[120, 126]],
  11: [[127, 143]],
  12: [[143, 147]],
});

export const REVIEW_POLICY = Object.freeze({
  standard:
    "Use the supplied commentary as the controlling theological standard while preserving source uncertainty and established alternatives.",
  favoredView:
    "Present a favored interpretation as primary without erasing qualifications or incomplete evidence.",
  unresolvedView:
    "When the standard retains alternatives, represent them proportionately and do not convert uncertainty into certainty.",
  publicCitation:
    "Paraphrase the standard; do not expose source citations, review labels, or internal alignment metadata on public routes.",
  modernEvidence:
    "Compatible modern historical or archaeological proposals may remain when clearly identified as proposals.",
});

const EXPECTED_VERSE_COUNTS = new Map([
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

const ARTICLE_SOURCE_PAGES = Object.freeze({
  "antiochus-iv-and-daniel-8": [[102, 110]],
  "books-opened-in-daniel-7": [[77, 101]],
  "daniel-11-40-time-of-the-end": [[127, 147]],
  "daniel-11-45-final-crisis": [[127, 147]],
  "daniel-11-and-the-french-revolution": [[127, 143]],
  "daniel-3-and-revelation-13": [[36, 44]],
  "daniel-6-and-the-final-worship-crisis": [[68, 76]],
  "daniel-and-revelation-one-prophetic-story": [[23, 147]],
  "does-daniel-9-predict-the-messiah": [[111, 119]],
  "fall-of-babylon-daniel-5-revelation-18": [[58, 67]],
  "how-daniel-8-and-9-belong-together": [[102, 119]],
  "how-to-read-daniel-11": [[127, 147]],
  "is-there-a-seven-year-tribulation-in-daniel-9": [[111, 119]],
  "king-of-the-north-and-the-south": [[127, 147]],
  "little-horn-in-daniel-7-and-8": [[77, 110]],
  "son-of-man-and-the-judgment": [[77, 101]],
  "ten-identifying-marks-of-the-little-horn": [[77, 110]],
  "the-daily-in-daniel-8": [[102, 110], [134, 147]],
  "the-four-kingdoms-in-daniel": [[23, 101]],
  "time-times-and-half-a-time": [[77, 101], [143, 147]],
  "was-daniel-written-after-the-events": [[1, 10]],
  "what-is-historicism": [[1, 10], [23, 147]],
  "who-is-michael-in-daniel": [[120, 147]],
  "why-1844-is-not-an-isolated-date": [[102, 119]],
  "why-antiochus-cannot-exhaust-daniel-8": [[102, 110]],
  "why-daniel-begins-in-babylon": [[11, 22]],
  "why-futurism-separates-what-daniel-keeps-together": [[23, 147]],
  "why-interpretive-method-matters": [[1, 10], [23, 147]],
  "why-preterism-falls-short-in-daniel": [[1, 10], [23, 147]],
  "why-the-sanctuary-matters-in-daniel": [[77, 119]],
});

const CHART_SOURCE_PAGES = Object.freeze({
  "daniel-2": [[23, 35]],
  "daniel-7": [[77, 101]],
  "daniel-8": [[102, 110]],
  "daniel-9": [[111, 119]],
  "daniel-8-9": [[102, 119]],
  "daniel-11": [[127, 147]],
});

const CORRECTED_IDS = new Set([
  "verse:6:1",
  "verse:6:28",
  "verse:9:1",
  "verse:11:1",
]);

const QUALIFIED_IDS = new Set([
  "verse:8:11",
  "verse:8:13",
  "verse:11:31",
  ...Array.from({ length: 10 }, (_, index) => `verse:11:${index + 36}`),
  "verse:12:11",
  "verse:12:12",
  "route:articles",
  "route:article:daniel-11-40-time-of-the-end",
  "route:article:daniel-11-45-final-crisis",
  "route:article:daniel-11-and-the-french-revolution",
  "route:article:how-to-read-daniel-11",
  "route:article:king-of-the-north-and-the-south",
  "route:article:the-daily-in-daniel-8",
  "route:article:why-1844-is-not-an-isolated-date",
  "route:article:why-antiochus-cannot-exhaust-daniel-8",
  "route:chart:daniel-11",
]);

const RESTORED_IDS = new Set([
  "verse:8:11",
  "verse:8:13",
  "verse:11:31",
  ...Array.from({ length: 10 }, (_, index) => `verse:11:${index + 36}`),
  "verse:12:11",
  "verse:12:12",
]);

const NOTE_METADATA_FIELDS = new Set(["confidence", "reviewStatus", "sources"]);

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

function normalize(value) {
  if (Array.isArray(value)) return value.map(normalize);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(
    Object.keys(value)
      .sort()
      .map((key) => [key, normalize(value[key])]),
  );
}

function sha256(value) {
  return createHash("sha256").update(JSON.stringify(normalize(value))).digest("hex");
}

function reviewedObject(value, excludedFields) {
  return Object.fromEntries(
    Object.entries(value).filter(([key]) => !excludedFields.has(key)),
  );
}

function extractVisibleText(text) {
  const values = [];
  const seen = new Set();
  const pattern = /"(?:children|content)":("(?:\\.|[^"\\])*")/g;
  for (const match of text.matchAll(pattern)) {
    const value = JSON.parse(match[1]).trim();
    if (!value || value === "width=device-width, initial-scale=1" || seen.has(value)) continue;
    seen.add(value);
    values.push(value);
  }
  return values;
}

function classificationFor(id) {
  if (RESTORED_IDS.has(id)) return "restored";
  if (CORRECTED_IDS.has(id)) return "corrected";
  if (QUALIFIED_IDS.has(id)) return "qualified";
  return "aligned";
}

function item({ id, kind, sourcePages, reviewedFields, payload }) {
  return {
    id,
    kind,
    sourcePages,
    classification: classificationFor(id),
    reviewedFields,
    approvedPublicProseSha256: sha256(payload),
  };
}

function loadChapter(root, chapterNumber) {
  const file = join(root, "chapters", String(chapterNumber), "index.txt");
  const text = readFileSync(file, "utf8");
  const props = extractObject(text, `{"chapter":{"chapterNumber":${chapterNumber},`);
  return props.chapter;
}

function genericRouteItem(root, definition) {
  const text = readFileSync(join(root, definition.file), "utf8");
  const payload = { visibleText: extractVisibleText(text) };
  const reviewedFields = ["visibleText"];

  if (definition.interactiveMarker && text.includes(definition.interactiveMarker)) {
    payload.interactiveContent = extractObject(text, definition.interactiveMarker);
    reviewedFields.push("interactiveContent");
  }

  return item({
    id: definition.id,
    kind: definition.kind,
    sourcePages: definition.sourcePages,
    reviewedFields,
    payload,
  });
}

function routeDefinitions(root) {
  const articleSlugs = readdirSync(join(root, "articles"), { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
  const chartSlugs = readdirSync(join(root, "charts"), { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();

  const definitions = [
    { id: "route:home", kind: "site-home", file: "index.txt", sourcePages: [[1, 147]] },
    {
      id: "route:background",
      kind: "book-introduction",
      file: "background/index.txt",
      sourcePages: CHAPTER_SOURCE_PAGES.introduction,
    },
    {
      id: "route:schools",
      kind: "interpretive-index",
      file: "schools/index.txt",
      sourcePages: [[1, 147]],
    },
    {
      id: "route:articles",
      kind: "article-index",
      file: "articles/index.txt",
      sourcePages: [[1, 147]],
    },
    {
      id: "route:charts",
      kind: "visual-prophecy-index",
      file: "charts/index.txt",
      sourcePages: [[23, 147]],
    },
  ];

  for (const slug of articleSlugs) {
    if (!ARTICLE_SOURCE_PAGES[slug]) throw new Error(`Missing article source-page map: ${slug}`);
    definitions.push({
      id: `route:article:${slug}`,
      kind: "article",
      file: `articles/${slug}/index.txt`,
      sourcePages: ARTICLE_SOURCE_PAGES[slug],
    });
  }

  for (const slug of chartSlugs) {
    if (!CHART_SOURCE_PAGES[slug]) throw new Error(`Missing chart source-page map: ${slug}`);
    definitions.push({
      id: `route:chart:${slug}`,
      kind: "visual-prophecy-study",
      file: `charts/${slug}/index.txt`,
      sourcePages: CHART_SOURCE_PAGES[slug],
      interactiveMarker: "{\"items\":[",
    });
  }

  return definitions;
}

export function buildAlignmentItems(root = process.cwd()) {
  const items = [];

  for (const [chapterNumber, expectedCount] of EXPECTED_VERSE_COUNTS) {
    const chapter = loadChapter(root, chapterNumber);
    if (chapter.verses.length !== expectedCount) {
      throw new Error(
        `Daniel ${chapterNumber} has ${chapter.verses.length} verse notes; expected ${expectedCount}`,
      );
    }

    const chapterSurface = reviewedObject(chapter, new Set(["verses", "sources"]));
    items.push(
      item({
        id: `chapter:${chapterNumber}`,
        kind: "chapter-introduction",
        sourcePages: CHAPTER_SOURCE_PAGES[chapterNumber],
        reviewedFields: Object.keys(chapterSurface).sort(),
        payload: chapterSurface,
      }),
    );

    for (const note of chapter.verses) {
      const reviewedNote = reviewedObject(note, NOTE_METADATA_FIELDS);
      items.push(
        item({
          id: `verse:${chapterNumber}:${note.verse}`,
          kind: "verse-note",
          sourcePages: CHAPTER_SOURCE_PAGES[chapterNumber],
          reviewedFields: Object.keys(reviewedNote).sort(),
          payload: reviewedNote,
        }),
      );
    }
  }

  for (const definition of routeDefinitions(root)) {
    items.push(genericRouteItem(root, definition));
  }

  return items.sort((left, right) => left.id.localeCompare(right.id, "en", { numeric: true }));
}

export function buildAlignmentManifest(root = process.cwd()) {
  const items = buildAlignmentItems(root);
  const counts = Object.fromEntries(
    [...new Set(items.map((entry) => entry.kind))]
      .sort()
      .map((kind) => [kind, items.filter((entry) => entry.kind === kind).length]),
  );

  return {
    schemaVersion: 1,
    contentSet: "daniel-public-teaching-surfaces",
    source: SOURCE_STANDARD,
    reviewPolicy: REVIEW_POLICY,
    chapterPhysicalPageMap: CHAPTER_SOURCE_PAGES,
    counts: {
      ...counts,
      totalItems: items.length,
    },
    items,
  };
}

const currentFile = fileURLToPath(import.meta.url);
if (process.argv[1] && resolve(process.argv[1]) === currentFile) {
  const root = resolve(dirname(currentFile), "..");
  const manifest = buildAlignmentManifest(root);
  const output = join(dirname(currentFile), "daniel-sdabc-alignment.manifest.json");

  if (process.argv.includes("--write-manifest")) {
    writeFileSync(output, `${JSON.stringify(manifest, null, 2)}\n`);
    console.log(`Wrote ${basename(output)} with ${manifest.counts.totalItems} reviewed items.`);
  } else {
    console.log(JSON.stringify(manifest.counts, null, 2));
  }
}
