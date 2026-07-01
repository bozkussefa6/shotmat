# App Store Connect — ShotMat Kurulum Checklist

Bundle ID: `com.shotmat.app` | SKU: `shotmat` | Version: `1.0.0`

**Önce:** [APPLE_ACCOUNT_SETUP.md](./APPLE_ACCOUNT_SETUP.md) (Developer Program + sözleşmeler)

Bu dosyadaki adımları App Store Connect’te sırayla uygula. Tamamladıkça `[ ]` → `[x]` işaretle.

---

## 0. Ön koşullar

- [ ] [APPLE_ACCOUNT_SETUP.md](./APPLE_ACCOUNT_SETUP.md) tamamlandı
- [ ] Privacy Policy yayında: `docs/public/privacy.html` → GitHub Pages / hosting → URL: `https://shotmat.app/privacy`

## 1. App ID (Bundle ID yoksa)

[developer.apple.com](https://developer.apple.com) → **Account** → **Certificates, Identifiers & Profiles** → **Identifiers** → **+**

| Alan | Değer |
|------|--------|
| Type | App IDs → App |
| Description | ShotMat |
| Bundle ID | Explicit → `com.shotmat.app` |
| Capabilities | In-App Purchase (işaretle) |

**Register** → **Continue** → **Save**

---

## 2. Yeni uygulama kaydı

App Store Connect → **Apps** → **+** → **New App**

| Alan | Değer |
|------|--------|
| Platforms | iOS |
| Name | ShotMat |
| Primary Language | Turkish |
| Bundle ID | com.shotmat.app |
| SKU | shotmat |
| User Access | Full Access |

**Create**

---

## 3. App Information

Sol menü → **App Information**

| Alan | Öneri |
|------|--------|
| Category (Primary) | Entertainment |
| Category (Secondary) | Games (opsiyonel) |
| Content Rights | Does not contain third-party content |
| Age Rating | Anketi doldur — olgun soru içeriği için **17+** önerilir |

---

## 4. Pricing and Availability

- **Price:** Free
- **Availability:** Türkiye + diğer hedef ülkeler

---

## 5. App Privacy

**Privacy Policy URL:** `https://shotmat.app/privacy` (kaynak: [public/privacy.html](./public/privacy.html))

**App Privacy anketi — özet cevaplar:**

| Soru | Cevap |
|------|--------|
| Veri topluyor musunuz? | Evet (reklam SDK) |
| Kullanıcı kimliği / iletişim | Hayır (uygulama sunucuya göndermiyor) |
| Kullanım verisi | Hayır (kendi analitiğin yok) |
| Tanımlayıcılar (Advertising) | Evet — Google AdMob (third-party) |
| Veri cihazda mı? | Oyuncu/parti verisi yalnızca cihazda (AsyncStorage) |

Detay: [APP_PRIVACY_ANSWERS.md](./APP_PRIVACY_ANSWERS.md)

---

## 6. In-App Purchase (Premium)

Sol menü → **Subscriptions** → **+** Subscription Group

**Group name:** ShotMat Premium

**+ Subscription:**

| Alan | Değer |
|------|--------|
| Reference Name | ShotMat Premium Yearly |
| Product ID | `shotmat_premium_yearly` |
| Duration | 1 Year |
| Price | İstediğin tier (ör. Tier 3 ≈ ₺99) |

**Localization (Turkish):**
- Display Name: ShotMat Premium
- Description: Reklamsız oyna, sınırsız özel soru ekle.

**Localization (English):**
- Display Name: ShotMat Premium
- Description: Play ad-free and add unlimited custom questions.

**Review Information:** Premium ekranı screenshot’ı ekle.

Durum **Ready to Submit** olmalı.

---

## 7. TestFlight (build yüklendikten sonra)

1. **TestFlight** sekmesi → build **Processing** bitene kadar bekle
2. **Internal Testing** → Default group → build ekle
3. iPhone’da TestFlight uygulaması ile yükle

**Sandbox tester:** Users and Access → Sandbox → Testers → + (IAP test için)

---

## 8. App Store sayfası (v1.0.0)

**App Store** → **+ Version** → `1.0.0`

Metinler: [APP_STORE_METADATA.md](./APP_STORE_METADATA.md)

| Gerekli | Not |
|---------|-----|
| Screenshots 6.7" | iPhone 15 Pro Max simülatör veya cihaz |
| Description | Metadata dosyasından kopyala |
| Keywords | Metadata dosyasından |
| Support URL | https://shotmat.app/support |
| Build | TestFlight’taki production build’i seç |
| Copyright | © 2026 ShotMat |

**Export Compliance:** ITSAppUsesNonExemptEncryption = false (app.json’da ayarlandı) → genelde “No”

---

## 9. İncelemeye gönder

Detay: [SUBMIT_REVIEW.md](./SUBMIT_REVIEW.md)

1. Tüm uyarılar giderildi mi kontrol et
2. **Add for Review** → **Submit to App Review**

**Review notes (örnek):**
```
ShotMat is an offline party game. All player and game data stays on device.
No login required. Premium is an optional yearly subscription (shotmat_premium_yearly).
Mature party game content — age rating 17+.
```

---

## EAS Build komutları

```bash
npm install -g eas-cli
eas login
cd /Users/ikas/ShotMat
eas init          # ilk sefer — Expo projesini bağla
eas build --platform ios --profile production
eas submit --platform ios --profile production   # opsiyonel — build’i ASC’ye gönderir
```

Build App Store Connect → **TestFlight**’ta görünür (5–30 dk processing).
