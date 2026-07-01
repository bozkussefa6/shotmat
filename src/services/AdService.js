// AdMob — no user/party data sent to the ad SDK (KVKK).
// Requires a development build; Expo Go cannot load native ads.

import { Platform } from 'react-native';
import Constants from 'expo-constants';

const extra = Constants.expoConfig?.extra || {};
const isExpoGo = Constants.appOwnership === 'expo';

const AD_FREQUENCY = 3;

let questionCounter = 0;
let adsModule = null;

const loadAdsModule = () => {
  if (adsModule !== null) return adsModule;
  try {
    adsModule = require('react-native-google-mobile-ads');
    return adsModule;
  } catch {
    adsModule = false;
    return false;
  }
};

const getProductionInterstitialId = () => {
  if (Platform.OS === 'ios') {
    return extra.admobInterstitialIdIos || extra.admobInterstitialId || '';
  }
  if (Platform.OS === 'android') {
    return extra.admobInterstitialIdAndroid || '';
  }
  return '';
};

const getInterstitialUnitId = (TestIds) => {
  if (__DEV__) return TestIds.INTERSTITIAL;
  const productionId = getProductionInterstitialId();
  return productionId || TestIds.INTERSTITIAL;
};

const isAdsAvailable = () => !isExpoGo && !!loadAdsModule();

const initialize = async () => {
  if (isExpoGo) {
    console.log('[AdService] Expo Go — ads require a development build (expo run:ios)');
    return;
  }
  const ads = loadAdsModule();
  if (!ads) {
    console.log('[AdService] SDK not available');
    return;
  }
  try {
    await ads.default().initialize();
    console.log('[AdService] Google Mobile Ads initialized');
  } catch (e) {
    console.log('[AdService] Init failed:', e?.message);
  }
};

const incrementQuestionCounter = () => {
  questionCounter++;
};

const shouldShowInterstitial = () =>
  questionCounter > 0 && questionCounter % AD_FREQUENCY === 0;

const showInterstitialAd = async () => {
  if (!isAdsAvailable()) {
    console.log('[AdService] showInterstitialAd (unavailable)');
    return;
  }
  const ads = loadAdsModule();
  const { InterstitialAd, AdEventType, TestIds } = ads;
  const unitId = getInterstitialUnitId(TestIds);

  try {
    const ad = InterstitialAd.createForAdRequest(unitId);
    await new Promise((resolve) => {
      const unsubscribes = [];
      const finish = () => {
        unsubscribes.forEach((unsub) => unsub());
        resolve();
      };
      unsubscribes.push(
        ad.addAdEventListener(AdEventType.LOADED, () => ad.show())
      );
      unsubscribes.push(ad.addAdEventListener(AdEventType.CLOSED, finish));
      unsubscribes.push(ad.addAdEventListener(AdEventType.ERROR, finish));
      ad.load();
    });
  } catch (e) {
    console.log('[AdService] Interstitial error:', e?.message);
  }
};

const resetCounter = () => {
  questionCounter = 0;
};

const AdService = {
  initialize,
  incrementQuestionCounter,
  shouldShowInterstitial,
  showInterstitialAd,
  resetCounter,
  isAdsAvailable,
  getProductionInterstitialId,
};

export default AdService;
