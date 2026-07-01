export const normalizePlayerName = (name) => name.trim();

const nameKey = (name) => normalizePlayerName(name).toLocaleLowerCase('tr');

export const isDuplicatePlayerName = (name, players, excludeId = null) => {
  const key = nameKey(name);
  if (!key) return false;
  return players.some(
    (p) => !p.deleted && p.id !== excludeId && nameKey(p.name) === key
  );
};
