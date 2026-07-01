import React, { useState, useCallback } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  TextInput,
  Alert,
  Modal,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';

import {
  Colors,
  Spacing,
  Typography,
  BorderRadius,
  Buttons,
  Layout,
  AvatarColors,
} from '../styles/GlobalStyles';
import StorageService from '../services/StorageService';
import GameService from '../services/GameService';
import ScreenHeader from '../components/ScreenHeader';
import PlayerAvatar from '../components/PlayerAvatar';
import { getAvatarColor } from '../utils/playerAvatar';
import { isDuplicatePlayerName } from '../utils/playerNames';

export default function PlayersScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const [players, setPlayers] = useState([]);
  const [playerStats, setPlayerStats] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState(null);
  const [nameInput, setNameInput] = useState('');
  const [selectedColor, setSelectedColor] = useState(AvatarColors[0]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    const list = await StorageService.getPlayers();
    const activePlayers = list.filter((p) => !p.deleted);
    setPlayers(activePlayers);
    const stats = {};
    for (const p of activePlayers) {
      stats[p.id] = await StorageService.getPlayerStats(p.id);
    }
    setPlayerStats(stats);
  };

  const openAdd = () => {
    setEditingPlayer(null);
    setNameInput('');
    setSelectedColor(AvatarColors[Math.floor(Math.random() * AvatarColors.length)]);
    setModalVisible(true);
  };

  const openEdit = (player) => {
    setEditingPlayer(player);
    setNameInput(player.name);
    setSelectedColor(player.color || getAvatarColor(player.name));
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!nameInput.trim()) return;
    if (isDuplicatePlayerName(nameInput, players, editingPlayer?.id)) {
      Alert.alert(t('common.error'), t('players.nameTaken'));
      return;
    }
    if (editingPlayer) {
      await StorageService.updatePlayer(editingPlayer.id, {
        name: nameInput.trim(),
        color: selectedColor,
      });
    } else {
      await StorageService.addPlayer({
        id: GameService.generateId(),
        name: nameInput.trim(),
        color: selectedColor,
        isMainUser: false,
        createdAt: new Date().toISOString(),
      });
    }
    setModalVisible(false);
    loadData();
  };

  const handleDelete = (player) => {
    if (player.isMainUser) return;
    Alert.alert(
      t('players.deleteConfirm', { name: player.name }),
      t('players.deleteWarning'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            await StorageService.deletePlayer(player.id);
            loadData();
          },
        },
      ]
    );
  };

  const renderPlayer = ({ item: player }) => {
    const st = playerStats[player.id] || {};
    return (
      <View style={styles.playerCard}>
        <PlayerAvatar player={player} size="md" />
        <View style={{ flex: 1 }}>
          <Text style={styles.playerName}>
            {player.name}
            {player.isMainUser ? ` ${t('players.you')}` : ''}
          </Text>
          <Text style={styles.playerMeta}>
            {t('players.games', { count: st.gamesPlayed || 0 })} · {t('players.shots', { count: st.totalShots || 0 })}
          </Text>
        </View>
        <TouchableOpacity style={styles.editBtn} onPress={() => openEdit(player)}>
          <MaterialCommunityIcons name="pencil" size={18} color={Colors.textSecondary} />
        </TouchableOpacity>
        {!player.isMainUser && (
          <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(player)}>
            <MaterialCommunityIcons name="delete-outline" size={18} color={Colors.danger} />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={Layout.screen}>
      <ScreenHeader
        title={t('players.title')}
        onBack={() => navigation.goBack()}
        right={
          <TouchableOpacity style={styles.addBtn} onPress={openAdd}>
            <MaterialCommunityIcons name="plus" size={24} color={Colors.primary} />
          </TouchableOpacity>
        }
      />

      <FlatList
        data={players}
        renderItem={renderPlayer}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.emptyText}>{t('players.empty')}</Text>
        }
      />

      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              {editingPlayer ? t('players.editPlayer') : t('players.addNew')}
            </Text>

            <View style={styles.previewRow}>
              <PlayerAvatar
                player={{ name: nameInput || '?', color: selectedColor }}
                size="lg"
              />
            </View>

            <View style={styles.colorGrid}>
              {AvatarColors.map((color) => (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.colorSwatch,
                    { backgroundColor: color },
                    selectedColor === color && styles.colorSwatchActive,
                  ]}
                  onPress={() => setSelectedColor(color)}
                />
              ))}
            </View>

            <TextInput
              style={styles.nameInput}
              placeholder={t('players.namePlaceholder')}
              placeholderTextColor={Colors.textMuted}
              value={nameInput}
              onChangeText={(text) => {
                setNameInput(text);
                if (!editingPlayer && text.trim()) {
                  setSelectedColor(getAvatarColor(text.trim()));
                }
              }}
              autoCapitalize="words"
              maxLength={25}
              returnKeyType="done"
            />

            <View style={styles.modalBtns}>
              <TouchableOpacity
                style={[Buttons.secondary, { flex: 1 }]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={Buttons.secondaryText}>{t('common.cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[Buttons.primary, { flex: 1 }, !nameInput.trim() && { opacity: 0.4 }]}
                onPress={handleSave}
                disabled={!nameInput.trim()}
              >
                <Text style={Buttons.primaryText}>{t('common.save')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  addBtn: { padding: Spacing.xs },
  list: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xxl,
    gap: Spacing.sm,
  },
  playerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.sm,
  },
  playerName: { ...Typography.bodyMedium },
  playerMeta: { ...Typography.caption, color: Colors.textMuted },
  editBtn: { padding: Spacing.xs },
  deleteBtn: { padding: Spacing.xs },
  emptyText: { ...Typography.bodySmall, textAlign: 'center', marginTop: Spacing.xxl },
  modalOverlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  modalTitle: { ...Typography.h3, textAlign: 'center' },
  previewRow: {
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    justifyContent: 'center',
  },
  colorSwatch: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  colorSwatchActive: {
    borderWidth: 3,
    borderColor: Colors.primary,
  },
  nameInput: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    ...Typography.body,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  modalBtns: { flexDirection: 'row', gap: Spacing.sm, paddingBottom: Spacing.md },
});
