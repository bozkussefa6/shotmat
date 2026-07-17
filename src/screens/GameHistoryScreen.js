import React, { useState, useCallback } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';

import {
  Colors,
  Spacing,
  Typography,
  BorderRadius,
  Layout,
} from '../styles/GlobalStyles';
import StorageService from '../services/StorageService';
import GameService from '../services/GameService';
import ScoreBadge from '../components/ScoreBadge';
import PlayerAvatar from '../components/PlayerAvatar';

import { formatDateWithYear, formatDate } from '../utils/formatDate';

export default function GameHistoryScreen() {
  const { t, i18n } = useTranslation();
  const navigation = useNavigation();
  const [games, setGames] = useState([]);
  const [activeGames, setActiveGames] = useState([]);
  const [players, setPlayers] = useState([]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    const [gameList, playerList] = await Promise.all([
      StorageService.getGames(),
      StorageService.getPlayers(),
    ]);
    setActiveGames(gameList.filter((g) => g.status === 'active'));
    setGames(gameList.filter((g) => g.status === 'ended'));
    setPlayers(playerList);
  };

  const handleResumeGame = (game) => {
    navigation.navigate('GameFlow', {
      screen: 'QuestionTransition',
      params: { gameId: game.id },
    });
  };

  const renderGame = ({ item: game }) => {
    const counts = GameService.calculateShotCounts(game);
    const totalShots = Object.values(counts).reduce((a, b) => a + b, 0);
    const gamePlayers = players.filter((p) => game.playerIds.includes(p.id));
    const questionsDone = game.rounds?.filter((r) => !r.skipped).length || 0;

    return (
      <TouchableOpacity
        style={styles.gameCard}
        onPress={() => navigation.navigate('GameDetail', { gameId: game.id })}
        activeOpacity={0.8}
      >
        <View style={styles.cardTop}>
          <View style={styles.dateRow}>
            <MaterialCommunityIcons name="calendar" size={14} color={Colors.textMuted} />
            <Text style={styles.dateText}>{formatDate(game.createdAt, i18n.language)}</Text>
          </View>
          <ScoreBadge count={totalShots} size="sm" />
        </View>

        <View style={styles.avatarRow}>
          {gamePlayers.slice(0, 6).map((p) => (
            <PlayerAvatar key={p.id} player={p} size="xs" />
          ))}
          {gamePlayers.length > 6 && (
            <Text style={styles.moreText}>+{gamePlayers.length - 6}</Text>
          )}
        </View>

        <Text style={styles.playerNames} numberOfLines={1}>
          {gamePlayers.map((p) => p.name).join(', ')}
        </Text>

        <View style={styles.statsRow}>
          <Text style={styles.statChip}>
            <MaterialCommunityIcons name="account-group" size={12} color={Colors.textMuted} />
            {' '}{t('gameHistory.players', { count: gamePlayers.length })}
          </Text>
          <Text style={styles.statChip}>
            <MaterialCommunityIcons name="cards" size={12} color={Colors.textMuted} />
            {' '}{t('gameHistory.questions', { count: questionsDone })}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={Layout.screen}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('gameHistory.title')}</Text>
      </View>

      {activeGames.length > 0 && (
        <View style={styles.activeSection}>
          {activeGames.map((game) => {
            const gamePlayers = players.filter((p) => game.playerIds.includes(p.id));
            return (
              <TouchableOpacity
                key={game.id}
                style={styles.activeCard}
                onPress={() => handleResumeGame(game)}
                activeOpacity={0.85}
              >
                <View style={styles.activeCardLeft}>
                  <View style={styles.activeDot} />
                  <View>
                    <Text style={styles.activeCardDate}>{formatDate(game.createdAt, i18n.language)}</Text>
                    <Text style={styles.activeCardPlayers} numberOfLines={1}>
                      {gamePlayers.map((p) => p.name).join(', ')}
                    </Text>
                  </View>
                </View>
                <View style={styles.resumeChip}>
                  <Text style={styles.resumeChipText}>{t('gameHistory.resumeGame')}</Text>
                  <MaterialCommunityIcons name="chevron-right" size={14} color={Colors.background} />
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      <FlatList
        data={games}
        renderItem={renderGame}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <MaterialCommunityIcons name="glass-cocktail" size={48} color={Colors.textMuted} />
            <Text style={styles.emptyText}>{t('gameHistory.empty')}</Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  headerTitle: {
    ...Typography.h2,
  },
  list: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xxl,
    gap: Spacing.sm,
  },
  gameCard: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.sm,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dateText: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  avatarRow: {
    flexDirection: 'row',
    gap: 4,
    alignItems: 'center',
  },
  moreText: {
    ...Typography.caption,
    color: Colors.textMuted,
  },
  playerNames: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  statChip: {
    ...Typography.caption,
    color: Colors.textMuted,
  },
  activeSection: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  activeCard: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  activeCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flex: 1,
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.background,
    opacity: 0.7,
  },
  activeCardDate: {
    ...Typography.bodyMedium,
    color: Colors.background,
    fontWeight: '700',
  },
  activeCardPlayers: {
    ...Typography.caption,
    color: Colors.background,
    opacity: 0.75,
  },
  resumeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: 'rgba(0,0,0,0.15)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  resumeChipText: {
    ...Typography.caption,
    color: Colors.background,
    fontWeight: '700',
  },
  empty: {
    alignItems: 'center',
    paddingTop: Spacing.xxl * 2,
    gap: Spacing.md,
  },
  emptyText: {
    ...Typography.bodySmall,
    textAlign: 'center',
    lineHeight: 22,
  },
});
