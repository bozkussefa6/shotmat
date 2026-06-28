import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

import {
  Colors,
  Spacing,
  Typography,
  BorderRadius,
  Buttons,
  Layout,
  Shadows,
} from '../styles/GlobalStyles';
import StorageService from '../services/StorageService';
import GameService from '../services/GameService';
import ShotBadge from '../components/ShotBadge';
import ScreenHeader from '../components/ScreenHeader';

export default function GameStatusScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const route = useRoute();
  const { gameId } = route.params || {};

  const [game, setGame] = useState(null);
  const [players, setPlayers] = useState([]);
  const [shotCounts, setShotCounts] = useState({});

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
    const gamePlayers = playerList.filter((p) => g.playerIds.includes(p.id));
    setPlayers(gamePlayers);
    setShotCounts(GameService.calculateShotCounts(g));
  };

  const handleEndGame = () => {
    Alert.alert(
      t('gameStatus.endGame'),
      t('gameStatus.endGameConfirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('gameStatus.endGame'),
          style: 'destructive',
          onPress: async () => {
            await GameService.endGame(gameId);
            navigation.replace('GameEnd', { gameId });
          },
        },
      ]
    );
  };

  const sortedPlayers = [...players].sort(
    (a, b) => (shotCounts[b.id] || 0) - (shotCounts[a.id] || 0)
  );

  const questionsDone = game?.rounds?.filter((r) => !r.skipped).length || 0;

  return (
    <SafeAreaView style={Layout.screen}>
      <ScreenHeader title={t('gameStatus.title')} onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Questions done */}
        <View style={styles.statCard}>
          <MaterialCommunityIcons name="cards" size={28} color={Colors.primary} />
          <Text style={styles.statNumber}>{questionsDone}</Text>
          <Text style={styles.statLabel}>{t('gameStatus.questionsDone', { count: questionsDone })}</Text>
        </View>

        {/* Leaderboard */}
        <Text style={styles.sectionTitle}>{t('gameStatus.shotCounts')}</Text>
        {sortedPlayers.map((player, index) => {
          const shots = shotCounts[player.id] || 0;
          const maxShots = Math.max(...Object.values(shotCounts), 1);
          const barWidth = `${(shots / maxShots) * 100}%`;
          return (
            <View key={player.id} style={styles.playerRow}>
              <Text style={styles.rank}>#{index + 1}</Text>
              <Text style={styles.playerEmoji}>{player.emoji}</Text>
              <View style={{ flex: 1 }}>
                <View style={styles.playerNameRow}>
                  <Text style={styles.playerName}>{player.name}</Text>
                  <ShotBadge count={shots} size="sm" variant="inline" />
                </View>
                <View style={styles.barBg}>
                  <View style={[styles.barFill, { width: barWidth, backgroundColor: shots > 0 ? Colors.danger : Colors.border }]} />
                </View>
              </View>
            </View>
          );
        })}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[Buttons.secondary, styles.endBtn]}
          onPress={handleEndGame}
          activeOpacity={0.85}
        >
          <Text style={Buttons.secondaryText}>{t('gameStatus.endGame')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={Buttons.primary}
          onPress={() => navigation.goBack()}
          activeOpacity={0.85}
        >
          <Text style={Buttons.primaryText}>{t('gameStatus.continueGame')}</Text>
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
  backBtn: {
    padding: Spacing.xs,
  },
  headerTitle: {
    ...Typography.h3,
  },
  scroll: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  statCard: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    alignItems: 'center',
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.sm,
  },
  statNumber: {
    ...Typography.h1,
    color: Colors.primary,
  },
  statLabel: {
    ...Typography.bodySmall,
  },
  sectionTitle: {
    ...Typography.h3,
    marginBottom: Spacing.md,
  },
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.sm,
  },
  rank: {
    ...Typography.caption,
    color: Colors.textMuted,
    width: 24,
    textAlign: 'center',
  },
  playerEmoji: {
    fontSize: 24,
  },
  playerNameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  playerName: {
    ...Typography.bodyMedium,
  },
  shotCount: {
    ...Typography.bodySmall,
    color: Colors.primary,
    fontWeight: '700',
  },
  barBg: {
    height: 4,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: BorderRadius.full,
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.lg,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: Spacing.sm,
  },
  endBtn: {
    flex: 1,
  },
});
