import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

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
import PremiumService from '../services/PremiumService';
import AppLogo from '../components/AppLogo';
import ScreenHeader from '../components/ScreenHeader';

const FEATURES = [
  { icon: 'block-helper', key: 'feature1' },
  { icon: 'comment-plus', key: 'feature2' },
  { icon: 'star-shooting', key: 'feature3' },
];

export default function PremiumScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    PremiumService.isPremium().then(setIsPremium);
  }, []);

  const handlePurchase = async () => {
    setLoading(true);
    try {
      await PremiumService.purchasePremium();
      setIsPremium(true);
    } catch (e) {
      if (e?.code === 'E_USER_CANCELLED') return;
      Alert.alert(t('common.error'), t('premium.purchaseError'));
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async () => {
    setLoading(true);
    try {
      await PremiumService.restorePurchase();
      setIsPremium(true);
      Alert.alert(t('common.success'), t('premium.restoreSuccess'));
    } catch {
      Alert.alert(t('common.error'), t('premium.restoreError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={Layout.screen}>
      <ScreenHeader onBack={() => navigation.goBack()} />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={Gradients.premiumHero}
          style={styles.hero}
        >
          <AppLogo size="lg" variant="premium" />
          <Text style={styles.heroTitle}>{t('premium.title')}</Text>
          <Text style={styles.heroSubtitle}>{t('premium.subtitle')}</Text>
        </LinearGradient>

        {isPremium ? (
          <View style={styles.alreadyPremiumCard}>
            <Text style={styles.alreadyPremiumTitle}>{t('premium.alreadyPremium')}</Text>
            <Text style={styles.alreadyPremiumDesc}>{t('premium.alreadyPremiumDesc')}</Text>
          </View>
        ) : (
          <>
            {/* Features */}
            <View style={styles.featuresCard}>
              {FEATURES.map((f) => (
                <View key={f.key} style={styles.featureRow}>
                  <View style={styles.featureIcon}>
                    <MaterialCommunityIcons name={f.icon} size={20} color={Colors.primary} />
                  </View>
                  <Text style={styles.featureText}>{t(`premium.${f.key}`)}</Text>
                </View>
              ))}
            </View>

            {/* Price & CTA */}
            <View style={styles.priceSection}>
              <Text style={styles.priceText}>{t('premium.price')}</Text>
              <TouchableOpacity
                style={[Buttons.primary, styles.buyBtn]}
                onPress={handlePurchase}
                disabled={loading}
                activeOpacity={0.85}
              >
                {loading ? (
                  <ActivityIndicator color={Colors.background} />
                ) : (
                  <Text style={Buttons.primaryText}>{t('premium.buyNow')}</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={Buttons.ghost}
                onPress={handleRestore}
                disabled={loading}
                activeOpacity={0.8}
              >
                <Text style={Buttons.ghostText}>{t('premium.restore')}</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.termsText}>{t('premium.terms')}</Text>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: Spacing.xxl },
  hero: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
  },
  heroTitle: {
    ...Typography.h1,
    color: Colors.primary,
    textAlign: 'center',
  },
  heroSubtitle: {
    ...Typography.body,
    textAlign: 'center',
    color: Colors.textSecondary,
  },
  featuresCard: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.xl,
    marginHorizontal: Spacing.md,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.primary + '44',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.primary + '22',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: {
    ...Typography.body,
    flex: 1,
  },
  priceSection: {
    paddingHorizontal: Spacing.md,
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  priceText: {
    ...Typography.h2,
    color: Colors.primary,
  },
  buyBtn: {
    width: '100%',
  },
  termsText: {
    ...Typography.caption,
    textAlign: 'center',
    paddingHorizontal: Spacing.xl,
    color: Colors.textMuted,
    lineHeight: 16,
  },
  alreadyPremiumCard: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.xl,
    margin: Spacing.md,
    padding: Spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.primary + '44',
    gap: Spacing.sm,
  },
  alreadyPremiumTitle: {
    ...Typography.h2,
    color: Colors.primary,
    textAlign: 'center',
  },
  alreadyPremiumDesc: {
    ...Typography.bodySmall,
    textAlign: 'center',
  },
});
