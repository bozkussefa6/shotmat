# AdMob Kurulumu — ShotMat iOS

Kodda tanımlı production ID’ler ([`app.json`](../app.json)):

| Alan | Değer |
|------|--------|
| iOS App ID | `ca-app-pub-7264754027467588~4008160204` |
| Interstitial Unit ID | `ca-app-pub-7264754027467588/3707374938` |
| Bundle ID | `com.shotmat.app` |

## 1. AdMob hesabı

1. [admob.google.com](https://admob.google.com) → Google hesabınla giriş
2. İlk kurulumda ülke ve ödeme bilgilerini tamamla

## 2. Uygulama ekle

1. **Apps** → **Add app**
2. Platform: **iOS**
3. Uygulama mağazada mı? → **No** (ilk yayın öncesi) veya **Yes** (yayından sonra)
4. App name: **ShotMat**
5. Bundle ID: `com.shotmat.app`

Oluşturulan **App ID** kodla eşleşmeli. Farklıysa `app.json` içindeki `iosAppId` değerini güncelle.

## 3. Reklam birimi (Interstitial)

1. Uygulama → **Ad units** → **Add ad unit**
2. Format: **Interstitial**
3. Ad unit name: `ShotMat Interstitial`
4. Oluşturulan **Ad unit ID** kodla eşleşmeli (`admobInterstitialIdIos` in `app.json`)

## 4. Uygulama onayı

Yeni uygulamalar AdMob’da “Getting ready” durumunda olabilir. İlk günlerde:

- TestFlight / production build’de reklam gelmeyebilir
- Test reklamları `__DEV__` modunda otomatik kullanılır ([`AdService.js`](../src/services/AdService.js))

**ATT:** `userTrackingUsageDescription` kaldırıldı — uygulama izleme izni istemez. App Privacy’de tracking = No.

Yayın sonrası App Store linkini AdMob’a ekle (Apps → App settings → Store listing).

## 5. App Store Connect — App Privacy

App Store Connect → ShotMat → **App Privacy** anketi:

| Soru | Cevap |
|------|--------|
| Veri topluyor musunuz? | Evet |
| Tanımlayıcılar (Advertising) | Evet — third party (Google AdMob) |
| Kendi analitiğiniz | Hayır |

Detay: [APP_PRIVACY_ANSWERS.md](./APP_PRIVACY_ANSWERS.md)

## Kontrol listesi

- [ ] AdMob’da iOS uygulaması `com.shotmat.app` ile kayıtlı
- [ ] Interstitial ad unit ID `app.json` ile eşleşiyor
- [ ] App Privacy anketi dolduruldu
- [ ] TestFlight’ta (production build) reklam görünüyor
