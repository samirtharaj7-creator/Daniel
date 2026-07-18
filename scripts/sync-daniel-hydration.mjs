import { readdir, readFile, unlink, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { extname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const checkOnly = process.argv.includes("--check");
const legacyVersion = "daniel-study-54";
const currentVersion = "daniel-study-55";
const oldChapterChunk = "page-d164dc85b7b8428a.js";
const newChapterChunk = "page-84dab90387636c10.js";
const expectedChunkSha256 = "84dab90387636c10b6c0cbd479374abb456c95b97943e2ab40c6b23227252acb";

async function listFiles(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (entry.name === ".git") continue;
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await listFiles(path)));
    else if (extname(entry.name) === ".html" || path === join(root, "mbe-unified.js")) files.push(path);
  }
  return files;
}

async function listRouteArtifacts(directory) {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (entry.name === ".git" || entry.name === "_next") continue;
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await listRouteArtifacts(path)));
    else if ([".html", ".txt"].includes(extname(entry.name))) files.push(path);
  }
  return files;
}

let versionedFiles = 0;
for (const file of await listFiles(root)) {
  let source = await readFile(file, "utf8");
  if (source.includes(legacyVersion)) {
    if (checkOnly) throw new Error(`${relative(root, file)} still references ${legacyVersion}`);
    source = source.replaceAll(legacyVersion, currentVersion);
    await writeFile(file, source);
  }
  if (source.includes(currentVersion)) versionedFiles += 1;
}

if (versionedFiles !== 55) {
  throw new Error(`Expected 55 versioned Daniel artifacts; found ${versionedFiles}`);
}

const chunkDirectory = join(root, "_next/static/chunks/app/chapters/[chapter]");
const oldChunkPath = join(chunkDirectory, oldChapterChunk);
const newChunkPath = join(chunkDirectory, newChapterChunk);
let chapterChunk;
try {
  chapterChunk = await readFile(newChunkPath, "utf8");
} catch {
  chapterChunk = await readFile(oldChunkPath, "utf8");
}

const compatibleBranchMarker = "((9!==_.chapterNumber&&11!==_.chapterNumber)||W.verse!==1||Y)&&(null==(c=W.symbolCards)?void 0:c.length)?";
if (!chapterChunk.includes(compatibleBranchMarker)) {
  const branchStartMarker = "(null==(c=W.symbolCards)?void 0:c.length)?";
  const branchEndMarker = ":(null==(z=W.symbolNotes)?void 0:z.length)?";
  const branchStart = chapterChunk.indexOf(branchStartMarker);
  const branchEnd = chapterChunk.indexOf(branchEndMarker, branchStart);
  if (branchStart < 0 || branchEnd < 0) throw new Error("Daniel symbol branch markers not found");
  const compatibleBranch = `${compatibleBranchMarker}(0,r.jsxs)("div",{className:"mt-5 rounded-md border bg-background p-4",children:[(0,r.jsxs)("div",{className:"mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-primary",children:[(0,r.jsx)(b,{className:"h-4 w-4"}),"Symbols and Motifs"]}),(0,r.jsx)("div",{className:(0,y.cn)("space-y-3 text-foreground",Q),children:W.symbolCards.map((e,t)=>(0,r.jsx)("p",{children:k(e.meaning)},"".concat(W.reference,"-symbol-card-").concat(t)))})]})`;
  chapterChunk = `${chapterChunk.slice(0, branchStart)}${compatibleBranch}${chapterChunk.slice(branchEnd)}`;

  const stateMarker = "[q,H]=(0,n.useState)(1),P=(0,n.useRef)({})";
  const effectMarker = "X=new Map(_.passageOutline.map(e=>[e.startVerse,e]));return";
  if (!chapterChunk.includes(stateMarker) || !chapterChunk.includes(effectMarker)) {
    throw new Error("Daniel mounted-state markers not found");
  }
  chapterChunk = chapterChunk.replace(stateMarker, "[q,H]=(0,n.useState)(1),[Y,G]=(0,n.useState)(!1),P=(0,n.useRef)({})");
  chapterChunk = chapterChunk.replace(effectMarker, "X=new Map(_.passageOutline.map(e=>[e.startVerse,e]));return (0,n.useEffect)(()=>G(!0),[]),");
}

if (!checkOnly) {
  await writeFile(newChunkPath, chapterChunk);
  try { await unlink(oldChunkPath); } catch (error) {
    if (error.code !== "ENOENT") throw error;
  }
}

let chapterReferenceFiles = 0;
for (const file of await listRouteArtifacts(root)) {
  let source = await readFile(file, "utf8");
  if (source.includes(oldChapterChunk)) {
    if (checkOnly) throw new Error(`${relative(root, file)} still references ${oldChapterChunk}`);
    source = source.replaceAll(oldChapterChunk, newChapterChunk);
    await writeFile(file, source);
  }
  if (source.includes(newChapterChunk)) chapterReferenceFiles += 1;
}
if (chapterReferenceFiles !== 24) {
  throw new Error(`Expected 24 Daniel chapter chunk references; found ${chapterReferenceFiles}`);
}

const deployedChunk = await readFile(newChunkPath);
const chunkSha256 = createHash("sha256").update(deployedChunk).digest("hex");
if (chunkSha256 !== expectedChunkSha256) {
  throw new Error(`Daniel chapter chunk hash drifted: ${chunkSha256}`);
}
try {
  await readFile(oldChunkPath);
  throw new Error(`Stale Daniel chapter chunk remains: ${oldChapterChunk}`);
} catch (error) {
  if (error.code !== "ENOENT") throw error;
}

const unified = await readFile(join(root, "mbe-unified.js"), "utf8");
for (const guard of [
  "const schedulePageEnhancements = () => window.setTimeout(() =>",
  "}, 500);",
  "window.setTimeout(ensureShell, 500)",
]) {
  if (!unified.includes(guard)) throw new Error(`Missing Daniel hydration guard: ${guard}`);
}
if (/schedulePageEnhancements[\s\S]{0,240}\}, 120\);/.test(unified)) {
  throw new Error("Daniel initial page enhancements can still run before hydration");
}

console.log(`${checkOnly ? "Validated" : "Synchronized"} Daniel hydration timing, ${versionedFiles} cache-versioned artifacts, and ${chapterReferenceFiles} cache-safe chapter payloads.`);
