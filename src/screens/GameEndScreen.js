import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import ViewShot from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';

import {
  Colors,
  Spacing,
  Typography,
  BorderRadius,
  Buttons,
  Shadows,
  Gradients,
} from '../styles/GlobalStyles';
import StorageService from '../services/StorageService';
import GameService from '../services/GameService';
import AdService from '../services/AdService';
import PremiumService from '../services/PremiumService';
import ScoreBadge from '../components/ScoreBadge';
import AppLogo from '../components/AppLogo';
import PlayerAvatar from '../components/PlayerAvatar';
import ScreenSafeArea from '../components/ScreenSafeArea';
import { formatDateWithYear } from '../utils/formatDate';
import { resetGameFlowTo } from '../navigation/gameFlowHelpers';

export default function GameEndScreen() {
  const { t, i18n } = useTranslation();
  const navigation = useNavigation();
  const route = useRoute();
  const { gameId } = route.params || {};

  const [game, setGame] = useState(null);
  const [players, setPlayers] = useState([]);
  const [shotCounts, setShotCounts] = useState({});
  const [winners, setWinners] = useState([]);
  const [generating, setGenerating] = useState(false);
  const viewShotRef = useRef(null);

  useEffect(() => {
    loadData();
    AdService.resetCounter();
  }, [gameId]);

  const loadData = async () => {
    const [g, playerList, isPremium] = await Promise.all([
      StorageService.getGameById(gameId),
      StorageService.getPlayers(),
      PremiumService.isPremium(),
    ]);
    if (!g) return;
    setGame(g);
    const gamePlayers = playerList.filter((p) => g.playerIds.includes(p.id));
    setPlayers(gamePlayers);
    const counts = GameService.calculateShotCounts(g);
    setShotCounts(counts);
    const { winnerIds } = GameService.getWinner(g);
    setWinners(winnerIds.map((id) => gamePlayers.find((p) => p.id === id)).filter(Boolean));

    if (!isPremium) {
      await AdService.showInterstitialAd();
    }
  };

  const handleShare = async () => {
    try {
      setGenerating(true);
      const uri = await viewShotRef.current.capture();
      await StorageService.updateGame(gameId, { resultImageUri: uri });
      setGenerating(false);
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(uri, { mimeType: 'image/png' });
      }
    } catch {
      setGenerating(false);
      Alert.alert(t('common.error'), t('gameEnd.shareError'));
    }
  };

  const sortedPlayers = [...players].sort(
    (a, b) => (shotCounts[b.id] || 0) - (shotCounts[a.id] || 0)
  );

  const totalShots = Object.values(shotCounts).reduce((a, b) => a + b, 0);
  const questionsDone = game?.rounds?.filter((r) => !r.skipped).length || 0;

  return (
    <ScreenSafeArea edges={['top', 'left', 'right', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Shareable card captured by ViewShot */}
        <ViewShot ref={viewShotRef} options={{ format: 'png', quality: 0.95 }}>
          <LinearGradient
            colors={Gradients.shareCard}
            style={styles.shareCard}
          >
            <View style={styles.shareCardHeader}>
              <AppLogo size="sm" />
            </View>

            <Text style={styles.shareCardTitle}>{t('gameEnd.title')}</Text>
            <Text style={styles.shareCardDate}>
              {formatDateWithYear(game?.createdAt || new Date().toISOString(), i18n.language)}
            </Text>

            {/* Stats row */}
            <View style={styles.shareStatsRow}>
              <View style={styles.shareStat}>
                <Text style={styles.shareStatNum}>{questionsDone}</Text>
                <Text style={styles.shareStatLabel}>{t('gameEnd.totalQuestions')}</Text>
              </View>
              <View style={[styles.shareStat, styles.shareStatMiddle]}>
                <Text style={[styles.shareStatNum, { color: Colors.danger }]}>{totalShots}</Text>
                <Text style={styles.shareStatLabel}>{t('gameEnd.totalShots')}</Text>
              </View>
              <View style={styles.shareStat}>
                <Text style={styles.shareStatNum}>{players.length}</Text>
                <Text style={styles.shareStatLabel}>{t('gameHistory.players', { count: players.length })}</Text>
              </View>
            </View>

            {/* Winner(s) */}
            {winners.length > 0 && totalShots > 0 && (
              <View style={styles.winnerCard}>
                <Text style={styles.winnerLabel}>
                  {winners.length === 1 ? t('gameEnd.winner') : t('gameEnd.winners')}
                </Text>
                <Text style={styles.winnerName}>
                  {winners.length === 1
                    ? winners[0].name
                    : winners.map((w) => w.name).join(' & ')}
                </Text>
                <Text style={styles.winnerShots}>
                  {t('gameEnd.winnerSubtitle')} · {t('gameEnd.mostShots', { count: shotCounts[winners[0].id] || 0 })}
                </Text>
              </View>
            )}
            {totalShots === 0 && (
              <Text style={styles.noShotsText}>{t('gameEnd.noShots')}</Text>
            )}

            {/* Player scores */}
            <View style={styles.scoreList}>
              {sortedPlayers.map((player, i) => (
                <View key={player.id} style={styles.scoreRow}>
                  <Text style={styles.scoreRank}>{i + 1}.</Text>
                  <PlayerAvatar player={player} size="sm" />
                  <Text style={styles.scoreName}>{player.name}</Text>
                  <ScoreBadge count={shotCounts[player.id] || 0} size="sm" variant="inline" />
                </View>
              ))}
            </View>
          </LinearGradient>
        </ViewShot>

        {/* Action buttons */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[Buttons.primary, styles.shareBtn]}
            onPress={handleShare}
            disabled={generating}
            activeOpacity={0.85}
          >
            {generating ? (
              <ActivityIndicator color={Colors.background} />
            ) : (
              <>
                <MaterialCommunityIcons name="share-variant" size={20} color={Colors.background} />
                <Text style={Buttons.primaryText}>{t('gameEnd.shareResult')}</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[Buttons.secondary, styles.newGameBtn]}
            onPress={() => resetGameFlowTo(navigation, 'GameSetup')}
            activeOpacity={0.85}
          >
            <Text style={Buttons.secondaryText}>{t('gameEnd.newGame')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={Buttons.ghost}
            onPress={() => navigation.getParent()?.goBack()}
            activeOpacity={0.85}
          >
            <Text style={Buttons.ghostText}>{t('gameEnd.backHome')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenSafeArea>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingBottom: Spacing.xxl,
  },
  shareCard: {
    margin: Spacing.md,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.primary + '44',
    gap: Spacing.md,
    ...Shadows.modal,
  },
  shareCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  shareCardTitle: {
    ...Typography.h1,
    color: Colors.primary,
  },
  shareCardDate: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: -Spacing.sm,
  },
  shareStatsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  shareStat: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  shareStatMiddle: {
    borderColor: Colors.danger + '66',
  },
  shareStatNum: {
    ...Typography.h2,
    color: Colors.primary,
  },
  shareStatLabel: {
    ...Typography.caption,
    textAlign: 'center',
  },
  winnerCard: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.primary + '66',
    gap: Spacing.xs,
  },
  winnerLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  winnerName: {
    ...Typography.h2,
    color: Colors.primary,
    textAlign: 'center',
  },
  winnerShots: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
  noShotsText: {
    ...Typography.body,
    textAlign: 'center',
    color: Colors.textSecondary,
  },
  scoreList: {
    gap: Spacing.xs,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  scoreRank: {
    ...Typography.caption,
    color: Colors.textMuted,
    width: 20,
  },
  scoreName: {
    ...Typography.bodySmall,
    flex: 1,
    color: Colors.textPrimary,
  },
  actions: {
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  shareBtn: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  newGameBtn: {},
});
