#!/usr/bin/env node
/**
 * Parse docs/QUESTIONS_DRAFT.md → src/data/questions.js
 * Run only after user approval: node scripts/apply-questions-draft.js
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DRAFT = path.join(ROOT, 'docs/QUESTIONS_DRAFT.md');
const OUT = path.join(ROOT, 'src/data/questions.js');

const md = fs.readFileSync(DRAFT, 'utf8');
const questions = [];

const blockRe = /^### (g\d+|p\d+|d\d+) · (group|personal|dare)\n- \*\*TR:\*\* (.+)\n- \*\*EN:\*\* (.+)/gm;
let m;
while ((m = blockRe.exec(md)) !== null) {
  questions.push({
    id: m[1],
    type: m[2],
    tr: m[3].trim(),
    en: m[4].trim(),
  });
}

if (questions.length !== 100) {
  console.error(`Expected 100 questions, parsed ${questions.length}`);
  process.exit(1);
}

const body = questions
  .map((q) => {
    const tr = q.tr.replace(/'/g, "\\'");
    const en = q.en.replace(/'/g, "\\'");
    return `  {
    id: '${q.id}',
    type: '${q.type}',
    tr: '${tr}',
    en: '${en}',
  }`;
  })
  .join(',\n');

const file = `// 100 default questions — ShotMat v2 draft (applied from docs/QUESTIONS_DRAFT.md)
// type: 'group' | 'personal' | 'dare'
// {{player}} placeholder is replaced at runtime

export const DEFAULT_QUESTIONS = [
${body},
];

export const QUESTION_COUNT_BY_TYPE = {
  group: DEFAULT_QUESTIONS.filter((q) => q.type === 'group').length,
  personal: DEFAULT_QUESTIONS.filter((q) => q.type === 'personal').length,
  dare: DEFAULT_QUESTIONS.filter((q) => q.type === 'dare').length,
};
`;

fs.writeFileSync(OUT, file);
console.log(`Wrote ${questions.length} questions to ${OUT}`);
