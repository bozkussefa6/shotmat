/**
 * Locale-aware date formatting for display strings.
 */
export const getDateLocale = (language) => {
  if (language === 'tr') return 'tr-TR';
  if (language === 'en') return 'en-US';
  return language || 'tr-TR';
};

export const formatDate = (iso, language, options = {}) => {
  if (!iso) return '';
  const d = new Date(iso);
  const locale = getDateLocale(language);
  const defaults = { day: 'numeric', month: 'long' };
  return d.toLocaleDateString(locale, { ...defaults, ...options });
};

export const formatDateWithYear = (iso, language) =>
  formatDate(iso, language, { day: 'numeric', month: 'long', year: 'numeric' });
