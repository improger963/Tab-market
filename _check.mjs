// Final verification scan.
import fs from 'node:fs';
import path from 'node:path';

function walk(dir, exts, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (['node_modules', 'dist', '.next', '.git'].includes(e.name)) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, exts, out);
    else if (exts.some((x) => e.name.endsWith(x))) out.push(p);
  }
  return out;
}

const files = walk('.', ['.ts', '.tsx', '.html', '.css', '.mjs']);
let cyr = 0;
for (const f of files) {
  const t = fs.readFileSync(f, 'utf8');
  const lines = t.split('\n');
  for (const [i, l] of lines.entries()) {
    for (let k = 0; k < l.length; k++) {
      const c = l.codePointAt(k);
      if (c >= 0x0400 && c <= 0x04ff) {
        console.log(`CYRILLIC: ${f}:${i + 1}: ${l.slice(0, 100)}`);
        cyr++;
        break;
      }
    }
  }
}
console.log('TOTAL_LINES_WITH_CYRILLIC=', cyr);

// Phase 2 grep gate for customer-visible strings
const banned = ['ERP', 'ArmSoft', 'Sync Ready', 'SPECIFICATIONS', 'բdelays'];
const hts = String.fromCodePoint(0x0540, 0x053e); // HԾ
const bron = String.fromCodePoint(0x0562, 0x057c, 0x0578, 0x0576, 0x0575, 0x0561); // delays
const hits = [];
for (const f of files) {
  if (f.includes('node_modules') || f.includes('_apply') || f.includes('_dump') || f.includes('_check') || f.includes('dist/')) continue;
  const t = fs.readFileSync(f, 'utf8');
  const lines = t.split('\n');
  for (const [i, l] of lines.entries()) {
    for (const b of banned) if (l.includes(b)) { hits.push(`${f}:${i+1} ${b}`); break; }
    if (l.includes(hts)) { hits.push(`${f}:${i+1} ՀԾ`); continue; }
    if (l.includes(bron)) { hits.push(`${f}:${i+1} բronя`); }
  }
}
console.log('---PHASE 2 GREP HITS (internal strings):');
for (const h of hits) console.log(h);
console.log('TOTAL=', hits.length);
