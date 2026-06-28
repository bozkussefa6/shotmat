import React, { useState, useCallback } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
  Modal,
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
  Buttons,
} from '../styles/GlobalStyles';

const EMOJIS = [
  '🙋', '😎', '🤩', '😈', '🦊', '🐺', '🦁', '🐯', '🌚', '🌝',
  '🤠', '🥳', '😏', '🤑', '😜', '🤪', '🥴', '😤', '🙃', '😇',
  '👻', '🤖', '👽', '🎭', '🧙', '🧛', '🧟', '🦸', '🦹', '🐸',
];
import StorageService from '../services/StorageService';
import PremiumService from '../services/PremiumService';

const MenuItem = ({ icon, label, description, onPress, accent }) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.8}>
    <View style={[styles.menuIcon, accent && { backgroundColor: accent + '22' }]}>
      <MaterialCommunityIcons name={icon} size={22} color={accent || Colors.textSecondary} />
    </View>
    <View style={{ flex: 1 }}>
      <Text style={[styles.menuLabel, accent && { color: accent }]}>{label}</Text>
      {description && <Text style={styles.menuDesc}>{description}</Text>}
    </View>
    <MaterialCommunityIcons name="chevron-right" size={20} color={Colors.textMuted} />
  </TouchableOpacity>
);

export default function ProfileScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const [mainUser, setMainUser] = useState(null);
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [isPremium, setIsPremium] = useState(false);
  const [emojiModalVisible, setEmojiModalVisible] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    const [user, premium] = await Promise.all([
      StorageService.getMainUser(),
      PremiumService.isPremium(),
    ]);
    setMainUser(user);
    setIsPremium(premium);
  };

  const handleSaveName = async () => {
    if (!nameInput.trim()) return;
    const updated = { ...mainUser, name: nameInput.trim() };
    await StorageService.saveMainUser(updated);
    await StorageService.updatePlayer(mainUser.id, { name: nameInput.trim() });
    setMainUser(updated);
    setEditingName(false);
  };

  const handleSelectEmoji = async (emoji) => {
    const updated = { ...mainUser, emoji };
    await StorageService.saveMainUser(updated);
    await StorageService.updatePlayer(mainUser.id, { emoji });
    setMainUser(updated);
    setEmojiModalVisible(false);
  };

  return (
    <SafeAreaView style={Layout.screen}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.headerTitle}>{t('profile.title')}</Text>

        {/* User card */}
        <View style={styles.userCard}>
          <TouchableOpacity onPress={() => setEmojiModalVisible(true)} activeOpacity={0.7}>
            <Text style={styles.userEmoji}>{mainUser?.emoji || '🙋'}</Text>
            <View style={styles.emojiEditBadge}>
              <MaterialCommunityIcons name="pencil" size={10} color={Colors.background} />
            </View>
          </TouchableOpacity>
          {editingName ? (
            <View style={styles.editRow}>
              <TextInput
                style={styles.nameInput}
                value={nameInput}
                onChangeText={setNameInput}
                autoFocus
                maxLength={30}
                returnKeyType="done"
                onSubmitEditing={handleSaveName}
                placeholderTextColor={Colors.textMuted}
              />
              <TouchableOpacity style={styles.saveBtn} onPress={handleSaveName}>
                <MaterialCommunityIcons name="check" size={20} color={Colors.background} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setEditingName(false)}
              >
                <MaterialCommunityIcons name="close" size={20} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.nameRow}
              onPress={() => {
                setNameInput(mainUser?.name || '');
                setEditingName(true);
              }}
            >
              <Text style={styles.userName}>{mainUser?.name || '...'}</Text>
              <MaterialCommunityIcons name="pencil" size={16} color={Colors.textMuted} />
            </TouchableOpacity>
          )}
          {isPremium && (
            <View style={styles.premiumBadge}>
              <MaterialCommunityIcons name="crown" size={14} color={Colors.primary} />
              <Text style={styles.premiumBadgeText}>Premium</Text>
            </View>
          )}
        </View>

        {/* Menu */}
        <View style={styles.menuSection}>
          <MenuItem
            icon="account-group"
            label={t('profile.players')}
            description={t('profile.playersDesc')}
            onPress={() => navigation.navigate('Players')}
          />
          <MenuItem
            icon="comment-plus"
            label={t('profile.customQuestions')}
            description={t('profile.customQuestionsDesc')}
            onPress={() => navigation.navigate('CustomQuestions')}
          />
          <MenuItem
            icon="cog"
            label={t('profile.settings')}
            description={t('profile.settingsDesc')}
            onPress={() => navigation.navigate('Settings')}
          />
        </View>

        {!isPremium && (
          <View style={styles.menuSection}>
            <MenuItem
              icon="crown"
              label={t('profile.premium')}
              description={t('profile.premiumDesc')}
              onPress={() => navigation.navigate('Premium')}
              accent={Colors.primary}
            />
          </View>
        )}
      </ScrollView>

      <Modal
        visible={emojiModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setEmojiModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.emojiModal}>
            <Text style={styles.emojiModalTitle}>{t('profile.changeEmoji')}</Text>
            <FlatList
              data={EMOJIS}
              keyExtractor={(item) => item}
              numColumns={6}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.emojiOption,
                    mainUser?.emoji === item && styles.emojiOptionActive,
                  ]}
                  onPress={() => handleSelectEmoji(item)}
                >
                  <Text style={styles.emojiOptionText}>{item}</Text>
                </TouchableOpacity>
              )}
              contentContainerStyle={styles.emojiGrid}
            />
            <TouchableOpacity
              style={[Buttons.secondary, styles.emojiCancelBtn]}
              onPress={() => setEmojiModalVisible(false)}
            >
              <Text style={Buttons.secondaryText}>{t('common.cancel')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingBottom: Spacing.xxl,
  },
  headerTitle: {
    ...Typography.h2,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    marginBottom: Spacing.lg,
  },
  userCard: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.xl,
    marginHorizontal: Spacing.md,
    padding: Spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.xl,
    gap: Spacing.sm,
  },
  userEmoji: {
    fontSize: 52,
  },
  emojiEditBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.full,
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'flex-end',
  },
  emojiModal: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  emojiModalTitle: {
    ...Typography.h3,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  emojiGrid: {
    paddingBottom: Spacing.md,
  },
  emojiOption: {
    flex: 1,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.md,
    margin: 4,
  },
  emojiOptionActive: {
    backgroundColor: Colors.primary + '33',
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  emojiOptionText: {
    fontSize: 28,
  },
  emojiCancelBtn: {
    marginTop: Spacing.sm,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  userName: {
    ...Typography.h2,
  },
  editRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    width: '100%',
  },
  nameInput: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    ...Typography.body,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  saveBtn: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.sm,
    padding: Spacing.sm,
  },
  cancelBtn: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.sm,
    padding: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.primary + '22',
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: Colors.primary + '66',
  },
  premiumBadgeText: {
    ...Typography.caption,
    color: Colors.primary,
    fontWeight: '700',
  },
  menuSection: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: Spacing.md,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: {
    ...Typography.bodyMedium,
    marginBottom: 2,
  },
  menuDesc: {
    ...Typography.caption,
  },
});
