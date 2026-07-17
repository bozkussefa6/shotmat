# AdMob Kurulumu — PartyRound iOS

Yeni bundle için AdMob’da **yeni uygulama** oluştur.

| Alan | Değer |
|------|--------|
| Bundle ID | `com.kamoteakko.partyround` |
| App name | PartyRound |

## 1. Uygulama ekle

1. [admob.google.com](https://admob.google.com) → **Apps** → **Add app**
2. Platform: **iOS**
3. Mağazada mı? → No (yayın öncesi)
4. App name: **PartyRound**
5. Bundle ID: `com.kamoteakko.partyround`

## 2. Interstitial unit

1. **Ad units** → **Add ad unit** → Interstitial
2. Name: `PartyRound Interstitial`
3. App ID + Unit ID’yi kopyala

## 3. Koda yaz

[`app.json`](../app.json):

- `plugins` → `react-native-google-mobile-ads` → `iosAppId`
- `extra.admobInterstitialIdIos`

Sonra yeni production build al.

## 4. App Privacy

Tracking: **No** — detay [APP_PRIVACY_ANSWERS.md](./APP_PRIVACY_ANSWERS.md)

## Not

Eski ShotMat AdMob ID’leri placeholder olarak kalabilir; PartyRound yayınından önce mutlaka yeni ID’lerle değiştir.
