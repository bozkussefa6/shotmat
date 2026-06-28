import React, { useState, useCallback } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  FlatList,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';

import {
  Colors,
  Spacing,
  Typography,
  BorderRadius,
  Buttons,
  Layout,
  Shadows,
  Gradients,
} from '../styles/GlobalStyles';
import StorageService from '../services/StorageService';
import GameService from '../services/GameService';
import ShotBadge from '../components/ShotBadge';
import AppLogo from '../components/AppLogo';
import { formatDate } from '../utils/formatDate';

export default function HomeScreen() {
  const { t, i18n } = useTranslation();
  const navigation = useNavigation();
  const [mainUser, setMainUser] = useState(null);
  const [recentGames, setRecentGames] = useState([]);
  const [players, setPlayers] = useState([]);
  const [stats, setStats] = useState({ totalParties: 0, totalShots: 0, avgShots: '—' });
  const [activeGame, setActiveGame] = useState(null);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    const [user, games, playerList] = await Promise.all([
      StorageService.getMainUser(),
      StorageService.getGames(),
      StorageService.getPlayers(),
    ]);
    setMainUser(user);
    setPlayers(playerList);
    setActiveGame(games.find((g) => g.status === 'active') || null);
    const ended = games.filter((g) => g.status === 'ended');
    setRecentGames(ended.slice(0, 3));

    let totalShots = 0;
    const shotMap = {};
    ended.forEach((g) => {
      g.rounds?.forEach((r) => {
        if (!r.skipped) {
          r.shotTakers?.forEach((id) => {
            totalShots++;
            shotMap[id] = (shotMap[id] || 0) + 1;
          });
        }
      });
    });
    const avgShots = ended.length > 0 ? (totalShots / ended.length).toFixed(1) : '—';
    setStats({ totalParties: ended.length, totalShots, avgShots });
  };

  const handleStartGame = () => {
    navigation.navigate('GameFlow', { screen: 'GameSetup' });
  };

  return (
    <SafeAreaView style={Layout.screen}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <LinearGradient
          colors={Gradients.warmHeader}
          style={styles.header}
        >
          <AppLogo size="sm" />
          <Text style={styles.greeting}>
            {t('home.greeting', { name: mainUser?.name || '...' })}
          </Text>
          <Text style={styles.tagline}>{t('brand.tagline')}</Text>
        </LinearGradient>

        {/* Active game resume banner */}
        {activeGame && (
          <TouchableOpacity
            style={styles.resumeCard}
            onPress={() => navigation.navigate('GameFlow', {
              screen: 'QuestionTransition',
              params: { gameId: activeGame.id },
            })}
            activeOpacity={0.85}
          >
            <View style={styles.resumeLeft}>
              <MaterialCommunityIcons name="play-pause" size={22} color={Colors.background} />
              <View>
                <Text style={styles.resumeTitle}>{t('home.activeGame')}</Text>
                <Text style={styles.resumeSub}>{t('home.activeGameSub')}</Text>
              </View>
            </View>
            <View style={styles.resumeBtn}>
              <Text style={styles.resumeBtnText}>{t('home.resumeGame')}</Text>
              <MaterialCommunityIcons name="chevron-right" size={16} color={Colors.background} />
            </View>
          </TouchableOpacity>
        )}

        {/* Start CTA */}
        <TouchableOpacity
          style={styles.startButton}
          onPress={handleStartGame}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={Gradients.primaryButton}
            style={styles.startGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <MaterialCommunityIcons name="play-circle" size={32} color={Colors.background} />
            <Text style={styles.startText}>{t('home.startGame')}</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Quick Stats */}
        {stats.totalParties > 0 && (
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{stats.totalParties}</Text>
              <Text style={styles.statLabel}>{t('home.totalParties')}</Text>
            </View>
            <View style={[styles.statCard, styles.statCardMiddle]}>
              <Text style={styles.statNumber}>{stats.totalShots}</Text>
              <Text style={styles.statLabel}>{t('home.totalShots')}</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{stats.avgShots}</Text>
              <Text style={styles.statLabel}>{t('home.avgShotsPerGame')}</Text>
            </View>
          </View>
        )}

        {/* Recent Parties */}
        <View style={styles.section}>
          <View style={Layout.rowBetween}>
            <Text style={styles.sectionTitle}>{t('home.recentParties')}</Text>
            {recentGames.length > 0 && (
              <TouchableOpacity onPress={() => navigation.navigate('Parties')}>
                <Text style={styles.viewAll}>{t('home.viewAll')}</Text>
              </TouchableOpacity>
            )}
          </View>

          {recentGames.length === 0 ? (
            <View style={styles.emptyCard}>
              <MaterialCommunityIcons name="glass-cocktail" size={40} color={Colors.textMuted} />
              <Text style={styles.emptyText}>{t('home.noRecentParties')}</Text>
            </View>
          ) : (
            recentGames.map((game) => {
              const shotCounts = GameService.calculateShotCounts(game);
              const totalShots = Object.values(shotCounts).reduce((a, b) => a + b, 0);
              const gamePlayers = players.filter((p) => game.playerIds.includes(p.id));
              return (
                <TouchableOpacity
                  key={game.id}
                  style={styles.gameCard}
                  onPress={() =>
                    navigation.navigate('Parties', {
                      screen: 'GameDetail',
                      params: { gameId: game.id },
                    })
                  }
                  activeOpacity={0.8}
                >
                  <View style={Layout.rowBetween}>
                    <View>
                      <Text style={styles.gameDate}>{formatDate(game.createdAt, i18n.language)}</Text>
                      <Text style={styles.gamePlayers}>
                        {gamePlayers.map((p) => p.name).join(', ')}
                      </Text>
                    </View>
                    <ShotBadge count={totalShots} size="sm" />
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingBottom: Spacing.xxl,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  greeting: {
    ...Typography.h2,
    marginBottom: Spacing.xs,
  },
  tagline: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
  resumeCard: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  resumeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    flex: 1,
  },
  resumeTitle: {
    ...Typography.bodyMedium,
    color: Colors.background,
    fontWeight: '700',
  },
  resumeSub: {
    ...Typography.caption,
    color: Colors.background,
    opacity: 0.75,
  },
  resumeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: 'rgba(0,0,0,0.15)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  resumeBtnText: {
    ...Typography.caption,
    color: Colors.background,
    fontWeight: '700',
  },
  startButton: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    ...Shadows.primary,
  },
  startGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.lg,
    gap: Spacing.sm,
  },
  startText: {
    ...Typography.h3,
    color: Colors.background,
    fontWeight: '800',
  },
  statsRow: {
    flexDirection: 'row',
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statCardMiddle: {
    borderColor: Colors.primary,
    borderWidth: 1,
  },
  statNumber: {
    ...Typography.h2,
    color: Colors.primary,
  },
  statLabel: {
    ...Typography.caption,
    marginTop: 2,
    textAlign: 'center',
  },
  section: {
    paddingHorizontal: Spacing.lg,
  },
  sectionTitle: {
    ...Typography.h3,
    marginBottom: Spacing.md,
  },
  viewAll: {
    ...Typography.bodySmall,
    color: Colors.primary,
  },
  emptyCard: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.sm,
  },
  emptyText: {
    ...Typography.bodySmall,
    textAlign: 'center',
    lineHeight: 22,
  },
  gameCard: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  gameDate: {
    ...Typography.bodyMedium,
    marginBottom: 2,
  },
  gamePlayers: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
});
