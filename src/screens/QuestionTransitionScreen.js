import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTranslation } from 'react-i18next';
import { useNavigation, useRoute } from '@react-navigation/native';
import {
  Colors,
  Spacing,
  Typography,
  TypeColors,
} from '../styles/GlobalStyles';
import StorageService from '../services/StorageService';
import GameService from '../services/GameService';
import SoundService from '../services/SoundService';
import { resetGameFlowTo } from '../navigation/gameFlowHelpers';
import AppLogo from '../components/AppLogo';
import ScreenSafeArea from '../components/ScreenSafeArea';
import SlotReel from '../components/SlotReel';

const SPIN_MS = 900;
const TYPE_HOLD_MS = 1000;
const CAPTION_FADE_MS = 250;
const CAPTION_HOLD_MS = 1000;

const getTypeLabels = (t) => [
  t('question.typeGroup'),
  t('question.typePersonal'),
  t('question.typeDare'),
];

const TYPE_INDEX = { group: 0, personal: 1, dare: 2 };

export default function QuestionTransitionScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const route = useRoute();
  const { gameId } = route.params || {};

  const [targetPlayer, setTargetPlayer] = useState(null);
  const [nextQuestion, setNextQuestion] = useState(null);
  const [playerNames, setPlayerNames] = useState([]);
  const [phase, setPhase] = useState(0);
  const [typeReelActive, setTypeReelActive] = useState(false);
  const [playerReelActive, setPlayerReelActive] = useState(false);
  const [showPlayerCaption, setShowPlayerCaption] = useState(false);

  const spinAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const ringPulse = useRef(new Animated.Value(1)).current;
  const ringOpacity = useRef(new Animated.Value(0.5)).current;
  const spinPhaseOpacity = useRef(new Animated.Value(1)).current;
  const typePhaseOpacity = useRef(new Animated.Value(0)).current;
  const playerPhaseOpacity = useRef(new Animated.Value(0)).current;
  const captionOpacity = useRef(new Animated.Value(0)).current;

  const targetRef = useRef(null);
  const timersRef = useRef([]);

  const clearTimers = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  };

  const schedule = (fn, delay) => {
    const id = setTimeout(fn, delay);
    timersRef.current.push(id);
  };

  const crossfadeTo = (from, to) => {
    Animated.parallel([
      Animated.timing(from, { toValue: 0, duration: 250, useNativeDriver: true }),
      Animated.timing(to, { toValue: 1, duration: 250, useNativeDriver: true }),
    ]).start();
  };

  const navigateToQuestion = useCallback(
    (targetId) => {
      navigation.replace('Question', { gameId, targetPlayerId: targetId || null });
    },
    [navigation, gameId]
  );

  const needsPlayerReel = useCallback((target, question) => {
    return (
      target &&
      question &&
      (question.type === 'personal' || question.type === 'dare')
    );
  }, []);

  const beginTypeReel = useCallback(() => {
    setPhase(1);
    crossfadeTo(spinPhaseOpacity, typePhaseOpacity);
    setTypeReelActive(true);
  }, [spinPhaseOpacity, typePhaseOpacity]);

  const handleTypeReelComplete = useCallback(
    (question) => {
      SoundService.play('reveal');
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      if (needsPlayerReel(targetRef.current, question)) {
        schedule(() => {
          setTypeReelActive(false);
          setPhase(2);
          crossfadeTo(typePhaseOpacity, playerPhaseOpacity);
          setPlayerReelActive(true);
        }, 180);
      } else {
        schedule(() => navigateToQuestion(null), TYPE_HOLD_MS);
      }
    },
    [needsPlayerReel, typePhaseOpacity, playerPhaseOpacity, navigateToQuestion]
  );

  const handlePlayerReelComplete = useCallback(() => {
    SoundService.play('reveal');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setShowPlayerCaption(true);
    Animated.timing(captionOpacity, {
      toValue: 1,
      duration: CAPTION_FADE_MS,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (!finished) return;
      schedule(
        () => navigateToQuestion(targetRef.current?.id || null),
        CAPTION_HOLD_MS
      );
    });
  }, [captionOpacity, navigateToQuestion]);

  const startAnimation = useCallback(() => {
    const spinTickInterval = setInterval(() => SoundService.play('spin'), 150);
    schedule(() => clearInterval(spinTickInterval), SPIN_MS);

    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        tension: 80,
        useNativeDriver: true,
      }),
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: SPIN_MS,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(ringPulse, {
            toValue: 1.08,
            duration: 450,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(ringOpacity, {
            toValue: 0.85,
            duration: 450,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(ringPulse, {
            toValue: 1,
            duration: 450,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(ringOpacity, {
            toValue: 0.45,
            duration: 450,
            useNativeDriver: true,
          }),
        ]),
      ])
    ).start();

    schedule(beginTypeReel, SPIN_MS);
  }, [scaleAnim, spinAnim, ringPulse, ringOpacity, beginTypeReel]);

  useEffect(() => {
    const loadAndPrepare = async () => {
      const [game, playerList] = await Promise.all([
        StorageService.getGameById(gameId),
        StorageService.getPlayers(),
      ]);
      if (!game) return;

      const question = GameService.getNextQuestion(game);
      if (!question) {
        await GameService.endGame(gameId);
        resetGameFlowTo(navigation, 'GameEnd', { gameId });
        return;
      }

      const lastRound = game.rounds[game.rounds.length - 1];
      const lastTargetId = lastRound?.targetPlayerId || null;
      const targetId = GameService.resolveTargetPlayer(
        question,
        game.playerIds,
        lastTargetId
      );
      const target = targetId
        ? playerList.find((p) => p.id === targetId)
        : null;

      const names = game.playerIds
        .map((id) => playerList.find((p) => p.id === id))
        .filter((p) => p && !p.deleted)
        .map((p) => p.name);

      targetRef.current = target;
      setNextQuestion(question);
      setTargetPlayer(target);
      setPlayerNames(names);
      startAnimation();
    };

    loadAndPrepare();
    return clearTimers;
  }, [gameId, navigation, startAnimation]);

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '720deg'],
  });

  const typeColor = nextQuestion
    ? TypeColors[nextQuestion.type] || Colors.primary
    : Colors.primary;

  const typeLabels = getTypeLabels(t);
  const typeFinalIndex = nextQuestion
    ? TYPE_INDEX[nextQuestion.type] ?? 0
    : 0;

  const playerFinalIndex =
    targetPlayer && playerNames.length
      ? Math.max(0, playerNames.findIndex((name) => name === targetPlayer.name))
      : 0;

  const handleTypeTick = (isLast) => {
    SoundService.play('spin');
    if (!isLast) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handlePlayerTick = (isLast) => {
    SoundService.play('spin');
    if (!isLast) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const dotActive = (index) => {
    if (index === 0) return phase >= 0;
    if (index === 1) return phase >= 1;
    if (index === 2) {
      if (!needsPlayerReel(targetPlayer, nextQuestion)) return phase >= 1;
      return phase >= 2;
    }
    return false;
  };

  return (
    <ScreenSafeArea>
      <View style={styles.container}>
        <Animated.View
          style={[
            styles.centerStack,
            {
              opacity: spinPhaseOpacity,
              transform: [{ scale: scaleAnim }],
            },
          ]}
          pointerEvents="none"
        >
          <Animated.View
            style={[
              styles.ring,
              {
                borderColor: Colors.primary,
                opacity: ringOpacity,
                transform: [{ scale: ringPulse }],
              },
            ]}
          />
          <View style={[styles.iconContainer, { borderColor: Colors.primary }]}>
            <Animated.View style={{ transform: [{ rotate: spin }] }}>
              <AppLogo size="sm" />
            </Animated.View>
          </View>
        </Animated.View>

        <Animated.View
          style={[styles.reelStack, { opacity: typePhaseOpacity }]}
          pointerEvents="none"
        >
          {nextQuestion && (
            <SlotReel
              items={typeLabels}
              finalIndex={typeFinalIndex}
              active={typeReelActive}
              accentColor={typeColor}
              onTick={handleTypeTick}
              onComplete={() => handleTypeReelComplete(nextQuestion)}
              itemHeight={52}
              fontSize={20}
            />
          )}
        </Animated.View>

        <Animated.View
          style={[styles.reelStack, { opacity: playerPhaseOpacity }]}
          pointerEvents="none"
        >
          {playerNames.length > 0 && (
            <SlotReel
              items={playerNames}
              finalIndex={playerFinalIndex}
              active={playerReelActive}
              accentColor={typeColor}
              onTick={handlePlayerTick}
              onComplete={handlePlayerReelComplete}
              itemHeight={52}
              fontSize={22}
            />
          )}
          {showPlayerCaption && targetPlayer && (
            <Animated.Text
              style={[
                styles.playerCaption,
                { color: typeColor, opacity: captionOpacity },
              ]}
            >
              {t('questionTransition.questionFor', { player: targetPlayer.name })}
            </Animated.Text>
          )}
        </Animated.View>

        <View style={styles.footer}>
          <Text style={styles.selectingText}>{t('questionTransition.selecting')}</Text>
          <View style={styles.dots}>
            {[0, 1, 2].map((i) => (
              <View
                key={i}
                style={[styles.dot, dotActive(i) && styles.dotActive]}
              />
            ))}
          </View>
        </View>
      </View>
    </ScreenSafeArea>
  );
}

const RING_SIZE = 140;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    width: RING_SIZE,
    height: RING_SIZE,
    borderRadius: RING_SIZE / 2,
    borderWidth: 2,
  },
  centerStack: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    width: RING_SIZE,
    height: RING_SIZE,
    borderRadius: RING_SIZE / 2,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  reelStack: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  footer: {
    position: 'absolute',
    bottom: 80,
    alignItems: 'center',
    gap: Spacing.sm,
  },
  selectingText: {
    ...Typography.bodySmall,
    color: Colors.textMuted,
    letterSpacing: 0.5,
  },
  dots: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.border,
  },
  dotActive: {
    backgroundColor: Colors.primary,
  },
  playerCaption: {
    ...Typography.h3,
    textAlign: 'center',
    marginTop: Spacing.lg,
    paddingHorizontal: Spacing.lg,
  },
});
