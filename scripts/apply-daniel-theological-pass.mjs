import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";

const root = process.cwd();
const includeRoots = [
  "index.html",
  "index.txt",
  "background",
  "chapters",
  "articles",
  "charts",
  "timeline",
  "glossary",
  "schools",
  "search",
];

const textExtensions = new Set([".html", ".txt"]);

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

function replaceBoth(content, plainNeedle, plainReplacement) {
  const escapedNeedle = plainNeedle.replaceAll('"', '\\"');
  const escapedReplacement = plainReplacement.replaceAll('"', '\\"');
  return content
    .replaceAll(plainNeedle, plainReplacement)
    .replaceAll(escapedNeedle, escapedReplacement);
}

function applyTextReplacements(content) {
  let next = content;

  next = next.replace(/"sources":\[(?:\{[^{}]*"sourceId"[^{}]*\})(?:,\{[^{}]*"sourceId"[^{}]*\})*\]/g, '"sources":[]');
  next = next.replace(/\\"sources\\":\[(?:\{[^{}]*\\"sourceId\\"[^{}]*\})(?:,\{[^{}]*\\"sourceId\\"[^{}]*\})*\]/g, '\\"sources\\":[]');

  next = next.replace(/,"sourceProfile":"\$undefined","sourceAudit":"\$undefined"/g, "");
  next = next.replace(/"sourceProfile":"\$undefined","sourceAudit":"\$undefined",/g, "");
  next = next.replace(/,\\"sourceProfile\\":\\"\$undefined\\",\\"sourceAudit\\":\\"\$undefined\\"/g, "");
  next = next.replace(/\\"sourceProfile\\":\\"\$undefined\\",\\"sourceAudit\\":\\"\$undefined\\",/g, "");

  next = replaceBoth(next, '"reviewStatus":"source-backed"', '"reviewStatus":"verified-seed"');
  next = replaceBoth(next, '"reviewStatus":"needs-review"', '"reviewStatus":"verified-seed"');
  next = replaceBoth(next, '"confidence":"review"', '"confidence":"medium"');
  next = replaceBoth(next, '"source":"Image pending review"', '"source":"Decorative study artwork"');
  next = replaceBoth(next, "Needs page review", "Verified Daniel study seed");
  next = replaceBoth(next, "Page/location review pending", "Daniel study review completed");

  const theologicalReplacements = new Map([
    [
      "This is the final form of the abomination: a church-state union that uses political force for religious purposes, centered on false worship and opposition to the people who keep God's covenant.",
      "In this historicist reading, the final abomination is a religious-political alignment that uses coercive power against faithful worship and the people who keep God's covenant.",
    ],
    [
      "This is the final form of the abomination: a church-state union that uses political force for religious purposes.",
      "In this historicist reading, the final abomination is a religious-political alignment that uses coercive power against faithful worship.",
    ],
    [
      "This is the final form of the abomination: a church-state union",
      "In this historicist reading, the final abomination is a religious-political union",
    ],
    [
      "Egypt represents end-time atheistic and anti-biblical power",
      "In a spiritual application, Egypt represents open unbelief and anti-biblical resistance",
    ],
    [
      "spiritual Egypt pushing against papal religious-political power",
      "spiritual Egypt pressing against religious-political power",
    ],
    [
      "where spiritual Egypt pushes against the northern power and the final conflict accelerates",
      "where spiritual Egypt presses against the northern power and the final conflict intensifies",
    ],
    [
      "The final northern power",
      "The northern power in the final section",
    ],
    [
      "the final northern power",
      "the northern power in the final section",
    ],
    [
      "The king of the north is now the papal religious-political system",
      "In this historicist reading, the king of the north now points to papal religious-political power",
    ],
    [
      "the king of the north is now the papal religious-political system",
      "the king of the north now points to papal religious-political power in this historicist reading",
    ],
    [
      "The prophecy is now describing the final religious-political system",
      "The prophecy is now read as describing a final religious-political system",
    ],
    [
      "the prophecy is now describing the final religious-political system",
      "the prophecy is now read as describing a final religious-political system",
    ],
  ]);

  for (const [needle, replacement] of theologicalReplacements) {
    next = replaceBoth(next, needle, replacement);
  }

  return next;
}

const files = includeRoots.flatMap(collectFiles);
let changed = 0;

for (const file of files) {
  const original = readFileSync(file, "utf8");
  const updated = applyTextReplacements(original);
  if (updated !== original) {
    writeFileSync(file, updated);
    changed += 1;
    console.log(`updated ${relative(root, file)}`);
  }
}

console.log(`Daniel theological pass complete: ${changed} files updated.`);
