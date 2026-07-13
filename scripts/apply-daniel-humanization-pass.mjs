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

function replaceBoth(content, needle, replacement) {
  const escapedNeedle = needle.replaceAll('"', '\\"');
  const escapedReplacement = replacement.replaceAll('"', '\\"');
  return content.replaceAll(needle, replacement).replaceAll(escapedNeedle, escapedReplacement);
}

const replacements = [
  ["This verse also shows", "The wording also shows"],
  ["This verse shows", "The wording shows"],
  ["This verse gives", "The line gives"],
  ["This verse introduces", "The line introduces"],
  ["This verse matters", "The line matters"],
  ["This verse warns", "The warning"],
  ["This verse calls", "The passage calls"],
  ["This verse presses", "The wording presses"],
  ["This verse belongs", "The line belongs"],
  ["This verse therefore", "The wording therefore"],
  ["This verse directly", "The line directly"],
  ["This verse", "The line"],
  ["The verse also shows", "The wording also shows"],
  ["The verse shows", "The wording shows"],
  ["The verse gives", "The line gives"],
  ["The verse introduces", "The line introduces"],
  ["The verse matters", "The line matters"],
  ["The verse warns", "The warning"],
  ["The verse calls", "The passage calls"],
  ["The verse presses", "The wording presses"],
  ["The verse belongs", "The line belongs"],
  ["The verse therefore", "The wording therefore"],
  ["The verse directly", "The line directly"],
  ["The verse", "The line"],
  ["this verse", "the line"],
  ["the verse", "the line"],
  ["This chapter", "This passage"],
  ["The chapter", "The passage"],
  ["this chapter", "this passage"],
  ["the chapter", "the passage"],
  ["The point is that", "The focus is that"],
  ["The point is", "The focus is"],
  ["the point is that", "the focus is that"],
  ["the point is", "the focus is"],
  ["The issue is not", "The central issue is not"],
  ["The issue is", "The central issue is"],
  ["the issue is not", "the central issue is not"],
  ["the issue is", "the central issue is"],
  ["At the same time,", "Still,"],
  ["At the same time", "Still"],
  ["at the same time,", "still,"],
  ["at the same time", "still"],
  ["This does not mean", "That does not imply"],
  ["does not mean", "does not imply"],
  ["This also", "It also"],
  ["This shows", "The wording shows"],
  ["The practical result is", "The result is"],
  ["The practical burden is", "The burden is"],
  ["The practical application is", "For practice,"],
  ["The practical", "The lived"],
  ["The lesson is", "The pastoral weight is"],
  ["The lesson", "The pastoral weight"],
  ["the practical", "the lived"],
  ["the lesson is", "the pastoral weight is"],
  ["the lesson", "the pastoral weight"],
  ["is not merely", "is more than"],
  ["are not merely", "are more than"],
  ["was not merely", "was more than"],
  ["were not merely", "were more than"],
  ["does not merely", "does more than"],
  ["do not merely", "do more than"],
  ["did not merely", "did more than"],
  ["not merely", "more than"],
  ["is not only", "is more than"],
  ["are not only", "are more than"],
  ["was not only", "was more than"],
  ["were not only", "were more than"],
  ["does not only", "does more than"],
  ["do not only", "do more than"],
  ["did not only", "did more than"],
  ["not only", "more than"],
  ["Not only the kingdom but the king himself has been examined.", "Both the kingdom and the king himself have been examined."],
  ["The warning leaders and followers alike.", "The warning reaches leaders and followers alike."],
  ["The warning against weaponizing law to destroy the righteous.", "The passage warns against weaponizing law to destroy the righteous."],
  ["The warning against reading success as proof of health.", "The passage warns against reading success as proof of health."],
  ["The warning against mistaking reach for righteousness.", "The passage warns against mistaking reach for righteousness."],
  [
    "The warning that the most dangerous corruptions of faith do not always arrive with obvious hostility.",
    "The passage warns that the most dangerous corruptions of faith do not always arrive with obvious hostility.",
  ],
  [
    "The warning that religious beauty can become dangerous when it hides dependence on force.",
    "The passage warns that religious beauty can become dangerous when it hides dependence on force.",
  ],
];

const files = includeRoots.flatMap(collectFiles);
let changed = 0;

for (const file of files) {
  const original = readFileSync(file, "utf8");
  let updated = original;
  for (const [needle, replacement] of replacements) {
    updated = replaceBoth(updated, needle, replacement);
  }

  if (updated !== original) {
    writeFileSync(file, updated);
    changed += 1;
    console.log(`humanized ${relative(root, file)}`);
  }
}

console.log(`Daniel humanization pass complete: ${changed} files updated.`);
