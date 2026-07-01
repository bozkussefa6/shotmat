# ShotMat iOS Yayın Runbook

Sıralı yayın rehberi. Her adımı tamamladıkça işaretle.

## Faz 0 — Kod (tamamlandı)

- [x] `PremiumService` react-native-iap v14 API
- [x] `react-native-iap` Expo plugin
- [x] AdMob ID’leri `app.json` içinde
- [x] EAS projectId tanımlı

## Faz 1 — Apple hesap

Rehber: [APPLE_ACCOUNT_SETUP.md](./APPLE_ACCOUNT_SETUP.md)

- [ ] Developer Program ($99/yıl)
- [ ] Paid Applications Agreement
- [ ] Banka + vergi formları

## Faz 2 — App Store Connect kayıt

Rehber: [APP_STORE_CONNECT.md](./APP_STORE_CONNECT.md) (bölüm 1–5)

- [ ] App ID: `com.shotmat.app` + In-App Purchase capability
- [ ] Yeni app kaydı (SKU: `shotmat`)
- [ ] App Information: Entertainment, yaş **17+**
- [ ] Pricing: Free
- [ ] Privacy Policy URL: `https://shotmat.app/privacy` (yayınla — bkz. [PRIVACY_POLICY.md](./PRIVACY_POLICY.md))

## Faz 3 — AdMob

Rehber: [ADMOB_SETUP.md](./ADMOB_SETUP.md)

- [ ] iOS app + interstitial unit doğrulandı
- [ ] App Privacy anketi

## Faz 4 — Premium abonelik

Rehber: [APP_STORE_CONNECT.md](./APP_STORE_CONNECT.md) (bölüm 6)

- [ ] Subscription group: `ShotMat Premium`
- [ ] Product ID: `shotmat_premium_yearly` (kodla aynı)
- [ ] TR + EN lokalizasyon
- [ ] Review screenshot
- [ ] Durum: **Ready to Submit**
- [ ] Sandbox tester oluşturuldu

## Faz 5 — Store metadata

Rehber: [APP_STORE_METADATA.md](./APP_STORE_METADATA.md)

- [ ] Açıklama, keywords, subtitle
- [ ] Support URL: `https://shotmat.app/support`
- [ ] Copyright: `© 2026 ShotMat`
- [ ] 6.7" screenshots (3–5 adet) — `npm run screenshots:ios`

## Faz 6 — Build ve TestFlight

Rehber: [EAS_BUILD.md](./EAS_BUILD.md) + [TESTFLIGHT_CHECKLIST.md](./TESTFLIGHT_CHECKLIST.md)

```bash
eas login
eas build --platform ios --profile production   # ilk sefer interaktif
# sonraki build'ler: npm run release:ios
```

- [ ] Production build tamamlandı
- [ ] TestFlight’ta processing bitti
- [ ] Oyun, reklam, premium sandbox test edildi

## Faz 7 — İncelemeye gönder

Rehber: [SUBMIT_REVIEW.md](./SUBMIT_REVIEW.md)

```bash
npm run submit:ios   # opsiyonel — build’i ASC’ye yükler
```

- [ ] v1.0.0 sürümü + build seçildi
- [ ] Export compliance: No (şifreleme muaf)
- [ ] Review notes eklendi
- [ ] Submit to App Review
