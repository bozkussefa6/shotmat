import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import {
  Colors,
  Spacing,
  Typography,
  BorderRadius,
  Buttons,
  TypeColors,
  Shadows,
} from '../styles/GlobalStyles';
import StorageService from '../services/StorageService';
import GameService from '../services/GameService';
import ScreenHeader from '../components/ScreenHeader';
import ScreenSafeArea from '../components/ScreenSafeArea';
import { QUESTION_COUNT_BY_TYPE } from '../data/questions';
import PlayerAvatar from '../components/PlayerAvatar';
import { getAvatarColor } from '../utils/playerAvatar';
import { isDuplicatePlayerName } from '../utils/playerNames';

const STEPS = ['players', 'categories', 'mode'];
const QUESTION_MODES = ['system_only', 'mixed', 'user_first', 'system_random'];

export default function GameSetupScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();

  const [step, setStep] = useState(0);
  const [savedPlayers, setSavedPlayers] = useState([]);
  const [selectedPlayerIds, setSelectedPlayerIds] = useState([]);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [addingNew, setAddingNew] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState(['group', 'personal', 'dare']);
  const [questionMode, setQuestionMode] = useState('system_only');
  const [hasCustomQuestions, setHasCustomQuestions] = useState(false);
  const [mainUser, setMainUser] = useState(null);
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [players, user, customQ, cfg] = await Promise.all([
      StorageService.getPlayers(),
      StorageService.getMainUser(),
      StorageService.getCustomQuestions(),
      StorageService.getSettings(),
    ]);
    setSavedPlayers(players.filter((p) => !p.deleted));
    setMainUser(user);
    setHasCustomQuestions(customQ.length > 0);
    setQuestionMode(cfg.questionMode || 'system_only');
    if (user) setSelectedPlayerIds([user.id]);
  };

  const estimatedQuestions = () => {
    return selectedTypes.reduce((sum, t) => sum + (QUESTION_COUNT_BY_TYPE[t] || 0), 0);
  };

  const togglePlayer = (id) => {
    setSelectedPlayerIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleType = (type) => {
    setSelectedTypes((prev) =>
      prev.includes(type)
        ? prev.length > 1 ? prev.filter((t) => t !== type) : prev
        : [...prev, type]
    );
  };

  const addNewPlayer = async () => {
    if (!newPlayerName.trim()) return;
    if (isDuplicatePlayerName(newPlayerName, savedPlayers)) {
      Alert.alert(t('common.error'), t('players.nameTaken'));
      return;
    }
    const player = {
      id: GameService.generateId(),
      name: newPlayerName.trim(),
      color: getAvatarColor(newPlayerName.trim()),
      isMainUser: false,
      createdAt: new Date().toISOString(),
    };
    await StorageService.addPlayer(player);
    setSavedPlayers((prev) => [...prev, player]);
    setSelectedPlayerIds((prev) => [...prev, player.id]);
    setNewPlayerName('');
    setAddingNew(false);
  };

  const goNext = () => {
    if (step === 0) {
      if (selectedPlayerIds.length < 2) {
        Alert.alert(t('common.error'), t('gameSetup.minPlayersError'));
        return;
      }
    }
    if (step === 1) {
      if (selectedTypes.length === 0) {
        Alert.alert(t('common.error'), t('gameSetup.minCategoryError'));
        return;
      }
    }
    if (step < STEPS.length - 1) {
      setStep((s) => s + 1);
    } else {
      startGame();
    }
  };

  const startGame = async () => {
    const allGames = await StorageService.getGames();
    const active = allGames.find((g) => g.status === 'active');
    if (active) {
      Alert.alert(
        t('gameSetup.title'),
        t('gameSetup.activeGameAlert'),
        [
          { text: t('common.cancel'), style: 'cancel' },
          {
            text: t('gameSetup.abandonGame'),
            style: 'destructive',
            onPress: async () => {
              await GameService.abandonActiveGames();
              doStartGame();
            },
          },
        ]
      );
    } else {
      doStartGame();
    }
  };

  const doStartGame = async () => {
    const players = savedPlayers.filter((p) => selectedPlayerIds.includes(p.id));
    const game = await GameService.createGame(players, questionMode, selectedTypes);
    navigation.replace('QuestionTransition', { gameId: game.id, isFirst: true });
  };

  const modeKey = (mode) => {
    const map = {
      system_only: 'modeSystemOnly',
      mixed: 'modeMixed',
      user_first: 'modeUserFirst',
      system_random: 'modeSystemRandom',
    };
    return map[mode];
  };

  const modeDescKey = (mode) => `${modeKey(mode)}Desc`;

  return (
    <ScreenSafeArea edges={['top', 'left', 'right', 'bottom']}>
      <ScreenHeader
        title={t('gameSetup.title')}
        subtitle={t('gameSetup.stepOf', { current: step + 1, total: STEPS.length })}
        onBack={() => (step > 0 ? setStep((s) => s - 1) : navigation.goBack())}
      />

      {/* Step Indicator */}
      <View style={styles.stepRow}>
        {STEPS.map((s, i) => (
          <View key={s} style={[styles.stepDot, i <= step && styles.stepDotActive]} />
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* STEP 0: Players */}
        {step === 0 && (
          <View>
            <Text style={styles.stepTitle}>{t('gameSetup.step1')}</Text>
            {savedPlayers.map((player) => {
              const selected = selectedPlayerIds.includes(player.id);
              return (
                <TouchableOpacity
                  key={player.id}
                  style={[styles.playerRow, selected && styles.playerRowSelected]}
                  onPress={() => togglePlayer(player.id)}
                  activeOpacity={0.8}
                >
                  <PlayerAvatar player={player} size="sm" selected={selected} />
                  <Text style={styles.playerName}>
                    {player.name}
                    {player.isMainUser ? ` (${t('gameSetup.me')})` : ''}
                  </Text>
                  <MaterialCommunityIcons
                    name={selected ? 'check-circle' : 'circle-outline'}
                    size={24}
                    color={selected ? Colors.primary : Colors.textMuted}
                  />
                </TouchableOpacity>
              );
            })}

            {addingNew ? (
              <View style={styles.newPlayerRow}>
                <TextInput
                  style={styles.newPlayerInput}
                  placeholder={t('gameSetup.newPlayerPlaceholder')}
                  placeholderTextColor={Colors.textMuted}
                  value={newPlayerName}
                  onChangeText={setNewPlayerName}
                  autoFocus
                  returnKeyType="done"
                  onSubmitEditing={addNewPlayer}
                  maxLength={25}
                />
                <TouchableOpacity style={styles.addBtn} onPress={addNewPlayer}>
                  <MaterialCommunityIcons name="check" size={20} color={Colors.background} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setAddingNew(false)}>
                  <MaterialCommunityIcons name="close" size={20} color={Colors.textSecondary} />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity style={styles.addPlayerBtn} onPress={() => setAddingNew(true)}>
                <MaterialCommunityIcons name="plus" size={20} color={Colors.primary} />
                <Text style={styles.addPlayerText}>{t('gameSetup.addPlayer')}</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* STEP 1: Categories */}
        {step === 1 && (
          <View>
            <Text style={styles.stepTitle}>{t('gameSetup.step2')}</Text>
            <Text style={styles.stepSubtitle}>{t('gameSetup.categoriesSubtitle')}</Text>
            {[
              { key: 'group', icon: 'account-group', color: Colors.groupType },
              { key: 'personal', icon: 'comment-question', color: Colors.personalType },
              { key: 'dare', icon: 'lightning-bolt', color: Colors.dareType },
            ].map(({ key, icon, color }) => {
              const selected = selectedTypes.includes(key);
              return (
                <TouchableOpacity
                  key={key}
                  style={[styles.categoryCard, selected && { borderColor: color }]}
                  onPress={() => toggleType(key)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.categoryIcon, { backgroundColor: color + '22' }]}>
                    <MaterialCommunityIcons name={icon} size={24} color={color} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.categoryName}>{t(`gameSetup.category${key.charAt(0).toUpperCase() + key.slice(1)}`)}</Text>
                    <Text style={styles.categoryDesc}>{t(`gameSetup.category${key.charAt(0).toUpperCase() + key.slice(1)}Desc`)}</Text>
                  </View>
                  <MaterialCommunityIcons
                    name={selected ? 'toggle-switch' : 'toggle-switch-off-outline'}
                    size={32}
                    color={selected ? color : Colors.textMuted}
                  />
                </TouchableOpacity>
              );
            })}
            <View style={styles.estimateRow}>
              <MaterialCommunityIcons name="cards" size={16} color={Colors.textSecondary} />
              <Text style={styles.estimateText}>
                {t('gameSetup.estimatedQuestions', { count: estimatedQuestions() })}
              </Text>
            </View>
          </View>
        )}

        {/* STEP 2: Question Mode */}
        {step === 2 && (
          <View>
            <Text style={styles.stepTitle}>{t('gameSetup.step3')}</Text>
            <Text style={styles.stepSubtitle}>{t('gameSetup.questionModeSubtitle')}</Text>
            {!hasCustomQuestions && (
              <View style={styles.infoBox}>
                <MaterialCommunityIcons name="information" size={16} color={Colors.primary} />
                <Text style={styles.infoText}>{t('gameSetup.noCustomQuestions')}</Text>
              </View>
            )}
            {QUESTION_MODES.map((mode) => {
              const selected = questionMode === mode;
              const disabled = !hasCustomQuestions && mode !== 'system_only' && mode !== 'system_random';
              return (
                <TouchableOpacity
                  key={mode}
                  style={[styles.modeCard, selected && styles.modeCardSelected, disabled && styles.modeCardDisabled]}
                  onPress={() => !disabled && setQuestionMode(mode)}
                  activeOpacity={disabled ? 1 : 0.8}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.modeName, disabled && { color: Colors.textMuted }]}>
                      {t(`gameSetup.${modeKey(mode)}`)}
                    </Text>
                    <Text style={styles.modeDesc}>{t(`gameSetup.${modeDescKey(mode)}`)}</Text>
                  </View>
                  {selected && (
                    <MaterialCommunityIcons name="check-circle" size={22} color={Colors.primary} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* Footer CTA */}
      <View style={styles.footer}>
        <TouchableOpacity style={Buttons.primary} onPress={goNext} activeOpacity={0.85}>
          <Text style={Buttons.primaryText}>
            {step < STEPS.length - 1 ? t('common.next') : t('gameSetup.startParty')}
          </Text>
        </TouchableOpacity>
      </View>
    </ScreenSafeArea>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  backBtn: {
    padding: Spacing.xs,
    marginRight: Spacing.sm,
  },
  headerTitle: {
    ...Typography.h3,
    flex: 1,
  },
  stepCount: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  stepRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.md,
  },
  stepDot: {
    flex: 1,
    height: 3,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.border,
  },
  stepDotActive: {
    backgroundColor: Colors.primary,
  },
  scroll: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xxl,
  },
  stepTitle: {
    ...Typography.h2,
    marginBottom: Spacing.xs,
  },
  stepSubtitle: {
    ...Typography.bodySmall,
    marginBottom: Spacing.lg,
  },
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1.5,
    borderColor: Colors.border,
    gap: Spacing.sm,
  },
  playerRowSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.card,
  },
  playerEmoji: {
    fontSize: 24,
  },
  playerName: {
    ...Typography.bodyMedium,
    flex: 1,
  },
  newPlayerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  newPlayerInput: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    ...Typography.body,
    color: Colors.textPrimary,
  },
  addBtn: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.sm,
    padding: Spacing.sm,
  },
  cancelBtn: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.sm,
    padding: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  addPlayerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderStyle: 'dashed',
    marginBottom: Spacing.sm,
  },
  addPlayerText: {
    ...Typography.bodyMedium,
    color: Colors.primary,
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1.5,
    borderColor: Colors.border,
    gap: Spacing.md,
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryName: {
    ...Typography.bodyMedium,
    marginBottom: 2,
  },
  categoryDesc: {
    ...Typography.caption,
  },
  estimateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.sm,
    paddingHorizontal: Spacing.xs,
  },
  estimateText: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    gap: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.primary + '44',
  },
  infoText: {
    ...Typography.caption,
    flex: 1,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  modeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1.5,
    borderColor: Colors.border,
    gap: Spacing.sm,
  },
  modeCardSelected: {
    borderColor: Colors.primary,
  },
  modeCardDisabled: {
    opacity: 0.4,
  },
  modeName: {
    ...Typography.bodyMedium,
    marginBottom: 2,
  },
  modeDesc: {
    ...Typography.caption,
  },
  footer: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.lg,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
});
