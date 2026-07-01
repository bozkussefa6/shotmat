import AsyncStorage from '@react-native-async-storage/async-storage';
import { normalizePlayer, getAvatarColor } from '../utils/playerAvatar';
import { isDuplicatePlayerName } from '../utils/playerNames';

const KEYS = {
  MAIN_USER: 'shotmat_main_user',
  PLAYERS: 'shotmat_players',
  GAMES: 'shotmat_games',
  CUSTOM_QUESTIONS: 'shotmat_custom_questions',
  SETTINGS: 'shotmat_settings',
};

const DEFAULT_SETTINGS = {
  questionMode: 'system_only',
  language: null,
  isPremium: false,
  onboardingDone: false,
  kvkkAccepted: false,
  soundEnabled: true,
};

const get = async (key) => {
  try {
    const val = await AsyncStorage.getItem(key);
    return val ? JSON.parse(val) : null;
  } catch {
    return null;
  }
};

const set = async (key, value) => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch {}
};

// --- Main User ---
const getMainUser = async () => {
  const user = await get(KEYS.MAIN_USER);
  if (!user) return null;
  if (!user.color) {
    const normalized = normalizePlayer(user);
    await set(KEYS.MAIN_USER, normalized);
    return normalized;
  }
  return user;
};
const saveMainUser = async (user) => {
  const normalized = normalizePlayer(user);
  await set(KEYS.MAIN_USER, normalized);
  return normalized;
};

// --- Settings ---
const getSettings = async () => {
  const saved = await get(KEYS.SETTINGS);
  return { ...DEFAULT_SETTINGS, ...saved };
};
const saveSettings = async (updates) => {
  const current = await getSettings();
  await set(KEYS.SETTINGS, { ...current, ...updates });
};

// --- Players ---
const migratePlayersIfNeeded = async (players) => {
  let changed = false;
  const migrated = players.map((p) => {
    if (p.color && !p.emoji) return p;
    const normalized = normalizePlayer(p);
    if (normalized.color !== p.color || p.emoji) changed = true;
    return normalized;
  });
  if (changed) await set(KEYS.PLAYERS, migrated);
  return migrated;
};

const getPlayers = async () => {
  const raw = (await get(KEYS.PLAYERS)) || [];
  return migratePlayersIfNeeded(raw);
};
const savePlayers = (players) => set(KEYS.PLAYERS, players);

const addPlayer = async (player) => {
  const players = await getPlayers();
  if (isDuplicatePlayerName(player.name, players, player.id)) {
    throw new Error('DUPLICATE_PLAYER_NAME');
  }
  players.push(normalizePlayer(player));
  await savePlayers(players);
};

const updatePlayer = async (id, updates) => {
  const players = await getPlayers();
  if (updates.name && isDuplicatePlayerName(updates.name, players, id)) {
    throw new Error('DUPLICATE_PLAYER_NAME');
  }
  const idx = players.findIndex((p) => p.id === id);
  if (idx !== -1) {
    players[idx] = { ...players[idx], ...updates };
    await savePlayers(players);
  }
};

const deletePlayer = async (id) => {
  const players = await getPlayers();
  const updated = players.map((p) =>
    p.id === id
      ? {
          id: p.id,
          name: 'Silinen Oyuncu',
          color: getAvatarColor('Silinen Oyuncu'),
          deleted: true,
          isMainUser: false,
        }
      : p
  );
  await savePlayers(updated);
};

// --- Games ---
const getGames = async () => (await get(KEYS.GAMES)) || [];
const saveGames = (games) => set(KEYS.GAMES, games);

const addGame = async (game) => {
  const games = await getGames();
  games.unshift(game);
  await saveGames(games);
};

const updateGame = async (id, updates) => {
  const games = await getGames();
  const idx = games.findIndex((g) => g.id === id);
  if (idx !== -1) {
    games[idx] = { ...games[idx], ...updates };
    await saveGames(games);
  }
};

const getGameById = async (id) => {
  const games = await getGames();
  return games.find((g) => g.id === id) || null;
};

// --- Custom Questions ---
const getCustomQuestions = async () => (await get(KEYS.CUSTOM_QUESTIONS)) || [];
const saveCustomQuestions = (questions) => set(KEYS.CUSTOM_QUESTIONS, questions);

const addCustomQuestion = async (question) => {
  const questions = await getCustomQuestions();
  questions.push(question);
  await saveCustomQuestions(questions);
};

const updateCustomQuestion = async (id, updates) => {
  const questions = await getCustomQuestions();
  const idx = questions.findIndex((q) => q.id === id);
  if (idx !== -1) {
    questions[idx] = { ...questions[idx], ...updates };
    await saveCustomQuestions(questions);
  }
};

const deleteCustomQuestion = async (id) => {
  const questions = await getCustomQuestions();
  await saveCustomQuestions(questions.filter((q) => q.id !== id));
};

// --- Reset All ---
const resetAll = async () => {
  await AsyncStorage.multiRemove(Object.values(KEYS));
};

// --- Player Stats Helpers ---
const getPlayerStats = async (playerId) => {
  const games = await getGames();
  const completedGames = games.filter(
    (g) => g.status === 'ended' && g.playerIds.includes(playerId)
  );
  let totalShots = 0;
  let mostPlayedWith = {};

  completedGames.forEach((game) => {
    game.rounds?.forEach((round) => {
      if (!round.skipped && round.shotTakers?.includes(playerId)) {
        totalShots++;
      }
    });
    game.playerIds.forEach((pid) => {
      if (pid !== playerId) {
        mostPlayedWith[pid] = (mostPlayedWith[pid] || 0) + 1;
      }
    });
  });

  const lastGame = completedGames[0];
  const mostPlayedWithId =
    Object.keys(mostPlayedWith).sort(
      (a, b) => mostPlayedWith[b] - mostPlayedWith[a]
    )[0] || null;

  return {
    gamesPlayed: completedGames.length,
    totalShots,
    mostPlayedWithId,
    lastPlayedAt: lastGame?.endedAt || null,
  };
};

const StorageService = {
  KEYS,
  getMainUser,
  saveMainUser,
  getSettings,
  saveSettings,
  getPlayers,
  savePlayers,
  addPlayer,
  updatePlayer,
  deletePlayer,
  getGames,
  saveGames,
  addGame,
  updateGame,
  getGameById,
  getCustomQuestions,
  saveCustomQuestions,
  addCustomQuestion,
  updateCustomQuestion,
  deleteCustomQuestion,
  resetAll,
  getPlayerStats,
};

export default StorageService;
