#!/usr/bin/env node

import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const root = new URL("../", import.meta.url).pathname;

function update(relativePath, replacements) {
  const file = join(root, relativePath);
  let text = readFileSync(file, "utf8");
  const before = text;
  for (const [from, to] of replacements) text = text.split(from).join(to);
  if (text !== before) writeFileSync(file, text);
}

function occurrenceCount(text, needle) {
  return text.split(needle).length - 1;
}

function escapeRegExp(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
}

function decodeHtmlText(text) {
  const namedEntities = new Map([
    ["amp", "&"],
    ["apos", "'"],
    ["gt", ">"],
    ["lt", "<"],
    ["nbsp", " "],
    ["quot", '"']
  ]);

  return text
    .replace(/<[^>]+>/gu, "")
    .replace(/&(#x[\da-f]+|#\d+|amp|apos|gt|lt|nbsp|quot);/giu, (_, entity) => {
      if (entity.startsWith("#x") || entity.startsWith("#X")) {
        return String.fromCodePoint(Number.parseInt(entity.slice(2), 16));
      }
      if (entity.startsWith("#")) {
        return String.fromCodePoint(Number.parseInt(entity.slice(1), 10));
      }
      return namedEntities.get(entity.toLowerCase());
    })
    .replace(/\s+/gu, " ")
    .trim();
}

function embeddedJson(serialized) {
  return JSON.stringify(serialized).slice(1, -1);
}

function embeddedHtmlJson(serialized) {
  return embeddedJson(serialized)
    .replaceAll("&", "\\u0026")
    .replaceAll("<", "\\u003c")
    .replaceAll(">", "\\u003e");
}

function synchronizeFlightHeading(text, fromTag, heading, escaped, label) {
  const from = JSON.stringify(["$", fromTag, null, {
    className: heading.className,
    children: heading.text
  }]);
  const to = JSON.stringify(["$", "h1", null, {
    className: heading.className,
    children: heading.text
  }]);
  const source = escaped ? embeddedHtmlJson(from) : from;
  const target = escaped ? embeddedHtmlJson(to) : to;
  const sourceCount = occurrenceCount(text, source);
  const targetCount = occurrenceCount(text, target);

  if (sourceCount === 1 && targetCount === 0) return text.replace(source, target);
  if (sourceCount === 0 && targetCount === 1) return text;
  throw new Error(
    `${label}: expected one ${fromTag} source or one repaired h1 descriptor; found ${sourceCount} source and ${targetCount} repaired descriptors.`
  );
}

function promoteClientRenderedHeading(txt, heading, marker) {
  if (!txt.includes(`\"${marker}\"`)) {
    throw new Error(`charts/daniel-11/index.txt: missing ${marker} client-component marker.`);
  }

  const routeChunkMatch = txt.match(/"(static\/chunks\/app\/charts\/%5Bchart%5D\/page-[^"/]+\.js)"/u);
  if (!routeChunkMatch) {
    throw new Error("charts/daniel-11/index.txt: unable to locate the generated route chunk.");
  }

  const relativeChunk = `_next/${decodeURIComponent(routeChunkMatch[1])}`;
  const chunkFile = join(root, relativeChunk);
  let chunk = readFileSync(chunkFile, "utf8");
  const textLiteral = JSON.stringify(heading.text);
  const classLiteral = JSON.stringify(heading.className);
  const sourcePattern = new RegExp(
    `\\(0,([A-Za-z_$][\\w$]*\\.jsx)\\)\\([A-Za-z_$][\\w$]*\\.ZB,\\{className:\"[^\"]*\",children:${escapeRegExp(textLiteral)}\\}\\)`,
    "gu"
  );
  const targetPattern = new RegExp(
    `\\(0,[A-Za-z_$][\\w$]*\\.jsx\\)\\(\"h1\",\\{className:${escapeRegExp(classLiteral)},children:${escapeRegExp(textLiteral)}\\}\\)`,
    "gu"
  );
  const sourceMatches = chunk.match(sourcePattern) ?? [];
  const targetMatches = chunk.match(targetPattern) ?? [];

  if (sourceMatches.length === 1 && targetMatches.length === 0) {
    chunk = chunk.replace(
      sourcePattern,
      (_, jsxFactory) => `(0,${jsxFactory})(\"h1\",{className:${classLiteral},children:${textLiteral}})`
    );
    writeFileSync(chunkFile, chunk);
    return;
  }
  if (sourceMatches.length === 0 && targetMatches.length === 1) return;
  throw new Error(
    `${relativeChunk}: expected one ${marker} CardTitle source or one repaired h1; found ${sourceMatches.length} source and ${targetMatches.length} repaired headings.`
  );
}

function promoteFirstMeaningfulHeading(route, fromTag, options = {}) {
  const htmlPath = `${route}/index.html`;
  const txtPath = `${route}/index.txt`;
  const htmlFile = join(root, htmlPath);
  const txtFile = join(root, txtPath);
  let html = readFileSync(htmlFile, "utf8");
  let txt = readFileSync(txtFile, "utf8");
  const mainStart = html.indexOf("<main");

  if (mainStart < 0) throw new Error(`${htmlPath}: missing main element.`);
  const match = html.slice(mainStart).match(/<h([1-6])\b([^>]*)>([\s\S]*?)<\/h\1>/u);
  if (!match) throw new Error(`${htmlPath}: missing a meaningful heading inside main.`);

  const currentTag = `h${match[1]}`;
  if (currentTag !== fromTag && currentTag !== "h1") {
    throw new Error(`${htmlPath}: expected first heading ${fromTag} or h1; found ${currentTag}.`);
  }

  const classMatch = match[2].match(/\bclass=(['"])(.*?)\1/u);
  if (!classMatch) throw new Error(`${htmlPath}: first heading is missing its class attribute.`);
  const heading = {
    className: classMatch[2],
    text: decodeHtmlText(match[3])
  };
  if (!heading.text) throw new Error(`${htmlPath}: first heading has no visible wording.`);

  const headingStart = mainStart + match.index;
  const repairedMarkup = match[0]
    .replace(/^<h[1-6]\b/u, "<h1")
    .replace(/<\/h[1-6]>$/u, "</h1>");
  html = `${html.slice(0, headingStart)}${repairedMarkup}${html.slice(headingStart + match[0].length)}`;

  if (options.clientComponent) {
    promoteClientRenderedHeading(txt, heading, options.clientComponent);
  } else {
    html = synchronizeFlightHeading(html, fromTag, heading, true, htmlPath);
    txt = synchronizeFlightHeading(txt, fromTag, heading, false, txtPath);
  }

  writeFileSync(htmlFile, html);
  writeFileSync(txtFile, txt);
}

const overviewReplacements = [
  ["Coming soon", "Passage study"],
  [
    "The Daniel 7 visual is not ready yet. The passage commentary is available now, and the visual board will be added later.",
    "Trace the four beasts, the little horn, the heavenly judgment, the Son of Man, and the kingdom given to the saints."
  ]
];

for (const file of ["index.html", "index.txt", "charts/index.html", "charts/index.txt"]) {
  update(file, overviewReplacements);
}

const chartReplacements = [
  ["Daniel 7 Visual Coming Soon | Daniel Study Platform", "Daniel 7 Study | Daniel Study Platform"],
  ["The Daniel 7 visual prophecy page is being prepared.", "A concise Daniel 7 study of the beasts, heavenly judgment, Son of Man, and everlasting kingdom."],
  ["Coming soon", "Daniel 7 study"],
  ["Daniel 7 visual is coming soon.", "Daniel 7: beasts, judgment, and the Son of Man"],
  [
    "The dedicated Daniel 7 visual board is not ready yet. It will eventually trace the four beasts, the ten horns, the little horn, the heavenly judgment, the Son of Man, and the kingdom given to the saints. For now, the full Daniel 7 Study Notes are available in the passage reader.",
    "Daniel 7 moves from four earthly empires to the little horn’s attack on God’s people, then opens the heavenly court where judgment is given and the Son of Man receives an everlasting kingdom. Use the full Daniel 7 Study Notes to follow each symbol in its biblical setting."
  ]
];

for (const file of ["charts/daniel-7/index.html", "charts/daniel-7/index.txt"]) {
  update(file, chartReplacements);
}

for (const route of [
  "articles",
  "charts/daniel-2",
  "charts/daniel-8",
  "charts/daniel-8-9",
  "charts/daniel-9",
  "charts",
  "schools"
]) {
  promoteFirstMeaningfulHeading(route, "h2");
}

promoteFirstMeaningfulHeading("charts/daniel-11", "h3", {
  clientComponent: "Daniel11VerticalTimeline"
});

const chapterFiles = [
  ...Array.from({ length: 12 }, (_, index) => `chapters/${index + 1}`)
    .flatMap((directory) => [`${directory}/index.html`, `${directory}/index.txt`]),
  "charts/daniel-11/index.html",
  "charts/daniel-11/index.txt"
];

for (const file of chapterFiles) {
  const path = join(root, file);
  let text = readFileSync(path, "utf8");
  const before = text;
  text = text.replaceAll('"Ezekiel 1:28-2",', '"Ezekiel 1:28-2:2",');
  text = text.replaceAll('\\"Ezekiel 1:28-2\\",', '\\"Ezekiel 1:28-2:2\\",');
  text = text.replaceAll("Nebuchadnezzar Nebuchadnezzar dreamed dreams", "Nebuchadnezzar dreamed dreams");
  text = text.replaceAll("nor his fathers fathers", "nor his fathers' fathers");
  text = text.replace(/"images":\[\{"title":"[^"]*image placeholder","alt":"[^"]*","source":"[^"]*"\}\]/gu, '"images":[]');
  text = text.replace(/\\"images\\":\[\{\\"title\\":\\"[^"\\]*image placeholder\\",\\"alt\\":\\"[^"\\]*\\",\\"source\\":\\"[^"\\]*\\"\}\]/gu, '\\"images\\":[]');
  if (text !== before) writeFileSync(path, text);
}

console.log("Daniel public placeholder repair complete.");
