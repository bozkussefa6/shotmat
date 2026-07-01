import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { Colors, Typography } from '../styles/GlobalStyles';

export const REEL_TICK_DELAYS = [60, 90, 130, 180, 250, 300];

const getOffset = (index, itemHeight) => (1 - index) * itemHeight;

export default function SlotReel({
  items,
  finalIndex,
  active,
  accentColor = Colors.primary,
  onComplete,
  onTick,
  itemHeight = 48,
  fontSize = 22,
}) {
  const translateY = useRef(new Animated.Value(0)).current;
  const timerRef = useRef(null);
  const onCompleteRef = useRef(onComplete);
  const onTickRef = useRef(onTick);
  const [centerIndex, setCenterIndex] = useState(0);
  const [settled, setSettled] = useState(false);

  useEffect(() => {
    onCompleteRef.current = onComplete;
    onTickRef.current = onTick;
  }, [onComplete, onTick]);

  useEffect(() => {
    if (!active || !items?.length) return undefined;

    const cycles = 3;
    const strip = Array.from({ length: cycles }, () => items).flat();
    const landIndex = (cycles - 1) * items.length + finalIndex;
    let current = 0;
    let tick = 0;

    setSettled(false);
    setCenterIndex(0);
    translateY.setValue(getOffset(0, itemHeight));

    const step = () => {
      tick += 1;
      const isLast = tick >= REEL_TICK_DELAYS.length;
      const next = isLast ? landIndex : (current + 1) % strip.length;
      current = next;
      setCenterIndex(next);

      onTickRef.current?.(isLast);

      Animated.timing(translateY, {
        toValue: getOffset(next, itemHeight),
        duration: isLast ? 220 : 90,
        easing: isLast ? Easing.out(Easing.cubic) : Easing.linear,
        useNativeDriver: true,
      }).start(() => {
        if (isLast) {
          setSettled(true);
          onCompleteRef.current?.();
        }
      });

      if (!isLast) {
        const delay = REEL_TICK_DELAYS[tick - 1] ?? 300;
        timerRef.current = setTimeout(step, delay);
      }
    };

    timerRef.current = setTimeout(step, REEL_TICK_DELAYS[0]);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [active, items, finalIndex, itemHeight, translateY]);

  if (!items?.length) return null;

  const cycles = 3;
  const strip = Array.from({ length: cycles }, () => items).flat();
  const viewportH = itemHeight * 3;

  return (
    <View style={[styles.viewport, { height: viewportH }]}>
      <View style={[styles.centerBand, { top: itemHeight, height: itemHeight }]} pointerEvents="none" />
      <Animated.View style={{ transform: [{ translateY }] }}>
        {strip.map((label, i) => {
          const isCenter = i === centerIndex;
          const color = settled && isCenter
            ? accentColor
            : isCenter
              ? Colors.textPrimary
              : Colors.textMuted;
          return (
            <View key={`${i}-${label}`} style={[styles.row, { height: itemHeight }]}>
              <Text
                style={[
                  styles.label,
                  { fontSize, color, fontWeight: settled && isCenter ? '800' : '600' },
                ]}
                numberOfLines={1}
              >
                {label}
              </Text>
            </View>
          );
        })}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  viewport: {
    width: 280,
    overflow: 'hidden',
    alignSelf: 'center',
  },
  centerBand: {
    position: 'absolute',
    left: 0,
    right: 0,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: Colors.border,
    zIndex: 1,
  },
  row: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  label: {
    ...Typography.h3,
    textAlign: 'center',
    letterSpacing: 1,
  },
});
