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
  ScrollView,
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
  TypeColors,
} from '../styles/GlobalStyles';
import StorageService from '../services/StorageService';
import GameService from '../services/GameService';
import PremiumService from '../services/PremiumService';
import ScreenHeader from '../components/ScreenHeader';
import { FREE_CUSTOM_QUESTION_LIMIT } from '../constants/brand';

const TYPES = ['group', 'personal', 'dare'];

const typeIcon = { group: 'account-group', personal: 'comment-question', dare: 'lightning-bolt' };

export default function CustomQuestionsScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const [questions, setQuestions] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingQ, setEditingQ] = useState(null);
  const [textInput, setTextInput] = useState('');
  const [enTextInput, setEnTextInput] = useState('');
  const [selectedType, setSelectedType] = useState(null);

  const [isPremium, setIsPremium] = useState(false);

  useFocusEffect(
    useCallback(() => {
      StorageService.getCustomQuestions().then(setQuestions);
      PremiumService.isPremium().then(setIsPremium);
    }, [])
  );

  const openAdd = async () => {
    if (!(await PremiumService.canAddCustomQuestion(questions.length))) {
      Alert.alert(
        t('common.error'),
        t('customQuestions.limitReached', { limit: FREE_CUSTOM_QUESTION_LIMIT }),
        [
          { text: t('common.cancel'), style: 'cancel' },
          { text: t('customQuestions.upgradeForMore'), onPress: () => navigation.navigate('Premium') },
        ]
      );
      return;
    }
    setEditingQ(null);
    setTextInput('');
    setEnTextInput('');
    setSelectedType(null);
    setModalVisible(true);
  };

  const openEdit = (q) => {
    setEditingQ(q);
    setTextInput(q.textTr);
    setEnTextInput(q.textEn !== q.textTr ? q.textEn : '');
    setSelectedType(q.type);
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!textInput.trim()) {
      Alert.alert(t('common.error'), t('customQuestions.textRequired'));
      return;
    }
    if (!selectedType) {
      Alert.alert(t('common.error'), t('customQuestions.typeRequired'));
      return;
    }
    const textEn = enTextInput.trim() || textInput.trim();
    const payload = {
      textTr: textInput.trim(),
      textEn,
      tr: textInput.trim(),
      en: textEn,
      type: selectedType,
    };
    if (editingQ) {
      await StorageService.updateCustomQuestion(editingQ.id, payload);
    } else {
      await StorageService.addCustomQuestion({
        id: GameService.generateId(),
        ...payload,
        createdAt: new Date().toISOString(),
      });
    }
    setModalVisible(false);
    StorageService.getCustomQuestions().then(setQuestions);
  };

  const handleDelete = (q) => {
    Alert.alert(t('customQuestions.deleteConfirm'), '', [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: async () => {
          await StorageService.deleteCustomQuestion(q.id);
          StorageService.getCustomQuestions().then(setQuestions);
        },
      },
    ]);
  };

  const renderQuestion = ({ item: q }) => {
    const color = TypeColors[q.type] || Colors.primary;
    return (
      <View style={styles.qCard}>
        <View style={[styles.qTypeDot, { backgroundColor: color }]} />
        <View style={{ flex: 1 }}>
          <Text style={styles.qType} numberOfLines={1}>
            {t(`customQuestions.type${q.type.charAt(0).toUpperCase() + q.type.slice(1)}`)}
          </Text>
          <Text style={styles.qText} numberOfLines={3}>{q.textTr}</Text>
        </View>
        <TouchableOpacity style={styles.actionBtn} onPress={() => openEdit(q)}>
          <MaterialCommunityIcons name="pencil" size={18} color={Colors.textSecondary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => handleDelete(q)}>
          <MaterialCommunityIcons name="delete-outline" size={18} color={Colors.danger} />
        </TouchableOpacity>
      </View>
    );
  };

  const isPersonalOrDare = selectedType === 'personal' || selectedType === 'dare';

  return (
    <SafeAreaView style={Layout.screen}>
      <ScreenHeader
        title={t('customQuestions.title')}
        onBack={() => navigation.goBack()}
        right={
          <TouchableOpacity style={styles.addBtn} onPress={openAdd}>
            <MaterialCommunityIcons name="plus" size={24} color={Colors.primary} />
          </TouchableOpacity>
        }
      />

      {!isPremium && questions.length > 0 && (
        <Text style={styles.limitHint}>
          {t('customQuestions.limitHint', { count: questions.length, limit: FREE_CUSTOM_QUESTION_LIMIT })}
        </Text>
      )}

      <FlatList
        data={questions}
        renderItem={renderQuestion}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <MaterialCommunityIcons name="comment-plus-outline" size={48} color={Colors.textMuted} />
            <Text style={styles.emptyText}>{t('customQuestions.empty')}</Text>
          </View>
        }
      />

      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <ScrollView contentContainerStyle={styles.modalCard} keyboardShouldPersistTaps="handled">
            <Text style={styles.modalTitle}>
              {editingQ ? t('customQuestions.editQuestion') : t('customQuestions.addNew')}
            </Text>

            {/* Type selector */}
            <Text style={styles.fieldLabel}>{t('customQuestions.questionType')}</Text>
            <View style={styles.typeRow}>
              {TYPES.map((type) => {
                const color = TypeColors[type];
                const selected = selectedType === type;
                return (
                  <TouchableOpacity
                    key={type}
                    style={[styles.typeBtn, { borderColor: color }, selected && { backgroundColor: color }]}
                    onPress={() => setSelectedType(type)}
                    activeOpacity={0.8}
                  >
                    <MaterialCommunityIcons name={typeIcon[type]} size={16} color={selected ? Colors.background : color} />
                    <Text style={[styles.typeBtnText, { color: selected ? Colors.background : color }]}>
                      {t(`customQuestions.type${type.charAt(0).toUpperCase() + type.slice(1)}`)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Question text */}
            <Text style={styles.fieldLabel}>{t('customQuestions.questionText')}</Text>
            <TextInput
              style={styles.textInput}
              placeholder={t('customQuestions.questionPlaceholder')}
              placeholderTextColor={Colors.textMuted}
              value={textInput}
              onChangeText={setTextInput}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              maxLength={300}
            />

            {/* Hint for personal/dare */}
            {isPersonalOrDare && (
              <View style={styles.hintBox}>
                <MaterialCommunityIcons name="information-outline" size={14} color={Colors.primary} />
                <Text style={styles.hintText}>{t('customQuestions.playerHint')}</Text>
              </View>
            )}

            {/* English translation */}
            <Text style={styles.fieldLabel}>{t('customQuestions.englishText')}</Text>
            <TextInput
              style={styles.textInput}
              placeholder={t('customQuestions.englishPlaceholder')}
              placeholderTextColor={Colors.textMuted}
              value={enTextInput}
              onChangeText={setEnTextInput}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              maxLength={300}
            />

            <View style={styles.modalBtns}>
              <TouchableOpacity style={[Buttons.secondary, { flex: 1 }]} onPress={() => setModalVisible(false)}>
                <Text style={Buttons.secondaryText}>{t('common.cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[Buttons.primary, { flex: 1 }, (!textInput.trim() || !selectedType) && { opacity: 0.4 }]}
                onPress={handleSave}
                disabled={!textInput.trim() || !selectedType}
              >
                <Text style={Buttons.primaryText}>{t('common.save')}</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  backBtn: { padding: Spacing.xs },
  headerTitle: { ...Typography.h3, flex: 1, marginLeft: Spacing.sm },
  addBtn: { padding: Spacing.xs },
  limitHint: {
    ...Typography.caption,
    color: Colors.textMuted,
    textAlign: 'center',
    marginBottom: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  list: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xxl,
    gap: Spacing.sm,
  },
  qCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.sm,
  },
  qTypeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
  },
  qType: {
    ...Typography.caption,
    color: Colors.textMuted,
    marginBottom: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  qText: {
    ...Typography.bodySmall,
    color: Colors.textPrimary,
  },
  actionBtn: { padding: Spacing.xs },
  empty: {
    alignItems: 'center',
    paddingTop: Spacing.xxl * 2,
    gap: Spacing.md,
  },
  emptyText: { ...Typography.bodySmall, textAlign: 'center', lineHeight: 22 },
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
    paddingBottom: Spacing.xxl,
  },
  modalTitle: { ...Typography.h3, textAlign: 'center' },
  fieldLabel: { ...Typography.bodySmall, color: Colors.textSecondary },
  typeRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  typeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    backgroundColor: Colors.card,
  },
  typeBtnText: {
    ...Typography.caption,
    fontWeight: '700',
  },
  textInput: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    ...Typography.body,
    color: Colors.textPrimary,
    minHeight: 100,
  },
  hintBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.xs,
    backgroundColor: Colors.primary + '11',
    borderRadius: BorderRadius.sm,
    padding: Spacing.sm,
  },
  hintText: {
    ...Typography.caption,
    flex: 1,
    color: Colors.textSecondary,
    lineHeight: 16,
  },
  modalBtns: { flexDirection: 'row', gap: Spacing.sm },
});
