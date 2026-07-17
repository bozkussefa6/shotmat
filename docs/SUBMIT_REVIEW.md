# App Review — PartyRound (yeni listing)

## Ön kontrol

- [ ] Yeni ASC app: PartyRound / `com.kamoteakko.partyround`
- [ ] Privacy Policy URL girildi
- [ ] App Privacy → tracking **No**
- [ ] Description sonunda EULA linki
- [ ] `partyround_premium_yearly` → Ready to Submit + sürüme eklendi
- [ ] Production build seçildi
- [ ] Export Compliance → No

## Review notes (kopyala-yapıştır)

```
PartyRound is an offline party question game for adults (17+). Question types: group, personal confession, and dare.

Unique features:
- Optional scoring OR questions-only mode (no points)
- Bilingual Turkish / English
- Custom questions, party history & stats
- Slot-style round transitions
- No account — all data stays on device

Premium (partyround_premium_yearly) — 1-year auto-renewable subscription:
- Open Profile → Go Premium
- Subscription title, length, and price shown on screen
- Privacy Policy and Terms of Use (EULA) links are tappable below the purchase button

Sandbox Premium test:
1. Settings → App Store → Sandbox Account
2. Profile → Go Premium → purchase or restore

ATT / tracking: The app does not include NSUserTrackingUsageDescription and does not request tracking permission.

Ads: Google AdMob interstitials for non-premium users (every 3 questions + party end).

This is a new app listing (not a resubmit of ShotMat). PartyRound is positioned as a party question game with optional scoring — not a drinking game.
```

## Build

```bash
eas build --platform ios --profile production
```

Bundle: `com.kamoteakko.partyround` | Product: `partyround_premium_yearly`
