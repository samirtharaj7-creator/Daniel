import { readdir, readFile, unlink, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { extname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const checkOnly = process.argv.includes("--check");
const legacyVersions = ["daniel-study-54", "daniel-study-55"];
const currentVersion = "daniel-study-56";
const oldChapterChunk = "page-d164dc85b7b8428a.js";
const priorChapterChunk = "page-84dab90387636c10.js";
const newChapterChunk = "page-e3a933f4aa672385.js";
const expectedChunkSha256 = "e3a933f4aa6723853ee7bd36ba9578de6b5fd98666d16efa9f4412235700a296";
const immediateYearScript = "<script>document.querySelectorAll('[data-mbe-year]').forEach((node) => { node.textContent = new Date().getFullYear(); });</script>";

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
  for (const legacyVersion of legacyVersions) {
    if (!source.includes(legacyVersion)) continue;
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
const priorChunkPath = join(chunkDirectory, priorChapterChunk);
const newChunkPath = join(chunkDirectory, newChapterChunk);
let chapterChunk;
try {
  chapterChunk = await readFile(newChunkPath, "utf8");
} catch {
  try {
    chapterChunk = await readFile(priorChunkPath, "utf8");
  } catch {
    chapterChunk = await readFile(oldChunkPath, "utf8");
  }
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

const legacyHydrationEffect = '(0,n.useEffect)(()=>G(!0),[])';
const hydrationReadyEffect = '(0,n.useEffect)(()=>{G(!0),document.documentElement.dataset.danielHydrated="true",window.dispatchEvent(new Event("daniel:hydrated"))},[])';
if (!chapterChunk.includes(hydrationReadyEffect)) {
  if (!chapterChunk.includes(legacyHydrationEffect)) {
    throw new Error("Daniel hydration-ready effect marker not found");
  }
  chapterChunk = chapterChunk.replace(legacyHydrationEffect, hydrationReadyEffect);
}
if ((chapterChunk.match(/daniel:hydrated/g) ?? []).length !== 1) {
  throw new Error("Daniel hydration-ready signal must occur exactly once in the chapter chunk");
}

if (!checkOnly) {
  await writeFile(newChunkPath, chapterChunk);
  for (const stalePath of [oldChunkPath, priorChunkPath]) {
    try { await unlink(stalePath); } catch (error) {
      if (error.code !== "ENOENT") throw error;
    }
  }
}

let chapterReferenceFiles = 0;
for (const file of await listRouteArtifacts(root)) {
  let source = await readFile(file, "utf8");
  const before = source;
  for (const staleChunk of [oldChapterChunk, priorChapterChunk]) {
    if (!source.includes(staleChunk)) continue;
    if (checkOnly) throw new Error(`${relative(root, file)} still references ${staleChunk}`);
    source = source.replaceAll(staleChunk, newChapterChunk);
  }
  if (!checkOnly && source !== before) await writeFile(file, source);
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
try {
  await readFile(priorChunkPath);
  throw new Error(`Stale Daniel chapter chunk remains: ${priorChapterChunk}`);
} catch (error) {
  if (error.code !== "ENOENT") throw error;
}

let safeChapterPages = 0;
for (let chapter = 1; chapter <= 12; chapter += 1) {
  const file = join(root, "chapters", String(chapter), "index.html");
  const payloadFile = join(root, "chapters", String(chapter), "index.txt");
  let source = await readFile(file, "utf8");
  if (source.includes(immediateYearScript)) {
    if (checkOnly) throw new Error(`chapters/${chapter}/index.html still mutates footer text before hydration`);
    source = source.replaceAll(immediateYearScript, "");
    await writeFile(file, source);
  }
  const payload = await readFile(payloadFile, "utf8");
  const htmlChunkReferences = source.split(newChapterChunk).length - 1;
  const payloadChunkReferences = payload.split(newChapterChunk).length - 1;
  if (htmlChunkReferences !== 2 || payloadChunkReferences !== 1) {
    throw new Error(
      `Daniel ${chapter} must reference the hydration-signaling chunk twice in HTML and once in its payload; found ${htmlChunkReferences} and ${payloadChunkReferences}`,
    );
  }
  if (source.includes(immediateYearScript)) {
    throw new Error(`chapters/${chapter}/index.html retains an immediate footer text mutation`);
  }
  safeChapterPages += 1;
}
if (safeChapterPages !== 12) throw new Error(`Expected 12 hydration-safe Daniel chapter pages; found ${safeChapterPages}`);

const unified = await readFile(join(root, "mbe-unified.js"), "utf8");
for (const guard of [
  "function whenDanielHydrationReady(callback)",
  "document.documentElement.dataset.danielHydrated === 'true'",
  "window.addEventListener('daniel:hydrated', callback, { once: true })",
  "whenDanielHydrationReady(startLogoGuard)",
]) {
  if (!unified.includes(guard)) throw new Error(`Missing Daniel hydration guard: ${guard}`);
}
if (/schedulePageEnhancements[\s\S]{0,240}\}, (?:120|500)\);/.test(unified)) {
  throw new Error("Daniel initial page enhancements still rely on a hydration timing guess");
}

console.log(`${checkOnly ? "Validated" : "Synchronized"} Daniel hydration signaling, ${safeChapterPages} safe chapter pages, ${versionedFiles} cache-versioned artifacts, and ${chapterReferenceFiles} cache-safe chapter payloads.`);
