import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Easing,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation, useRoute } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  Colors,
  Spacing,
  Typography,
  BorderRadius,
  TypeColors,
} from '../styles/GlobalStyles';
import StorageService from '../services/StorageService';
import GameService from '../services/GameService';
import SoundService from '../services/SoundService';

// Slot machine cycles through type labels before locking on the real type
const getSlotLabels = (t) => [
  t('question.typeGroup'),
  t('question.typePersonal'),
  t('question.typeDare'),
];

export default function QuestionTransitionScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const route = useRoute();
  const { gameId, isFirst } = route.params || {};

  const [targetPlayer, setTargetPlayer] = useState(null);
  const [nextQuestion, setNextQuestion] = useState(null);
  const [players, setPlayers] = useState([]);
  const [phase, setPhase] = useState('spinning'); // 'spinning' | 'slot' | 'revealing'
  const [slotLabel, setSlotLabel] = useState('');

  useEffect(() => {
    setSlotLabel(getSlotLabels(t)[0]);
  }, [t]);

  // --- Core animations ---
  const spinAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  // --- Glow ring ---
  const glowScale = useRef(new Animated.Value(1)).current;
  const glowOpacity = useRef(new Animated.Value(0.6)).current;

  // --- Pulse ring (outer) ---
  const pulseScale = useRef(new Animated.Value(0.8)).current;
  const pulseOpacity = useRef(new Animated.Value(0)).current;

  // --- Slot machine label ---
  const slotOpacity = useRef(new Animated.Value(0)).current;
  const slotScale = useRef(new Animated.Value(0.8)).current;

  // --- Player reveal ---
  const playerRevealAnim = useRef(new Animated.Value(0)).current;
  const playerScaleAnim = useRef(new Animated.Value(1.05)).current;

  const slotTimerRef = useRef(null);

  useEffect(() => {
    loadAndPrepare();
    return () => {
      if (slotTimerRef.current) clearInterval(slotTimerRef.current);
    };
  }, []);

  const loadAndPrepare = async () => {
    const [game, playerList] = await Promise.all([
      StorageService.getGameById(gameId),
      StorageService.getPlayers(),
    ]);
    if (!game) return;
    setPlayers(playerList);

    const question = GameService.getNextQuestion(game);
    if (!question) {
      await GameService.endGame(gameId);
      navigation.replace('GameEnd', { gameId });
      return;
    }
    setNextQuestion(question);

    const lastRound = game.rounds[game.rounds.length - 1];
    const lastTargetId = lastRound?.targetPlayerId || null;
    const targetId = GameService.resolveTargetPlayer(question, game.playerIds, lastTargetId);
    const target = targetId ? playerList.find((p) => p.id === targetId) : null;
    setTargetPlayer(target);

    startAnimation(target, question);
  };

  const startAnimation = (target, question) => {
    const SPIN_DURATION = 1600;   // faz 1: spinning
    const SLOT_DURATION = 500;    // faz 2: slot machine
    const REVEAL_DELAY = target ? 600 : 0; // faz 3: player reveal

    const totalDuration = SPIN_DURATION + SLOT_DURATION + REVEAL_DELAY + 600;

    // Navigate after all animations
    setTimeout(() => {
      navigation.replace('Question', { gameId, targetPlayerId: target?.id || null });
    }, totalDuration);

    // === SOUNDS ===
    // Faz 1: rulet tiklamasi — daha sik tick (200ms), sinüs yerine kisa gürültü patlamasi (spin.wav)
    const tickInterval = setInterval(() => SoundService.play('spin'), 200);
    setTimeout(() => clearInterval(tickInterval), SPIN_DURATION);
    // Faz 2: slot gecislerinde yavaslayan tiklar (rulet duruyor hissi)
    const slotTickDelays = [80, 130, 180, 240, 300];
    const fireSlotTick = (idx) => {
      if (idx >= slotTickDelays.length) return;
      setTimeout(() => {
        SoundService.play('spin');
        fireSlotTick(idx + 1);
      }, slotTickDelays[idx]);
    };
    setTimeout(() => fireSlotTick(0), SPIN_DURATION);
    // Soru tipi netlesince ding
    setTimeout(() => SoundService.play('reveal'), SPIN_DURATION + SLOT_DURATION);

    // === FAZ 1: Spinning (0 → 1600ms) ===

    // Entrance pop
    Animated.parallel([
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 5,
        tension: 80,
        useNativeDriver: true,
      }),
    ]).start();

    // Continuous spin (4 full rotations in 1600ms)
    Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 400,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
      { iterations: 4 }
    ).start();

    // Pulsing glow ring
    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(glowScale, {
            toValue: 1.25,
            duration: 350,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(glowOpacity, {
            toValue: 0.2,
            duration: 350,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(glowScale, {
            toValue: 1,
            duration: 350,
            easing: Easing.in(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(glowOpacity, {
            toValue: 0.6,
            duration: 350,
            useNativeDriver: true,
          }),
        ]),
      ]),
      { iterations: -1 }
    ).start();

    // Expanding pulse ring (fires every ~500ms)
    const firePulse = () => {
      pulseScale.setValue(0.8);
      pulseOpacity.setValue(0.7);
      Animated.parallel([
        Animated.timing(pulseScale, {
          toValue: 2.2,
          duration: 700,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseOpacity, {
          toValue: 0,
          duration: 700,
          useNativeDriver: true,
        }),
      ]).start();
    };
    firePulse();
    const pulseInterval = setInterval(firePulse, 500);
    setTimeout(() => clearInterval(pulseInterval), SPIN_DURATION);

    // === FAZ 2: Slot Machine (1600ms → 2100ms) ===
    setTimeout(() => {
      if (slotTimerRef.current) clearInterval(slotTimerRef.current);
      setPhase('slot');

      const slotLabels = getSlotLabels(t);
      const typeLabel = question
        ? t(`question.type${question.type.charAt(0).toUpperCase() + question.type.slice(1)}`)
        : slotLabels[0];

      let idx = 0;
      let ticks = 0;
      const maxTicks = 6;

      slotOpacity.setValue(0);
      slotScale.setValue(0.7);
      Animated.parallel([
        Animated.timing(slotOpacity, { toValue: 1, duration: 150, useNativeDriver: true }),
        Animated.spring(slotScale, { toValue: 1, friction: 6, useNativeDriver: true }),
      ]).start();

      slotTimerRef.current = setInterval(() => {
        ticks++;
        const remaining = maxTicks - ticks;
        const nextLabel = remaining <= 0 ? typeLabel : slotLabels[ticks % slotLabels.length];

        // Quick flash out/in for tick feel
        Animated.sequence([
          Animated.timing(slotOpacity, { toValue: 0, duration: 40, useNativeDriver: true }),
          Animated.timing(slotOpacity, { toValue: 1, duration: 40, useNativeDriver: true }),
        ]).start();

        setSlotLabel(nextLabel);

        if (remaining <= 0) {
          clearInterval(slotTimerRef.current);
          // Final settle bounce
          Animated.sequence([
            Animated.timing(slotScale, { toValue: 1.15, duration: 120, easing: Easing.out(Easing.ease), useNativeDriver: true }),
            Animated.timing(slotScale, { toValue: 1, duration: 100, useNativeDriver: true }),
          ]).start();
        }
      }, SLOT_DURATION / maxTicks);
    }, SPIN_DURATION);

    // === FAZ 3: Player reveal (after slot) ===
    if (target) {
      setTimeout(() => {
        setPhase('revealing');
        Animated.parallel([
          Animated.spring(playerRevealAnim, {
            toValue: 1,
            friction: 6,
            tension: 80,
            useNativeDriver: true,
          }),
          Animated.timing(playerScaleAnim, {
            toValue: 1,
            duration: 300,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
        ]).start();
      }, SPIN_DURATION + SLOT_DURATION);
    }
  };

  const spin = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const typeColor = nextQuestion ? TypeColors[nextQuestion.type] || Colors.primary : Colors.primary;
  const slotColor = phase === 'slot' && nextQuestion ? TypeColors[nextQuestion.type] || Colors.primary : Colors.textSecondary;

  return (
    <View style={styles.container}>

      {/* Outer expanding pulse ring */}
      <Animated.View
        style={[
          styles.pulseRing,
          {
            borderColor: Colors.primary + '99',
            opacity: pulseOpacity,
            transform: [{ scale: pulseScale }],
          },
        ]}
        pointerEvents="none"
      />

      {/* Glow ring */}
      <Animated.View
        style={[
          styles.glowRing,
          {
            borderColor: Colors.primary,
            opacity: glowOpacity,
            transform: [{ scale: glowScale }],
          },
        ]}
        pointerEvents="none"
      />

      {/* Central spinning icon */}
      <Animated.View
        style={[
          styles.iconContainer,
          {
            opacity: opacityAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Animated.View style={{ transform: [{ rotate: spin }] }}>
          <MaterialCommunityIcons name="cup" size={72} color={Colors.primary} />
        </Animated.View>
      </Animated.View>

      {/* Phase 1 label */}
      {phase === 'spinning' && (
        <Animated.Text style={[styles.selectingText, { opacity: opacityAnim }]}>
          {t('questionTransition.selecting')}
        </Animated.Text>
      )}

      {/* Phase 2: Slot machine label */}
      {phase === 'slot' && (
        <Animated.Text
          style={[
            styles.slotLabel,
            {
              color: slotColor,
              opacity: slotOpacity,
              transform: [{ scale: slotScale }],
            },
          ]}
        >
          {slotLabel}
        </Animated.Text>
      )}

      {/* Phase 3: Player reveal */}
      {phase === 'revealing' && targetPlayer && (
        <Animated.View
          style={[
            styles.playerReveal,
            {
              opacity: playerRevealAnim,
              transform: [
                {
                  translateY: playerRevealAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [40, 0],
                  }),
                },
                { scale: playerScaleAnim },
              ],
            },
          ]}
        >
          <View style={[styles.playerRevealCard, { borderColor: typeColor }]}>
            <Text style={styles.playerEmoji}>{targetPlayer.emoji}</Text>
            <Text style={[styles.playerRevealText, { color: typeColor }]}>
              {t('questionTransition.questionFor', { player: targetPlayer.name })}
            </Text>
          </View>
        </Animated.View>
      )}

      {/* Type badge (bottom) */}
      {nextQuestion && phase !== 'spinning' && (
        <Animated.View
          style={[
            styles.typeBadge,
            {
              backgroundColor: typeColor + '22',
              borderColor: typeColor,
              opacity: opacityAnim,
            },
          ]}
        >
          <Text style={[styles.typeText, { color: typeColor }]}>
            {t(`question.type${nextQuestion.type.charAt(0).toUpperCase() + nextQuestion.type.slice(1)}`)}
          </Text>
        </Animated.View>
      )}
    </View>
  );
}

const RING_SIZE = 140;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xl,
  },
  pulseRing: {
    position: 'absolute',
    width: RING_SIZE,
    height: RING_SIZE,
    borderRadius: RING_SIZE / 2,
    borderWidth: 2,
  },
  glowRing: {
    position: 'absolute',
    width: RING_SIZE,
    height: RING_SIZE,
    borderRadius: RING_SIZE / 2,
    borderWidth: 2,
  },
  iconContainer: {
    width: RING_SIZE,
    height: RING_SIZE,
    borderRadius: RING_SIZE / 2,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  selectingText: {
    ...Typography.h3,
    color: Colors.textSecondary,
    letterSpacing: 1,
  },
  slotLabel: {
    ...Typography.h2,
    letterSpacing: 3,
    fontWeight: '800',
  },
  playerReveal: {
    alignItems: 'center',
  },
  playerRevealCard: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.xl,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
    borderWidth: 2,
    gap: Spacing.sm,
  },
  playerEmoji: {
    fontSize: 40,
  },
  playerRevealText: {
    ...Typography.h3,
    textAlign: 'center',
  },
  typeBadge: {
    position: 'absolute',
    bottom: 60,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  typeText: {
    ...Typography.button,
    letterSpacing: 2,
  },
});
