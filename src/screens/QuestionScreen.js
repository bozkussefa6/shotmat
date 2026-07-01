import React, { useEffect, useState, useRef } from 'react';
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

import {
  Colors,
  Spacing,
  Buttons,
  Layout,
} from '../styles/GlobalStyles';
import StorageService from '../services/StorageService';
import GameService from '../services/GameService';
import AdService from '../services/AdService';
import PremiumService from '../services/PremiumService';
import QuestionCard from '../components/QuestionCard';
import ScreenSafeArea from '../components/ScreenSafeArea';
import AppToolbar from '../components/AppToolbar';
import { getQuestionText as resolveQuestionText } from '../utils/questionText';

export default function QuestionScreen() {
  const { t, i18n } = useTranslation();
  const navigation = useNavigation();
  const route = useRoute();
  const { gameId, targetPlayerId } = route.params || {};

  const [game, setGame] = useState(null);
  const [question, setQuestion] = useState(null);
  const [targetPlayer, setTargetPlayer] = useState(null);
  const [allPlayers, setAllPlayers] = useState([]);

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
    setAllPlayers(players.filter((p) => g.playerIds.includes(p.id)));

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

    AdService.incrementQuestionCounter();
    if (!premium && AdService.shouldShowInterstitial()) {
      await AdService.showInterstitialAd();
    }
  };

  const getQuestionText = () => {
    if (!question) return '';
    const lang = i18n.language === 'tr' ? 'tr' : 'en';
    const raw = resolveQuestionText(question, lang);
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

  const questionNumber = (game?.currentQuestionIndex || 0) + 1;

  return (
    <ScreenSafeArea edges={['top', 'left', 'right', 'bottom']}>
      <AppToolbar
        left={
          <TouchableOpacity onPress={handleStatus} style={Layout.toolbarAction}>
            <MaterialCommunityIcons name="chart-bar" size={22} color={Colors.textSecondary} />
          </TouchableOpacity>
        }
        title={t('question.questionCounter', { current: questionNumber })}
        right={
          <TouchableOpacity onPress={handleSkip} style={Layout.toolbarAction}>
            <Text style={Layout.toolbarActionText}>{t('common.skip')}</Text>
          </TouchableOpacity>
        }
      />

      <Animated.View
        style={[
          styles.cardContainer,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        ]}
      >
        <QuestionCard
          type={question.type}
          questionText={getQuestionText()}
          targetPlayer={targetPlayer}
          allPlayers={allPlayers}
        />
      </Animated.View>

      <View style={styles.footer}>
        <TouchableOpacity style={[Buttons.primary, styles.evaluateBtn]} onPress={handleEvaluate} activeOpacity={0.85}>
          <MaterialCommunityIcons name="check-circle" size={22} color={Colors.background} />
          <Text style={Buttons.primaryText}>{t('question.answered')}</Text>
        </TouchableOpacity>
      </View>
    </ScreenSafeArea>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    flex: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    justifyContent: 'center',
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
