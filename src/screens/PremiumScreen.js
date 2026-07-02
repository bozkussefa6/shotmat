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
  Linking,
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
  Gradients,
} from '../styles/GlobalStyles';
import PremiumService from '../services/PremiumService';
import {
  PRIVACY_POLICY_URL,
  TERMS_OF_USE_URL,
} from '../constants/brand';
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
  const [localizedPrice, setLocalizedPrice] = useState(null);

  useEffect(() => {
    PremiumService.isPremium().then(setIsPremium);
    PremiumService.getSubscriptionProduct().then((product) => {
      if (!product) return;
      setLocalizedPrice(
        product.displayPrice || product.localizedPrice || null
      );
    });
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

  const openUrl = async (url) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) await Linking.openURL(url);
    } catch {
      Alert.alert(t('common.error'), t('common.error'));
    }
  };

  const priceLabel = localizedPrice || t('premium.priceLoading');

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

            <View style={styles.subscriptionInfoCard}>
              <Text style={styles.subscriptionTitle}>{t('premium.subscriptionTitle')}</Text>
              <Text style={styles.subscriptionMeta}>{t('premium.subscriptionLength')}</Text>
              <Text style={styles.priceText}>{priceLabel}</Text>
            </View>

            <View style={styles.priceSection}>
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

            <View style={styles.legalLinks}>
              <TouchableOpacity onPress={() => openUrl(PRIVACY_POLICY_URL)} activeOpacity={0.7}>
                <Text style={styles.legalLink}>{t('premium.privacyLink')}</Text>
              </TouchableOpacity>
              <Text style={styles.legalDivider}>·</Text>
              <TouchableOpacity onPress={() => openUrl(TERMS_OF_USE_URL)} activeOpacity={0.7}>
                <Text style={styles.legalLink}>{t('premium.termsLink')}</Text>
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
  subscriptionInfoCard: {
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    marginHorizontal: Spacing.md,
    padding: Spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.xs,
    marginBottom: Spacing.lg,
  },
  subscriptionTitle: {
    ...Typography.h3,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  subscriptionMeta: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  priceSection: {
    paddingHorizontal: Spacing.md,
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  priceText: {
    ...Typography.h2,
    color: Colors.primary,
    textAlign: 'center',
  },
  buyBtn: {
    width: '100%',
  },
  legalLinks: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.md,
  },
  legalLink: {
    ...Typography.bodySmall,
    color: Colors.primary,
    textDecorationLine: 'underline',
  },
  legalDivider: {
    ...Typography.bodySmall,
    color: Colors.textMuted,
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
