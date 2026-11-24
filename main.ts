// Seventeen Syllables of Debugging — one haiku about debugging, 5-7-5.
//   cursor blinks at three             (5 syllables)
//   the log line swears it worked fine (7 syllables)
//   but it never did                   (5 syllables)
// A cursor blinking at 3am, a log line that swears it worked, and the
// turn: it never did.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const LINES = [
  "cursor blinks at three",
  "the log line swears it worked fine",
  "but it never did",
];

// Syllable count per word: vowel groups, minus a silent trailing "e"
// (except "-le"), at least one per word. Exact for every word here.
function syllablesOf(word: string): number {
  const w = word.toLowerCase().replace(/[^a-z]/g, "");
  if (!w) return 0;
  const groups = w.match(/[aeiouy]+/g) ?? [];
  let n = groups.length;
  if (w.endsWith("e") && !w.endsWith("le") && n > 1) n -= 1;
  // Silent "-ed": worked, blinked — the "e" is not a syllable unless the
  // word ends in "-ted" / "-ded" (wanted, needed).
  if (w.endsWith("ed") && !/[td]ed$/.test(w) && n > 1) n -= 1;
  return Math.max(1, n);
}

function countSyllables(line: string): number {
  return line.split(/\s+/).reduce((sum, w) => sum + syllablesOf(w), 0);
}

const HAIKU = LINES.join("\n");

// Gate: three lines, 5-7-5 syllables, 1-200 characters, non-blank.
const counts = LINES.map(countSyllables);
if (LINES.length !== 3) throw new Error(`expected 3 lines, got ${LINES.length}`);
if (counts[0] !== 5 || counts[1] !== 7 || counts[2] !== 5) {
  throw new Error(`expected 5-7-5 syllables, got ${counts.join("-")}`);
}
if ([...HAIKU].length > 200 || HAIKU.trim().length === 0) {
  throw new Error("entry must be 1-200 non-blank characters");
}

const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
mkdirSync(outDir, { recursive: true });
const outPath = join(outDir, "entry.txt");
writeFileSync(outPath, HAIKU, "utf8");

// Read-back verification: what was written is exactly the haiku.
const back = readFileSync(outPath, "utf8");
if (back !== HAIKU) throw new Error("read-back mismatch");
console.log(
  `wrote ${outPath} (${[...HAIKU].length} code points, syllables ${counts.join("-")}), verified: ${JSON.stringify(back)}`,
);
