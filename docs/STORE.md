# ShotMat — Store Release Checklist

## Brand Assets (done in repo)
- [x] App icon `assets/icon.png` (1024×1024)
- [x] Adaptive icon `assets/adaptive-icon.png`
- [x] Splash icon `assets/splash-icon.png`
- [x] In-app logo `src/components/AppLogo.js`

## Before Submitting

### Apple App Store
1. Create App Store Connect record for `com.shotmat.app`
2. Configure IAP product: `shotmat_premium_yearly` (₺99/year)
3. Add privacy policy URL (required)
4. Capture screenshots on iPhone 6.7" and 6.1" with new ShotMat branding
5. Upload build via EAS: `eas build --platform ios`
6. Submit to TestFlight for internal testing

### Google Play
1. Create Play Console app for `com.shotmat.app`
2. Configure subscription product `shotmat_premium_yearly`
3. Feature graphic 1024×500 (TR + EN)
4. Capture phone + tablet screenshots
5. Upload AAB via EAS: `eas build --platform android`

## Monetization Configuration

Set AdMob unit IDs in `app.json` → `expo.extra`:
```json
"extra": {
  "admobInterstitialId": "ca-app-pub-XXXX/YYYY",
  "admobRewardedId": "ca-app-pub-XXXX/ZZZZ"
}
```

Install ads SDK when ready:
```bash
npx expo install react-native-google-mobile-ads
```

## Privacy
- All data stored locally (AsyncStorage only)
- No analytics or external user data transmission
- KVKK text in onboarding + settings

## Version
Current: 1.0.0 (`app.json`)
