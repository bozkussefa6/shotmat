import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';

import {
  Colors,
  Spacing,
  Typography,
  BorderRadius,
  Buttons,
  TypeColors,
} from '../styles/GlobalStyles';
import StorageService from '../services/StorageService';
import GameService from '../services/GameService';
import SoundService from '../services/SoundService';
import PlayerAvatar from '../components/PlayerAvatar';
import ScreenSafeArea from '../components/ScreenSafeArea';
import AppToolbar from '../components/AppToolbar';

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
    <ScreenSafeArea edges={['top', 'left', 'right', 'bottom']}>
      <AppToolbar
        left={
          <View style={[styles.typeDot, { backgroundColor: typeColor }]} />
        }
        title={
          <Text style={styles.headerTitle} numberOfLines={2}>
            {getTitle()}
          </Text>
        }
      />

      <ScrollView contentContainerStyle={styles.scroll}>
        {isPersonalOrDare && targetPlayer && (
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
              <Text style={[styles.binaryBtnText, dareCompleted === true && styles.binaryBtnTextActive]}>
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
              <Text style={[styles.binaryBtnText, dareCompleted === false && styles.binaryBtnTextActive]}>
                {questionType === 'dare' ? t('evaluation.dareNotCompleted') : t('evaluation.personalNotAnswered')}
              </Text>
            </TouchableOpacity>
          </View>
        )}

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
                  <PlayerAvatar player={player} size="sm" />
                  <Text style={styles.playerName}>{player.name}</Text>
                  {isShot && (
                    <Text style={styles.shotLabel}>{t('evaluation.markShot')}</Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        )}

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
    </ScreenSafeArea>
  );
}

const styles = StyleSheet.create({
  typeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  headerTitle: {
    ...Typography.h3,
    textAlign: 'center',
  },
  scroll: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xxl,
  },
  binaryRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  binaryBtn: {
    flex: 1,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 72,
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
  binaryBtnTextActive: {
    color: Colors.background,
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
  playerName: {
    ...Typography.bodyMedium,
    flex: 1,
  },
  shotLabel: {
    ...Typography.caption,
    color: Colors.danger,
    fontWeight: '700',
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
