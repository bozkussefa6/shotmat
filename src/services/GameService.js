import { DEFAULT_QUESTIONS } from '../data/questions';
import StorageService from './StorageService';

const generateId = () =>
  Date.now().toString(36) + Math.random().toString(36).substr(2, 5);

const normalizeQuestion = (q) => ({
  ...q,
  tr: q.tr || q.textTr || '',
  en: q.en || q.textEn || '',
  type: q.type,
});

const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const randomSort = (arr) => [...arr].sort(() => Math.random() - 0.5);

const buildQuestionPool = async (questionMode, selectedTypes) => {
  const systemQuestions = DEFAULT_QUESTIONS.filter((q) =>
    selectedTypes.includes(q.type)
  );

  let pool = [];

  if (questionMode === 'system_only') {
    pool = shuffle([...systemQuestions]);
  } else if (questionMode === 'system_random') {
    pool = randomSort([...systemQuestions]);
  } else if (questionMode === 'mixed') {
    const custom = (await StorageService.getCustomQuestions()).map(normalizeQuestion);
    const filteredCustom = custom.filter((q) => selectedTypes.includes(q.type));
    pool = shuffle([...filteredCustom, ...systemQuestions]);
  } else if (questionMode === 'user_first') {
    const custom = (await StorageService.getCustomQuestions()).map(normalizeQuestion);
    const filteredCustom = custom.filter((q) => selectedTypes.includes(q.type));
    pool = [...shuffle(filteredCustom), ...shuffle(systemQuestions)];
  }

  return pool;
};

const pickRandomPlayer = (playerIds, excludeId = null) => {
  const eligible = excludeId
    ? playerIds.filter((id) => id !== excludeId)
    : playerIds;
  if (eligible.length === 0) return playerIds[0];
  return eligible[Math.floor(Math.random() * eligible.length)];
};

const createGame = async (players, questionMode, selectedTypes) => {
  const questionPool = await buildQuestionPool(questionMode, selectedTypes);
  const game = {
    id: generateId(),
    createdAt: new Date().toISOString(),
    endedAt: null,
    status: 'active',
    playerIds: players.map((p) => p.id),
    selectedTypes,
    questionMode,
    questionPool,
    currentQuestionIndex: 0,
    rounds: [],
    resultImageUri: null,
  };
  await StorageService.addGame(game);
  return game;
};

const abandonActiveGames = async () => {
  const games = await StorageService.getGames();
  const now = new Date().toISOString();
  await Promise.all(
    games
      .filter((g) => g.status === 'active')
      .map((g) =>
        StorageService.updateGame(g.id, { status: 'abandoned', endedAt: now })
      )
  );
};

const getNextQuestion = (game) => {
  const { questionPool, currentQuestionIndex } = game;
  if (currentQuestionIndex >= questionPool.length) return null;
  return normalizeQuestion(questionPool[currentQuestionIndex]);
};

const resolveTargetPlayer = (question, playerIds, lastTargetId = null) => {
  if (question.type === 'group') return null;
  return pickRandomPlayer(playerIds, lastTargetId);
};

const formatQuestionText = (text, playerName) => {
  if (!text) return '';
  return text.replace(/\{\{player\}\}/g, playerName);
};

const completeRound = async (gameId, roundData) => {
  const game = await StorageService.getGameById(gameId);
  if (!game) return null;

  const updatedRounds = [...game.rounds, roundData];
  const updatedGame = {
    ...game,
    rounds: updatedRounds,
    currentQuestionIndex: game.currentQuestionIndex + 1,
  };
  await StorageService.updateGame(gameId, {
    rounds: updatedRounds,
    currentQuestionIndex: updatedGame.currentQuestionIndex,
  });
  return updatedGame;
};

const skipRound = async (gameId, question, targetPlayerId = null) => {
  const normalized = normalizeQuestion(question);
  const roundData = {
    id: generateId(),
    question: { tr: normalized.tr, en: normalized.en, type: normalized.type },
    targetPlayerId,
    shotTakers: [],
    skipped: true,
    timestamp: new Date().toISOString(),
  };
  return completeRound(gameId, roundData);
};

const endGame = async (gameId) => {
  const now = new Date().toISOString();
  await StorageService.updateGame(gameId, {
    status: 'ended',
    endedAt: now,
  });
};

const calculateShotCounts = (game) => {
  const counts = {};
  game.playerIds.forEach((id) => (counts[id] = 0));
  game.rounds.forEach((round) => {
    if (!round.skipped) {
      round.shotTakers?.forEach((id) => {
        counts[id] = (counts[id] || 0) + 1;
      });
    }
  });
  return counts;
};

const getWinner = (game) => {
  const counts = calculateShotCounts(game);
  let maxShots = 0;
  Object.values(counts).forEach((shots) => {
    if (shots > maxShots) maxShots = shots;
  });
  if (maxShots === 0) return { winnerId: null, maxShots: 0, winnerIds: [] };
  const winnerIds = Object.entries(counts)
    .filter(([, shots]) => shots === maxShots)
    .map(([id]) => id);
  return { winnerId: winnerIds[0], maxShots, winnerIds };
};

const GameService = {
  generateId,
  createGame,
  buildQuestionPool,
  abandonActiveGames,
  getNextQuestion,
  resolveTargetPlayer,
  formatQuestionText,
  completeRound,
  skipRound,
  endGame,
  calculateShotCounts,
  getWinner,
  shuffle,
  normalizeQuestion,
};

export default GameService;
