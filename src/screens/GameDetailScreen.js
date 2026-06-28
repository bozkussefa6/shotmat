import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SectionList,
  Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import * as Sharing from 'expo-sharing';

import {
  Colors,
  Spacing,
  Typography,
  BorderRadius,
  Buttons,
  Layout,
  TypeColors,
} from '../styles/GlobalStyles';
import StorageService from '../services/StorageService';
import GameService from '../services/GameService';
import ShotBadge from '../components/ShotBadge';

import ScreenHeader from '../components/ScreenHeader';
import { formatDateWithYear } from '../utils/formatDate';

export default function GameDetailScreen() {
  const { t, i18n } = useTranslation();
  const navigation = useNavigation();
  const route = useRoute();
  const { gameId } = route.params || {};

  const [game, setGame] = useState(null);
  const [players, setPlayers] = useState([]);
  const [shotCounts, setShotCounts] = useState({});
  const [activeTab, setActiveTab] = useState('results');

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

  const handleShare = async () => {
    if (game?.resultImageUri) {
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(game.resultImageUri, { mimeType: 'image/png' });
      }
    } else {
      Alert.alert(t('common.error'), t('gameEnd.shareError'));
    }
  };

  const sortedPlayers = [...players].sort(
    (a, b) => (shotCounts[b.id] || 0) - (shotCounts[a.id] || 0)
  );

  const lang = i18n.language === 'tr' ? 'tr' : 'en';

  const getRoundSummary = (round) => {
    if (round.skipped) return t('gameDetail.skipped');
    const targetPlayer = round.targetPlayerId
      ? players.find((p) => p.id === round.targetPlayerId)
      : null;
    const shotTakerNames = round.shotTakers
      ?.map((id) => players.find((p) => p.id === id)?.name)
      .filter(Boolean)
      .join(', ');

    if (round.question.type === 'dare') {
      return round.dareCompleted
        ? t('gameDetail.dareCompleted')
        : `${targetPlayer?.name || ''} — ${t('gameDetail.dareNotCompleted')}`;
    }
    if (round.question.type === 'personal') {
      return round.dareCompleted === false
        ? `${targetPlayer?.name || ''} — ${t('gameDetail.personalNotAnswered')}`
        : t('gameDetail.personalAnswered');
    }
    if (shotTakerNames) return t('gameDetail.shotBy', { names: shotTakerNames });
    return t('gameDetail.noShot');
  };

  if (!game && players.length === 0) {
    return (
      <SafeAreaView style={Layout.screen}>
        <ScreenHeader title={t('gameDetail.title')} onBack={() => navigation.goBack()} />
        <View style={[Layout.centered, { flex: 1 }]}>
          <MaterialCommunityIcons name="alert-circle-outline" size={48} color={Colors.textMuted} />
          <Text style={{ ...Typography.bodySmall, textAlign: 'center', marginTop: Spacing.md }}>
            {t('gameDetail.notFound')}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={Layout.screen}>
      <ScreenHeader
        title={t('gameDetail.title')}
        subtitle={formatDateWithYear(game?.createdAt || '', i18n.language)}
        onBack={() => navigation.goBack()}
        right={
          game?.resultImageUri ? (
            <TouchableOpacity onPress={handleShare} style={styles.shareBtn}>
              <MaterialCommunityIcons name="share-variant" size={22} color={Colors.primary} />
            </TouchableOpacity>
          ) : null
        }
      />

      {/* Tabs */}
      <View style={styles.tabs}>
        {['results', 'questions'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {t(`gameDetail.${tab}`)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {activeTab === 'results' ? (
        <SectionList
          sections={[{ title: '', data: sortedPlayers }]}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item: player, index }) => (
            <View style={[styles.playerRow, player.deleted && styles.playerRowDeleted]}>
              <Text style={styles.rank}>#{index + 1}</Text>
              <Text style={styles.playerEmoji}>{player.emoji}</Text>
              <Text style={[styles.playerName, player.deleted && styles.playerNameDeleted]}>
                {player.name}
              </Text>
              <ShotBadge count={shotCounts[player.id] || 0} size="sm" />
            </View>
          )}
        />
      ) : (
        <SectionList
          sections={[{ title: '', data: game?.rounds || [] }]}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item: round, index }) => {
            const typeColor = TypeColors[round.question?.type] || Colors.primary;
            const qText = round.question?.[lang] || round.question?.tr || '';
            const targetPlayer = round.targetPlayerId
              ? players.find((p) => p.id === round.targetPlayerId)
              : null;
            const formattedQ = targetPlayer
              ? GameService.formatQuestionText(qText, targetPlayer.name, lang)
              : qText;
            return (
              <View style={[styles.roundCard, round.skipped && styles.roundSkipped]}>
                <View style={styles.roundHeader}>
                  <Text style={styles.roundNum}>{index + 1}</Text>
                  <View style={[styles.typeDot, { backgroundColor: typeColor }]} />
                  {round.skipped && (
                    <Text style={styles.skippedBadge}>{t('gameDetail.skipped')}</Text>
                  )}
                </View>
                <Text style={styles.roundQuestion} numberOfLines={3}>{formattedQ}</Text>
                <Text style={styles.roundSummary}>{getRoundSummary(round)}</Text>
              </View>
            );
          }}
        />
      )}
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
  backBtn: { padding: Spacing.xs },
  headerTitle: { ...Typography.h3 },
  headerDate: { ...Typography.caption, color: Colors.textSecondary },
  shareBtn: { padding: Spacing.xs },
  tabs: {
    flexDirection: 'row',
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.md,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    borderRadius: BorderRadius.sm,
  },
  tabActive: { backgroundColor: Colors.primary },
  tabText: { ...Typography.buttonSmall, color: Colors.textSecondary },
  tabTextActive: { color: Colors.background },
  list: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xxl,
    gap: Spacing.sm,
  },
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.sm,
  },
  rank: { ...Typography.caption, color: Colors.textMuted, width: 24, textAlign: 'center' },
  playerEmoji: { fontSize: 22 },
  playerName: { ...Typography.bodyMedium, flex: 1 },
  playerRowDeleted: { opacity: 0.45 },
  playerNameDeleted: { fontStyle: 'italic', color: Colors.textMuted },
  roundCard: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.xs,
  },
  roundSkipped: { opacity: 0.5 },
  roundHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  roundNum: { ...Typography.caption, color: Colors.textMuted, width: 20 },
  typeDot: { width: 8, height: 8, borderRadius: 4 },
  skippedBadge: { ...Typography.caption, color: Colors.textMuted, fontStyle: 'italic' },
  roundQuestion: { ...Typography.bodySmall, color: Colors.textPrimary, lineHeight: 20 },
  roundSummary: { ...Typography.caption, color: Colors.textSecondary },
});
