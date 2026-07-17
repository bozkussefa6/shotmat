import React, { useState, useCallback } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

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

import { formatDate } from '../utils/formatDate';

export default function StatsScreen() {
  const { t, i18n } = useTranslation();
  const [players, setPlayers] = useState([]);
  const [games, setGames] = useState([]);
  const [playerStats, setPlayerStats] = useState({});
  const [globalStats, setGlobalStats] = useState({ totalGames: 0, totalShots: 0, totalQuestions: 0 });

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    const [playerList, gameList] = await Promise.all([
      StorageService.getPlayers(),
      StorageService.getGames(),
    ]);
    const ended = gameList.filter((g) => g.status === 'ended');
    setPlayers(playerList.filter((p) => !p.deleted));
    setGames(ended);

    let totalShots = 0;
    let totalQuestions = 0;
    ended.forEach((g) => {
      totalQuestions += g.rounds?.filter((r) => !r.skipped).length || 0;
      g.rounds?.forEach((r) => {
        if (!r.skipped) totalShots += r.shotTakers?.length || 0;
      });
    });
    setGlobalStats({ totalGames: ended.length, totalShots, totalQuestions });

    const stats = {};
    for (const player of playerList.filter((p) => !p.deleted)) {
      stats[player.id] = await StorageService.getPlayerStats(player.id);
    }
    setPlayerStats(stats);
  };

  const sortedPlayers = [...players].sort(
    (a, b) => (playerStats[b.id]?.totalShots || 0) - (playerStats[a.id]?.totalShots || 0)
  );

  if (games.length === 0) {
    return (
      <SafeAreaView style={Layout.screen}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{t('stats.title')}</Text>
        </View>
        <View style={Layout.centered}>
          <MaterialCommunityIcons name="chart-bar" size={48} color={Colors.textMuted} />
          <Text style={styles.emptyText}>{t('stats.noStats')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={Layout.screen}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{t('stats.title')}</Text>
        </View>

        {/* Global Stats */}
        <View style={styles.globalRow}>
          <View style={styles.globalCard}>
            <Text style={styles.globalNum}>{globalStats.totalGames}</Text>
            <Text style={styles.globalLabel}>{t('stats.totalGames')}</Text>
          </View>
          <View style={[styles.globalCard, styles.globalCardMiddle]}>
            <Text style={[styles.globalNum, { color: Colors.danger }]}>{globalStats.totalShots}</Text>
            <Text style={styles.globalLabel}>{t('stats.totalShots')}</Text>
          </View>
          <View style={styles.globalCard}>
            <Text style={styles.globalNum}>{globalStats.totalQuestions}</Text>
            <Text style={styles.globalLabel}>{t('stats.totalQuestions')}</Text>
          </View>
        </View>

        {/* Player Stats */}
        <Text style={styles.sectionTitle}>{t('stats.players')}</Text>
        {sortedPlayers.map((player, index) => {
          const st = playerStats[player.id] || {};
          const mostWith = st.mostPlayedWithId
            ? players.find((p) => p.id === st.mostPlayedWithId)
            : null;
          return (
            <View key={player.id} style={styles.playerCard}>
              <View style={styles.playerCardTop}>
                <Text style={styles.rankBadge}>#{index + 1}</Text>
                <PlayerAvatar player={player} size="sm" />
                <View style={{ flex: 1 }}>
                  <Text style={styles.playerName}>
                    {player.name}
                    {player.isMainUser ? ` (${t('stats.you')})` : ''}
                  </Text>
                  <Text style={styles.playerGames}>
                    {t('stats.gamesPlayed', { count: st.gamesPlayed || 0 })}
                  </Text>
                </View>
                <ScoreBadge count={st.totalShots || 0} size="md" />
              </View>

              <View style={styles.playerCardStats}>
                {mostWith && (
                  <View style={styles.metaStat}>
                    <MaterialCommunityIcons name="heart" size={12} color={Colors.textMuted} />
                    <Text style={styles.metaStatText}>
                      {t('stats.mostPlayedWith')}: {mostWith.name}
                    </Text>
                  </View>
                )}
                {st.lastPlayedAt && (
                  <View style={styles.metaStat}>
                    <MaterialCommunityIcons name="clock-outline" size={12} color={Colors.textMuted} />
                    <Text style={styles.metaStatText}>
                      {t('stats.lastPlayed')}: {formatDate(st.lastPlayedAt, i18n.language)}
                    </Text>
                  </View>
                )}
                {st.gamesPlayed > 0 && (
                  <View style={styles.metaStat}>
                    <MaterialCommunityIcons name="trending-up" size={12} color={Colors.textMuted} />
                    <Text style={styles.metaStatText}>
                      {t('stats.avgShotsPerGame')}: {(st.totalShots / st.gamesPlayed).toFixed(1)}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  headerTitle: { ...Typography.h2 },
  scroll: {
    paddingBottom: Spacing.xxl,
  },
  emptyText: {
    ...Typography.bodySmall,
    textAlign: 'center',
    marginTop: Spacing.md,
    lineHeight: 22,
  },
  globalRow: {
    flexDirection: 'row',
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.xl,
    gap: Spacing.sm,
  },
  globalCard: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  globalCardMiddle: {
    borderColor: Colors.danger + '44',
  },
  globalNum: {
    ...Typography.h2,
    color: Colors.primary,
  },
  globalLabel: {
    ...Typography.caption,
    textAlign: 'center',
    marginTop: 2,
  },
  sectionTitle: {
    ...Typography.h3,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.md,
  },
  playerCard: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.sm,
  },
  playerCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  rankBadge: {
    ...Typography.caption,
    color: Colors.textMuted,
    width: 24,
  },
  playerEmoji: { fontSize: 24 },
  playerName: { ...Typography.bodyMedium },
  playerGames: { ...Typography.caption, color: Colors.textMuted },
  playerCardStats: {
    gap: 4,
    paddingLeft: Spacing.xl + Spacing.sm,
  },
  metaStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaStatText: {
    ...Typography.caption,
    color: Colors.textMuted,
  },
});
