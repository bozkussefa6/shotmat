# App Review — Gönderim

## Ön kontrol

App Store Connect’te tüm uyarılar giderilmiş olmalı:

- [ ] Privacy Policy URL girildi
- [ ] Screenshots (6.7") yüklendi
- [ ] `shotmat_premium_yearly` → **Ready to Submit**
- [ ] TestFlight build seçildi
- [ ] Export Compliance soruldu → **No** (yalnızca standart HTTPS; `ITSAppUsesNonExemptEncryption: false`)

## v1.0.0 sürümü

1. App Store Connect → ShotMat → **App Store** → **+ Version** → `1.0.0`
2. Metadata: [APP_STORE_METADATA.md](./APP_STORE_METADATA.md)
3. **Build** → TestFlight’taki en son production build
4. **Copyright:** `© 2026 ShotMat`

## Review notes (kopyala-yapıştır)

```
ShotMat is an offline party game for adults (17+). All player names, party history, and custom questions stay on device — no account or server required.

Premium (shotmat_premium_yearly) is an optional yearly subscription that removes ads and unlocks unlimited custom questions. Restore purchases is available on the Premium screen.

To test Premium in sandbox:
1. Sign in with a Sandbox Apple ID (Settings → App Store → Sandbox Account)
2. Open Profile → Go Premium → purchase or restore

Ads are shown via Google AdMob for non-premium users (interstitial after every 3 questions and at party end).

Mature party game content — age rating 17+. Entertainment only; responsible drinking encouraged.
```

## Submit

1. **Add for Review**
2. **Submit to App Review**

İnceleme süresi genelde 24–48 saat.

## Build’i otomatik yükleme (opsiyonel)

```bash
eas login
npm run submit:ios
```

İlk submit’te Apple ID, app-specific password ve ASC app seçimi sorulur.

`eas.json` submit bölümüne isteğe bağlı olarak eklenebilir (ASC’de app oluşturduktan sonra):

```json
"submit": {
  "production": {
    "ios": {
      "appleId": "senin@email.com",
      "ascAppId": "1234567890",
      "appleTeamId": "ABCDE12345"
    }
  }
}
```

`ascAppId`: App Store Connect → App Information → Apple ID (sayısal)
