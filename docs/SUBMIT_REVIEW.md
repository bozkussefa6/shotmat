# App Review — Gönderim (v1.0.0 resubmit)

## Ön kontrol

- [ ] Privacy Policy URL: `https://bozkussefa6.github.io/shotmat/public/privacy.html`
- [ ] App Privacy → Device ID → **Used for tracking: No**
- [ ] Description sonunda EULA linki
- [ ] `shotmat_premium_yearly` → Ready to Submit
- [ ] Build **1.0.0 (4)** seçildi
- [ ] Export Compliance → No

## Review notes (kopyala-yapıştır)

```
ShotMat is an offline party question game for adults (17+). Question types: group, personal confession, and dare. Optional penalty-point scoring — alcohol is not required.

No sign-in required. All player names, party history, and custom questions stay on device.

Premium (shotmat_premium_yearly) — 1-year auto-renewable subscription:
- Open Profile → Go Premium
- Subscription title, length, and price shown on screen
- Privacy Policy and Terms of Use (EULA) links are tappable below the purchase button

Sandbox Premium test:
1. Settings → App Store → Sandbox Account
2. Profile → Go Premium → purchase or restore

ATT / tracking: We removed NSUserTrackingUsageDescription from the binary. The app does not request App Tracking Transparency permission.

Ads: Google AdMob interstitials for non-premium users (every 3 questions + party end).

4.3(b) update: We revised in-app copy and App Store metadata to position ShotMat as a party question game with optional penalty points, not a drinking game.
```

## Resolution Center reply (4.3b + 2.1 + 3.1.2c)

```
Thank you for the feedback.

4.3(b): We updated in-app text and App Store metadata. ShotMat is a party question game with optional penalty-point scoring; alcohol is not required. Unique features: bilingual TR/EN, custom questions, party history & stats, slot-style round transitions, offline on-device data.

2.1 ATT: We removed NSUserTrackingUsageDescription from the app binary and updated App Privacy to declare no tracking.

3.1.2(c): Premium screen now shows subscription title, length, price, and functional Privacy Policy + Terms of Use (EULA) links. EULA link added to App Store description.

Please review build 1.0.0 (4).
```

## Submit

1. Yeni build yükle (build 4)
2. ASC → v1.0.0 → metadata güncelle ([APP_STORE_METADATA.md](./APP_STORE_METADATA.md))
3. **Add for Review** → **Submit to App Review**
4. Resolution Center’a yukarıdaki reply’i gönder

## Build

```bash
eas build --platform ios --profile production
```

Transporter ile `.ipa` yüklenebilir. `ios.buildNumber` = `4`.
