export const getQuestionText = (q, lang = 'tr') => {
  if (!q) return '';
  const primary =
    lang === 'tr' ? q.tr || q.textTr : q.en || q.textEn;
  return primary || q.tr || q.en || q.textTr || q.textEn || '';
};
