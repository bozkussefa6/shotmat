// AdMob unit IDs — set via app config extra or env when ready for production.
// No user/party data is sent to the ad SDK (KVKK).

import Constants from 'expo-constants';

const extra = Constants.expoConfig?.extra || {};
const AD_UNITS = {
  interstitial: extra.admobInterstitialId || '',
  rewarded: extra.admobRewardedId || '',
};

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

const initialize = async () => {
  const ads = loadAdsModule();
  if (!ads || !AD_UNITS.interstitial) {
    console.log('[AdService] Initialized (mock — configure admobInterstitialId in app.json extra)');
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
  const ads = loadAdsModule();
  if (!ads || !AD_UNITS.interstitial) {
    console.log('[AdService] showInterstitialAd (mock)');
    return;
  }
  try {
    const { InterstitialAd, AdEventType, TestIds } = ads;
    const ad = InterstitialAd.createForAdRequest(
      AD_UNITS.interstitial || TestIds.INTERSTITIAL
    );
    await new Promise((resolve, reject) => {
      ad.addAdEventListener(AdEventType.LOADED, () => ad.show());
      ad.addAdEventListener(AdEventType.CLOSED, resolve);
      ad.addAdEventListener(AdEventType.ERROR, reject);
      ad.load();
    });
  } catch (e) {
    console.log('[AdService] Interstitial error:', e?.message);
  }
};

const showRewardedAd = async () => {
  const ads = loadAdsModule();
  if (!ads || !AD_UNITS.rewarded) {
    console.log('[AdService] showRewardedAd (mock)');
    return;
  }
  try {
    const { RewardedAd, AdEventType, TestIds } = ads;
    const ad = RewardedAd.createForAdRequest(
      AD_UNITS.rewarded || TestIds.REWARDED
    );
    await new Promise((resolve, reject) => {
      ad.addAdEventListener(AdEventType.LOADED, () => ad.show());
      ad.addAdEventListener(AdEventType.CLOSED, resolve);
      ad.addAdEventListener(AdEventType.ERROR, reject);
      ad.load();
    });
  } catch (e) {
    console.log('[AdService] Rewarded error:', e?.message);
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
  showRewardedAd,
  resetCounter,
  AD_UNITS,
};

export default AdService;
