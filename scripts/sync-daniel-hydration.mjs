import { readdir, readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { extname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const checkOnly = process.argv.includes("--check");
const legacyVersions = ["daniel-study-54", "daniel-study-55", "daniel-study-56"];
const currentVersion = "daniel-study-57";
const originalChapterChunk = "page-d164dc85b7b8428a.js";
const condensedChapterChunk = "page-84dab90387636c10.js";
const signaledChapterChunk = "page-e3a933f4aa672385.js";
const newChapterChunk = "page-c779a684851022a2.js";
const expectedChunkSha256 = "c779a684851022a29252eb9f16664d56552243cc33da995edd8a6486fd4ddc54";
const compatibilityChapterChunks = [
  { filename: originalChapterChunk, sha256: "45e90b16e1995377b07919df8d34ebff8aa4177c36d9ca811d21f4063a4f1ef5" },
  { filename: condensedChapterChunk, sha256: "84dab90387636c10b6c0cbd479374abb456c95b97943e2ab40c6b23227252acb" },
  { filename: signaledChapterChunk, sha256: "e3a933f4aa6723853ee7bd36ba9578de6b5fd98666d16efa9f4412235700a296" },
];
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
const newChunkPath = join(chunkDirectory, newChapterChunk);
const compatibilityChunkPaths = compatibilityChapterChunks.map(({ filename }) => join(chunkDirectory, filename));
let chapterChunk = null;
for (const candidate of [newChunkPath, ...compatibilityChunkPaths]) {
  try {
    chapterChunk = await readFile(candidate, "utf8");
    break;
  } catch {
    // Try the next known generated chunk.
  }
}
if (!chapterChunk) throw new Error("No known Daniel chapter chunk is available to synchronize");

const condensedBranchMarker = "((9!==_.chapterNumber&&11!==_.chapterNumber)||W.verse!==1||Y)&&(null==(c=W.symbolCards)?void 0:c.length)?";
const originalBranchMarker = "(null==(c=W.symbolCards)?void 0:c.length)?";
const branchEndMarker = ":(null==(z=W.symbolNotes)?void 0:z.length)?";
const ssrCompatibleBranchMarker = '(null==(c=W.symbolCards)?void 0:c.length)?((9===_.chapterNumber||11===_.chapterNumber)&&1===W.verse&&!Y?null:';
const condensedRenderer = '(0,r.jsxs)("div",{className:"mt-5 rounded-md border bg-background p-4",children:[(0,r.jsxs)("div",{className:"mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-primary",children:[(0,r.jsx)(b,{className:"h-4 w-4"}),"Symbols and Motifs"]}),(0,r.jsx)("div",{className:(0,y.cn)("space-y-3 text-foreground",Q),children:W.symbolCards.map((e,t)=>(0,r.jsx)("p",{children:k(e.meaning)},"".concat(W.reference,"-symbol-card-").concat(t)))})]})';
const richRenderer = '(0,r.jsxs)("div",{className:"mt-5 rounded-md border bg-background p-5",children:[(0,r.jsxs)("div",{className:"mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-primary",children:[(0,r.jsx)(b,{className:"h-4 w-4"}),"Symbols"]}),(0,r.jsx)("div",{className:"space-y-5",children:W.symbolCards.map(e=>(0,r.jsxs)("div",{className:"border-l-4 border-primary pl-4",children:[(0,r.jsxs)("div",{className:"flex items-center gap-2 font-bold text-primary",children:[(0,r.jsx)(b,{className:"h-4 w-4"}),(0,r.jsx)("h3",{className:"text-base sm:text-lg",children:k(e.symbol)})]}),(0,r.jsx)("p",{className:(0,y.cn)("mt-2 text-foreground",Q),children:k(e.meaning)}),(0,r.jsx)("div",{className:"mt-3 flex flex-wrap gap-2",children:e.references.map(t=>(0,r.jsx)(f.E,{className:"bg-secondary/80",children:t},"".concat(W.reference,"-").concat(e.symbol,"-").concat(t)))})]},"".concat(W.reference,"-").concat(e.symbol)))})]})';
if (!chapterChunk.includes(ssrCompatibleBranchMarker)) {
  const branchStart = chapterChunk.includes(condensedBranchMarker)
    ? chapterChunk.indexOf(condensedBranchMarker)
    : chapterChunk.indexOf(originalBranchMarker);
  const branchEnd = chapterChunk.indexOf(branchEndMarker, branchStart);
  if (branchStart < 0 || branchEnd < 0) throw new Error("Daniel symbol branch markers not found");
  const ssrCompatibleBranch = `${ssrCompatibleBranchMarker}(7===_.chapterNumber||8===_.chapterNumber||9===_.chapterNumber||11===_.chapterNumber)?${condensedRenderer}:${richRenderer})`;
  chapterChunk = `${chapterChunk.slice(0, branchStart)}${ssrCompatibleBranch}${chapterChunk.slice(branchEnd)}`;
}

const stateMarker = "[q,H]=(0,n.useState)(1),P=(0,n.useRef)({})";
const mountedStateMarker = "[q,H]=(0,n.useState)(1),[Y,G]=(0,n.useState)(!1),P=(0,n.useRef)({})";
const effectMarker = "X=new Map(_.passageOutline.map(e=>[e.startVerse,e]));return";
if (!chapterChunk.includes(mountedStateMarker)) {
  if (!chapterChunk.includes(stateMarker) || !chapterChunk.includes(effectMarker)) {
    throw new Error("Daniel mounted-state markers not found");
  }
  chapterChunk = chapterChunk.replace(stateMarker, mountedStateMarker);
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
}

let chapterReferenceFiles = 0;
for (const file of await listRouteArtifacts(root)) {
  let source = await readFile(file, "utf8");
  const before = source;
  for (const { filename: compatibilityChunk } of compatibilityChapterChunks) {
    if (!source.includes(compatibilityChunk)) continue;
    if (checkOnly) throw new Error(`${relative(root, file)} still references compatibility chunk ${compatibilityChunk}`);
    source = source.replaceAll(compatibilityChunk, newChapterChunk);
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
for (const marker of [ssrCompatibleBranchMarker, condensedRenderer, richRenderer]) {
  if (!chapterChunk.includes(marker)) throw new Error("Daniel chapter chunk is missing an SSR-compatible symbol renderer");
}
let compatibilityChunkCount = 0;
for (let index = 0; index < compatibilityChunkPaths.length; index += 1) {
  const definition = compatibilityChapterChunks[index];
  let bytes;
  try {
    bytes = await readFile(compatibilityChunkPaths[index]);
  } catch {
    throw new Error(`Missing immutable Daniel compatibility chunk: ${definition.filename}`);
  }
  const digest = createHash("sha256").update(bytes).digest("hex");
  if (digest !== definition.sha256) {
    throw new Error(`Daniel compatibility chunk ${definition.filename} drifted: ${digest}`);
  }
  compatibilityChunkCount += 1;
}

let safeChapterPages = 0;
const richSymbolChapters = new Set([1, 2, 3, 4, 5, 6, 10, 12]);
const condensedSymbolChapters = new Set([7, 8]);
const symbolShapeCounts = { rich: 0, condensed: 0, deferred: 0 };
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
  const noteStart = source.indexOf('id="note-1"');
  const noteEnd = source.indexOf("</aside>", noteStart);
  if (noteStart < 0 || noteEnd < 0) throw new Error(`Daniel ${chapter} is missing its initial SSR study note`);
  const initialNote = source.slice(noteStart, noteEnd);
  const hasRichSymbols = initialNote.includes(">Symbols</div>") && initialNote.includes("border-l-4 border-primary pl-4");
  const hasCondensedSymbols = initialNote.includes("Symbols and Motifs");
  if (richSymbolChapters.has(chapter) && (!hasRichSymbols || hasCondensedSymbols)) {
    throw new Error(`Daniel ${chapter} must retain the rich SSR symbol-card shape`);
  }
  if (condensedSymbolChapters.has(chapter) && (hasRichSymbols || !hasCondensedSymbols)) {
    throw new Error(`Daniel ${chapter} must retain the condensed SSR symbol shape`);
  }
  if (!richSymbolChapters.has(chapter) && !condensedSymbolChapters.has(chapter) && (hasRichSymbols || hasCondensedSymbols)) {
    throw new Error(`Daniel ${chapter} must defer its initial symbol module until after hydration`);
  }
  if (richSymbolChapters.has(chapter)) symbolShapeCounts.rich += 1;
  else if (condensedSymbolChapters.has(chapter)) symbolShapeCounts.condensed += 1;
  else symbolShapeCounts.deferred += 1;
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

console.log(`${checkOnly ? "Validated" : "Synchronized"} Daniel hydration signaling, ${safeChapterPages} safe chapter pages, ${symbolShapeCounts.rich}/${symbolShapeCounts.condensed}/${symbolShapeCounts.deferred} rich/condensed/deferred SSR symbol shapes, ${versionedFiles} cache-versioned artifacts, ${chapterReferenceFiles} current chapter payloads, and ${compatibilityChunkCount} immutable compatibility chunks.`);
