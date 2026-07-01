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
  AvatarColors,
} from '../styles/GlobalStyles';
import StorageService from '../services/StorageService';
import PremiumService from '../services/PremiumService';
import PlayerAvatar from '../components/PlayerAvatar';
import { getAvatarColor } from '../utils/playerAvatar';
import { isDuplicatePlayerName } from '../utils/playerNames';

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
  const [colorModalVisible, setColorModalVisible] = useState(false);

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
    const allPlayers = await StorageService.getPlayers();
    if (isDuplicatePlayerName(nameInput, allPlayers, mainUser.id)) {
      Alert.alert(t('common.error'), t('players.nameTaken'));
      return;
    }
    const updated = { ...mainUser, name: nameInput.trim() };
    await StorageService.saveMainUser(updated);
    await StorageService.updatePlayer(mainUser.id, { name: nameInput.trim() });
    setMainUser(updated);
    setEditingName(false);
  };

  const handleSelectColor = async (color) => {
    const updated = { ...mainUser, color };
    await StorageService.saveMainUser(updated);
    await StorageService.updatePlayer(mainUser.id, { color });
    setMainUser(updated);
    setColorModalVisible(false);
  };

  return (
    <SafeAreaView style={Layout.screen}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.headerTitle}>{t('profile.title')}</Text>

        <View style={styles.userCard}>
          <TouchableOpacity onPress={() => setColorModalVisible(true)} activeOpacity={0.7}>
            <PlayerAvatar player={mainUser} size="xl" />
            <View style={styles.avatarEditBadge}>
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
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setEditingName(false)}>
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
        visible={colorModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setColorModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.colorModal}>
            <Text style={styles.colorModalTitle}>{t('profile.changeEmoji')}</Text>
            <Text style={styles.colorModalSub}>{t('profile.pickColor')}</Text>
            <View style={styles.colorGrid}>
              {AvatarColors.map((color) => (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.colorSwatch,
                    { backgroundColor: color },
                    mainUser?.color === color && styles.colorSwatchActive,
                  ]}
                  onPress={() => handleSelectColor(color)}
                />
              ))}
            </View>
            <TouchableOpacity
              style={[Buttons.secondary, styles.colorCancelBtn]}
              onPress={() => setColorModalVisible(false)}
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
  avatarEditBadge: {
    position: 'absolute',
    bottom: 0,
    right: -4,
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
  colorModal: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  colorModalTitle: {
    ...Typography.h3,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  colorModalSub: {
    ...Typography.caption,
    textAlign: 'center',
    color: Colors.textMuted,
    marginBottom: Spacing.md,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  colorSwatch: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  colorSwatchActive: {
    borderWidth: 3,
    borderColor: Colors.primary,
  },
  colorCancelBtn: {
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
