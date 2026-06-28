import React, { useEffect, useState, useRef } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';

import {
  Colors,
  Spacing,
  Typography,
  BorderRadius,
  Buttons,
  Layout,
  TypeColors,
  Shadows,
} from '../styles/GlobalStyles';
import StorageService from '../services/StorageService';
import GameService from '../services/GameService';
import ShotBadge from '../components/ShotBadge';
import SoundService from '../services/SoundService';

export default function EvaluationScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const route = useRoute();
  const { gameId, targetPlayerId, questionType } = route.params || {};

  const [game, setGame] = useState(null);
  const [players, setPlayers] = useState([]);
  const [shotTakers, setShotTakers] = useState([]);
  const [dareCompleted, setDareCompleted] = useState(null);
  const [question, setQuestion] = useState(null);
  const [targetPlayer, setTargetPlayer] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [g, playerList] = await Promise.all([
      StorageService.getGameById(gameId),
      StorageService.getPlayers(),
    ]);
    if (!g) return;
    setGame(g);
    const q = GameService.getNextQuestion(g);
    setQuestion(q);

    const gamePlayers = playerList.filter((p) => g.playerIds.includes(p.id));
    setPlayers(gamePlayers);

    if (targetPlayerId) {
      const tp = playerList.find((p) => p.id === targetPlayerId);
      setTargetPlayer(tp || null);
    }
  };

  const toggleShotTaker = async (playerId) => {
    const willAdd = !shotTakers.includes(playerId);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (willAdd) SoundService.play('shot');
    setShotTakers((prev) =>
      prev.includes(playerId) ? prev.filter((id) => id !== playerId) : [...prev, playerId]
    );
  };

  const handleDareResult = async (completed) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (!completed) SoundService.play('shot');
    setDareCompleted(completed);
    if (!completed && targetPlayerId) {
      setShotTakers([targetPlayerId]);
    } else {
      setShotTakers([]);
    }
  };

  const handleContinue = async () => {
    if (!question) return;
    const roundData = {
      id: GameService.generateId(),
      question: { tr: question.tr, en: question.en, type: question.type },
      targetPlayerId: targetPlayerId || null,
      shotTakers,
      skipped: false,
      dareCompleted: questionType === 'dare' ? dareCompleted : undefined,
      timestamp: new Date().toISOString(),
    };
    await GameService.completeRound(gameId, roundData);
    navigation.replace('QuestionTransition', { gameId });
  };

  const isPersonalOrDare = questionType === 'personal' || questionType === 'dare';
  const typeColor = TypeColors[questionType] || Colors.primary;

  const getTitle = () => {
    if (questionType === 'dare' && targetPlayer) {
      return t('evaluation.titleDare', { player: targetPlayer.name });
    }
    if (questionType === 'personal' && targetPlayer) {
      return t('evaluation.titlePersonal', { player: targetPlayer.name });
    }
    return t('evaluation.title');
  };

  return (
    <SafeAreaView style={Layout.screen}>
      <View style={styles.header}>
        <View style={[styles.typeDot, { backgroundColor: typeColor }]} />
        <Text style={styles.headerTitle}>{getTitle()}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Personal / Dare — binary choice for target */}
        {isPersonalOrDare && targetPlayer && (
          <View style={styles.binarySection}>
            <View style={styles.targetCard}>
              <Text style={styles.targetEmoji}>{targetPlayer.emoji}</Text>
              <Text style={styles.targetName}>{targetPlayer.name}</Text>
            </View>
            <View style={styles.binaryRow}>
              <TouchableOpacity
                style={[
                  styles.binaryBtn,
                  styles.binaryBtnSafe,
                  dareCompleted === true && styles.binaryBtnSafeActive,
                ]}
                onPress={() => handleDareResult(true)}
                activeOpacity={0.8}
              >
                <MaterialCommunityIcons name="check-circle" size={24} color={dareCompleted === true ? Colors.background : Colors.success} />
                <Text style={[styles.binaryBtnText, dareCompleted === true && { color: Colors.background }]}>
                  {questionType === 'dare' ? t('evaluation.dareCompleted') : t('evaluation.personalAnswered')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.binaryBtn,
                  styles.binaryBtnShot,
                  dareCompleted === false && styles.binaryBtnShotActive,
                ]}
                onPress={() => handleDareResult(false)}
                activeOpacity={0.8}
              >
                <ShotBadge size="md" variant="icon" />
                <Text style={[styles.binaryBtnText, dareCompleted === false && { color: Colors.background }]}>
                  {questionType === 'dare' ? t('evaluation.dareNotCompleted') : t('evaluation.personalNotAnswered')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Personal/Dare + shot: just show target player, no selection needed */}
        {isPersonalOrDare && dareCompleted === false && targetPlayer && (
          <View style={styles.playerSection}>
            <View style={[styles.playerRow, styles.playerRowShot]}>
              <Text style={styles.playerEmoji}>{targetPlayer.emoji}</Text>
              <Text style={styles.playerName}>{targetPlayer.name}</Text>
              <View style={[styles.shotToggle, styles.shotToggleActive]}>
                <ShotBadge size="sm" variant="icon" />
              </View>
            </View>
          </View>
        )}

        {/* Group question only: show full player list */}
        {!isPersonalOrDare && (
          <View style={styles.playerSection}>
            {players.map((player) => {
              const isShot = shotTakers.includes(player.id);
              return (
                <TouchableOpacity
                  key={player.id}
                  style={[styles.playerRow, isShot && styles.playerRowShot]}
                  onPress={() => toggleShotTaker(player.id)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.playerEmoji}>{player.emoji}</Text>
                  <Text style={styles.playerName}>{player.name}</Text>
                  <View style={[styles.shotToggle, isShot && styles.shotToggleActive]}>
                    {isShot ? (
                      <ShotBadge size="sm" variant="icon" />
                    ) : (
                      <MaterialCommunityIcons name="circle-outline" size={22} color={Colors.textMuted} />
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Shot summary */}
        {shotTakers.length > 0 && (
          <View style={styles.summaryRow}>
            <Text style={styles.summaryText}>
              {t('evaluation.shotCount', { count: shotTakers.length })}
            </Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[Buttons.primary, (isPersonalOrDare && dareCompleted === null) && { opacity: 0.4 }]}
          onPress={handleContinue}
          disabled={isPersonalOrDare && dareCompleted === null}
          activeOpacity={0.85}
        >
          <Text style={Buttons.primaryText}>{t('evaluation.continueGame')}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  typeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  headerTitle: {
    ...Typography.h3,
    flex: 1,
  },
  scroll: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  binarySection: {
    marginBottom: Spacing.lg,
  },
  targetCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  targetEmoji: {
    fontSize: 28,
  },
  targetName: {
    ...Typography.h3,
  },
  binaryRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  binaryBtn: {
    flex: 1,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    gap: Spacing.xs,
    borderWidth: 2,
    borderColor: Colors.border,
    backgroundColor: Colors.card,
  },
  binaryBtnSafe: {
    borderColor: Colors.success,
  },
  binaryBtnSafeActive: {
    backgroundColor: Colors.success,
  },
  binaryBtnShot: {
    borderColor: Colors.danger,
  },
  binaryBtnShotActive: {
    backgroundColor: Colors.danger,
  },
  binaryBtnText: {
    ...Typography.buttonSmall,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  additionalLabel: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  playerSection: {
    gap: Spacing.sm,
  },
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    gap: Spacing.sm,
  },
  playerRowShot: {
    borderColor: Colors.danger,
    backgroundColor: Colors.dangerDark + '22',
  },
  playerRowTarget: {
    borderColor: Colors.primary,
  },
  playerEmoji: {
    fontSize: 24,
  },
  playerName: {
    ...Typography.bodyMedium,
    flex: 1,
  },
  shotToggle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  shotToggleActive: {
    backgroundColor: Colors.danger,
    borderColor: Colors.danger,
  },
  summaryRow: {
    alignItems: 'center',
    marginTop: Spacing.lg,
  },
  summaryText: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
  footer: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.lg,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
});
