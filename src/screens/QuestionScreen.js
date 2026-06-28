import React, { useEffect, useState, useRef } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Animated,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

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
import AdService from '../services/AdService';
import PremiumService from '../services/PremiumService';
import ShotBadge from '../components/ShotBadge';

export default function QuestionScreen() {
  const { t, i18n } = useTranslation();
  const navigation = useNavigation();
  const route = useRoute();
  const { gameId, targetPlayerId } = route.params || {};

  const [game, setGame] = useState(null);
  const [question, setQuestion] = useState(null);
  const [targetPlayer, setTargetPlayer] = useState(null);
  const [isPremium, setIsPremium] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    loadQuestion();
  }, []);

  const loadQuestion = async () => {
    const [g, players, premium] = await Promise.all([
      StorageService.getGameById(gameId),
      StorageService.getPlayers(),
      PremiumService.isPremium(),
    ]);
    if (!g) return;
    setGame(g);
    setIsPremium(premium);

    const q = GameService.getNextQuestion(g);
    setQuestion(q);

    if (targetPlayerId) {
      const p = players.find((pl) => pl.id === targetPlayerId);
      setTargetPlayer(p || null);
    }

    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]).start();

    // Ad logic
    AdService.incrementQuestionCounter();
    if (!premium && AdService.shouldShowInterstitial()) {
      await AdService.showInterstitialAd();
    }
  };

  const getQuestionText = () => {
    if (!question) return '';
    const lang = i18n.language === 'tr' ? 'tr' : 'en';
    const raw = question[lang] || question.tr || question.textTr || question.en || question.textEn || '';
    if (targetPlayer) {
      return GameService.formatQuestionText(raw, targetPlayer.name, lang);
    }
    return raw;
  };

  const handleEvaluate = () => {
    navigation.replace('Evaluation', { gameId, targetPlayerId, questionType: question?.type });
  };

  const handleSkip = () => {
    Alert.alert(
      t('question.skip'),
      t('question.skipConfirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.skip'),
          style: 'destructive',
          onPress: async () => {
            await GameService.skipRound(gameId, question, targetPlayerId);
            navigation.replace('QuestionTransition', { gameId });
          },
        },
      ]
    );
  };

  const handleStatus = () => {
    navigation.navigate('GameStatus', { gameId });
  };

  if (!question) return null;

  const typeColor = TypeColors[question.type] || Colors.primary;
  const typeKey = `question.type${question.type.charAt(0).toUpperCase() + question.type.slice(1)}`;
  const questionNumber = (game?.currentQuestionIndex || 0) + 1;

  return (
    <SafeAreaView style={Layout.screen}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={handleStatus} style={styles.statusBtn}>
          <MaterialCommunityIcons name="chart-bar" size={22} color={Colors.textSecondary} />
        </TouchableOpacity>
        <Text style={styles.questionNumber}>{t('question.questionCounter', { current: questionNumber })}</Text>
        <TouchableOpacity onPress={handleSkip} style={styles.skipBtn}>
          <Text style={styles.skipText}>{t('common.skip')}</Text>
        </TouchableOpacity>
      </View>

      {/* Type badge */}
      <View style={styles.typeBadgeRow}>
        <View style={[styles.typeBadge, { backgroundColor: typeColor + '22', borderColor: typeColor }]}>
          <Text style={[styles.typeText, { color: typeColor }]}>{t(typeKey)}</Text>
        </View>
      </View>

      {/* Question card */}
      <Animated.View
        style={[
          styles.cardContainer,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        ]}
      >
        <LinearGradient
          colors={[Colors.card, Colors.surface]}
          style={[styles.card, { borderColor: typeColor + '66' }]}
        >
          {/* Target player indicator */}
          {targetPlayer && (
            <View style={styles.targetRow}>
              <Text style={styles.targetEmoji}>{targetPlayer.emoji}</Text>
              <Text style={[styles.targetName, { color: typeColor }]}>
                {t('question.targetedAt', { player: targetPlayer.name })}
              </Text>
            </View>
          )}

          <View style={styles.shotDecorWrap}>
            <ShotBadge size="xl" variant="icon" />
          </View>

          {/* Question text */}
          <Text style={styles.questionText}>{getQuestionText()}</Text>
        </LinearGradient>
      </Animated.View>

      {/* Evaluate button */}
      <View style={styles.footer}>
        <TouchableOpacity style={[Buttons.primary, styles.evaluateBtn]} onPress={handleEvaluate} activeOpacity={0.85}>
          <MaterialCommunityIcons name="check-circle" size={22} color={Colors.background} />
          <Text style={Buttons.primaryText}>{t('question.answered')}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  statusBtn: {
    padding: Spacing.xs,
  },
  questionNumber: {
    ...Typography.caption,
    color: Colors.textSecondary,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  skipBtn: {
    padding: Spacing.xs,
  },
  skipText: {
    ...Typography.buttonSmall,
    color: Colors.textMuted,
  },
  typeBadgeRow: {
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  typeBadge: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  typeText: {
    ...Typography.button,
    letterSpacing: 2,
    fontSize: 12,
  },
  cardContainer: {
    flex: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    justifyContent: 'center',
  },
  card: {
    borderRadius: BorderRadius.xxl,
    padding: Spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    ...Shadows.modal,
    gap: Spacing.lg,
  },
  targetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  targetEmoji: {
    fontSize: 18,
  },
  targetName: {
    ...Typography.bodySmall,
    fontWeight: '600',
  },
  shotDecorWrap: {
    opacity: 0.75,
  },
  questionText: {
    ...Typography.questionText,
    lineHeight: 36,
  },
  footer: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.lg,
    paddingTop: Spacing.sm,
  },
  evaluateBtn: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
});
