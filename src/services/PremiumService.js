import { Platform } from 'react-native';
import Constants from 'expo-constants';
import StorageService from './StorageService';
import { PREMIUM_PRODUCT_ID, FREE_CUSTOM_QUESTION_LIMIT } from '../constants/brand';

let iapModule = null;
let iapInitialized = false;
let listenersAttached = false;

let pendingPurchaseResolve = null;
let pendingPurchaseReject = null;

/** Expo Go cannot load Nitro-based native modules (react-native-iap). */
const isNativeIAPAvailable = () => Constants.appOwnership !== 'expo';

const loadIAP = () => {
  if (!isNativeIAPAvailable()) {
    iapModule = false;
    return false;
  }
  if (iapModule !== null) return iapModule;
  try {
    iapModule = require('react-native-iap');
    return iapModule;
  } catch (e) {
    console.log('[PremiumService] IAP module unavailable:', e?.message);
    iapModule = false;
    return false;
  }
};

const isPremiumProduct = (purchase) =>
  purchase?.productId === PREMIUM_PRODUCT_ID;

const clearPendingPurchase = () => {
  pendingPurchaseResolve = null;
  pendingPurchaseReject = null;
};

const grantPremium = async () => {
  await StorageService.saveSettings({ isPremium: true });
};

const isUserCancelledError = (error) =>
  error?.code === 'user-cancelled' || error?.code === 'E_USER_CANCELLED';

const attachListeners = (iap) => {
  if (listenersAttached) return;
  listenersAttached = true;

  iap.purchaseUpdatedListener(async (purchase) => {
    if (!isPremiumProduct(purchase)) return;

    try {
      await iap.finishTransaction({ purchase, isConsumable: false });
      await grantPremium();
      pendingPurchaseResolve?.();
    } catch (e) {
      pendingPurchaseReject?.(e);
    } finally {
      clearPendingPurchase();
    }
  });

  iap.purchaseErrorListener((error) => {
    if (isUserCancelledError(error)) {
      pendingPurchaseReject?.(
        Object.assign(new Error('User cancelled'), { code: 'E_USER_CANCELLED' })
      );
    } else {
      pendingPurchaseReject?.(error);
    }
    clearPendingPurchase();
  });
};

const syncPremiumFromStore = async (iap) => {
  try {
    const active = await iap.hasActiveSubscriptions([PREMIUM_PRODUCT_ID]);
    await StorageService.saveSettings({ isPremium: active });
    return active;
  } catch (e) {
    console.log('[PremiumService] sync premium failed:', e?.message);
    const settings = await StorageService.getSettings();
    return settings.isPremium === true;
  }
};

const initIAP = async () => {
  if (!isNativeIAPAvailable()) return false;

  const iap = loadIAP();
  if (!iap) return false;

  attachListeners(iap);

  if (iapInitialized) return true;

  try {
    await iap.initConnection();
    iapInitialized = true;
    await syncPremiumFromStore(iap);
    return true;
  } catch (e) {
    console.log('[PremiumService] IAP init failed:', e?.message);
    return false;
  }
};

const isPremium = async () => {
  const settings = await StorageService.getSettings();
  return settings.isPremium === true;
};

const canAddCustomQuestion = async (currentCount) => {
  if (await isPremium()) return true;
  return currentCount < FREE_CUSTOM_QUESTION_LIMIT;
};

const purchasePremium = async () => {
  if (!isNativeIAPAvailable()) {
    throw new Error('IAP requires a development build (not Expo Go)');
  }

  const iap = loadIAP();
  if (!iap) throw new Error('IAP not available');

  const ready = await initIAP();
  if (!ready) throw new Error('IAP not configured yet');

  const subscriptions = await iap.fetchProducts({
    skus: [PREMIUM_PRODUCT_ID],
    type: 'subs',
  });
  if (!subscriptions?.length) throw new Error('Product not found');

  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      if (pendingPurchaseReject) {
        pendingPurchaseReject(new Error('Purchase timed out'));
        clearPendingPurchase();
      }
    }, 120000);

    const finish = (handler) => (value) => {
      clearTimeout(timeout);
      handler(value);
    };

    pendingPurchaseResolve = finish(resolve);
    pendingPurchaseReject = finish(reject);

    const request =
      Platform.OS === 'ios'
        ? {
            type: 'subs',
            request: { apple: { sku: PREMIUM_PRODUCT_ID } },
          }
        : {
            type: 'subs',
            request: { google: { skus: [PREMIUM_PRODUCT_ID] } },
          };

    iap.requestPurchase(request).catch((e) => {
      if (pendingPurchaseReject) {
        pendingPurchaseReject(e);
        clearPendingPurchase();
      }
    });
  });
};

const restorePurchase = async () => {
  if (!isNativeIAPAvailable()) {
    throw new Error('IAP requires a development build (not Expo Go)');
  }

  const iap = loadIAP();
  if (!iap) throw new Error('IAP not available');

  const ready = await initIAP();
  if (!ready) throw new Error('IAP not configured yet');

  if (Platform.OS === 'ios' && iap.syncIOS) {
    await iap.syncIOS();
  }

  const active = await iap.hasActiveSubscriptions([PREMIUM_PRODUCT_ID]);
  if (active) {
    await grantPremium();
    return;
  }

  const purchases = await iap.getAvailablePurchases({
    onlyIncludeActiveItemsIOS: true,
  });
  const hasPremium = purchases.some(isPremiumProduct);
  if (!hasPremium) throw new Error('No purchase found');

  await grantPremium();
};

const setPremium = async (value) => {
  await StorageService.saveSettings({ isPremium: value });
};

const PremiumService = {
  PRODUCT_ID: PREMIUM_PRODUCT_ID,
  isNativeIAPAvailable,
  isPremium,
  canAddCustomQuestion,
  purchasePremium,
  restorePurchase,
  setPremium,
  initIAP,
  syncPremiumFromStore: async () => {
    const iap = loadIAP();
    if (!iap || !iapInitialized) return false;
    return syncPremiumFromStore(iap);
  },
};

export default PremiumService;
