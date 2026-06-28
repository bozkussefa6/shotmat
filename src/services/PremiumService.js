import { Platform } from 'react-native';
import StorageService from './StorageService';
import { PREMIUM_PRODUCT_ID, FREE_CUSTOM_QUESTION_LIMIT } from '../constants/brand';

let iapModule = null;
let iapInitialized = false;

const loadIAP = () => {
  if (iapModule !== null) return iapModule;
  try {
    iapModule = require('react-native-iap');
    return iapModule;
  } catch {
    iapModule = false;
    return false;
  }
};

const initIAP = async () => {
  const iap = loadIAP();
  if (!iap || iapInitialized) return !!iap;
  try {
    await iap.initConnection();
    if (Platform.OS === 'android') {
      await iap.flushFailedPurchasesCachedAsPendingAndroid();
    }
    iapInitialized = true;
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
  const iap = loadIAP();
  if (!iap) throw new Error('IAP not available');

  const ready = await initIAP();
  if (!ready) throw new Error('IAP not configured yet');

  try {
    const products = await iap.getProducts({ skus: [PREMIUM_PRODUCT_ID] });
    if (!products?.length) throw new Error('Product not found');

    await iap.requestPurchase({ sku: PREMIUM_PRODUCT_ID });
    await StorageService.saveSettings({ isPremium: true });
  } catch (e) {
    if (e?.code === 'E_USER_CANCELLED') throw e;
    throw new Error(e?.message || 'IAP not configured yet');
  }
};

const restorePurchase = async () => {
  const iap = loadIAP();
  if (!iap) throw new Error('IAP not available');

  const ready = await initIAP();
  if (!ready) throw new Error('IAP not configured yet');

  const purchases = await iap.getAvailablePurchases();
  const hasPremium = purchases.some((p) => p.productId === PREMIUM_PRODUCT_ID);
  if (!hasPremium) throw new Error('No purchase found');
  await StorageService.saveSettings({ isPremium: true });
};

const setPremium = async (value) => {
  await StorageService.saveSettings({ isPremium: value });
};

const PremiumService = {
  PRODUCT_ID: PREMIUM_PRODUCT_ID,
  isPremium,
  canAddCustomQuestion,
  purchasePremium,
  restorePurchase,
  setPremium,
  initIAP,
};

export default PremiumService;
