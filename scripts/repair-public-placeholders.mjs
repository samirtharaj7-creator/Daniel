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
