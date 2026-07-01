import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import {
  Colors,
  Spacing,
  Typography,
  BorderRadius,
  TypeColors,
  Shadows,
} from '../styles/GlobalStyles';
import PlayerAvatar from './PlayerAvatar';

const TYPE_TITLE_KEYS = {
  group: 'question.typeGroupTitle',
  personal: 'question.typePersonalTitle',
  dare: 'question.typeDareTitle',
};

const TYPE_HINT_SHORT_KEYS = {
  group: 'question.typeGroupHintShort',
  personal: 'question.typePersonalHintShort',
  dare: 'question.typeDareHintShort',
};

export default function QuestionCard({ type, questionText, targetPlayer, allPlayers = [] }) {
  const { t } = useTranslation();
  const typeColor = TypeColors[type] || Colors.primary;
  const typeLabel = t(TYPE_TITLE_KEYS[type] || TYPE_TITLE_KEYS.group);
  const hint = t(TYPE_HINT_SHORT_KEYS[type] || TYPE_HINT_SHORT_KEYS.group);

  const pillText = targetPlayer ? `${typeLabel} · ${targetPlayer.name}` : typeLabel;

  return (
    <View style={styles.wrapper}>
      <View style={styles.metaRow}>
        <View style={[styles.pill, { borderColor: typeColor + '88' }]}>
          <Text style={[styles.pillText, { color: typeColor }]}>{pillText}</Text>
        </View>
      </View>

      <View style={styles.questionCard}>
        <Text style={styles.questionText}>{questionText}</Text>
      </View>

      {type === 'group' && allPlayers.length > 0 && (
        <View style={styles.avatarRow}>
          {allPlayers.map((p) => (
            <PlayerAvatar key={p.id} player={p} size="xs" />
          ))}
        </View>
      )}

      <Text style={styles.hint}>{hint}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: Spacing.md,
    alignItems: 'center',
  },
  metaRow: {
    alignItems: 'center',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    backgroundColor: Colors.card,
  },
  pillText: {
    ...Typography.caption,
    fontWeight: '600',
  },
  questionCard: {
    width: '100%',
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    ...Shadows.modal,
  },
  questionText: {
    ...Typography.questionText,
    lineHeight: 36,
    textAlign: 'center',
  },
  avatarRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: Spacing.xs,
  },
  hint: {
    ...Typography.caption,
    color: Colors.textMuted,
    textAlign: 'center',
  },
});
