# PartyRound — Yeni App Store Connect Kurulumu

ShotMat 4.3(b) reddi sonrası **yeni uygulama** olarak gönderilir.

| Alan | Değer |
|------|--------|
| App name | PartyRound |
| Bundle ID | `com.kamoteakko.partyround` |
| SKU | `partyround` |
| Version | `1.0.0` |
| Premium product | `partyround_premium_yearly` |
| Privacy URL | https://bozkussefa6.github.io/party-round/public/privacy.html |
| Support URL | https://bozkussefa6.github.io/party-round/public/support.html |

## 1. Apple Developer — App ID

1. Certificates, Identifiers & Profiles → **Identifiers** → **+**
2. App IDs → App
3. Description: PartyRound
4. Bundle ID: Explicit → `com.kamoteakko.partyround`
5. Capabilities: **In-App Purchase**
6. Register

## 2. App Store Connect — Yeni app

1. **My Apps** → **+** → New App
2. Platforms: iOS
3. Name: PartyRound
4. Primary language: Turkish (or English)
5. Bundle ID: `com.kamoteakko.partyround`
6. SKU: `partyround`
7. User Access: Full Access

## 3. Agreements / Pricing

- Paid Apps Agreement aktif olmalı (mevcut hesapta zaten olabilir)
- Pricing → **Free**
- Availability → All countries (veya seçilen bölgeler)

## 4. App Privacy

- Privacy Policy URL (yukarıdaki)
- Device ID → Third-Party Advertising
- Linked to user: **No**
- Used for tracking: **No** (ATT binary’de yok)
- Publish

## 5. Age Rating

17+ (mature party questions)

## 6. Subscription

1. Monetization → Subscriptions → **+** group: **PartyRound Premium**
2. Product ID: `partyround_premium_yearly`
3. Duration: 1 year
4. Localization (TR/EN) + price + review screenshot
5. Ready to Submit

## 7. AdMob

1. AdMob → Add app → iOS → Bundle `com.kamoteakko.partyround`
2. Interstitial unit oluştur
3. Yeni App ID + unit ID’yi [`app.json`](../app.json) `plugins` / `extra` alanlarına yaz
4. Yeni production build al

> Not: Kodda hâlâ eski ShotMat AdMob ID’leri placeholder olarak duruyor. Yeni app’i ASC’ye kaydettikten sonra AdMob unit’lerini güncelleyip yeniden build al.

## 8. Build & TestFlight

```bash
eas build --platform ios --profile production
# veya Transporter ile .ipa yükle
```

Yeni bundle için EAS ilk seferde Apple credentials / provisioning soracak.

## 9. Metadata & screenshots

Metinler: [APP_STORE_METADATA.md](./APP_STORE_METADATA.md)

Screenshot’larda:
- PartyRound logosu
- “Sadece sorular” / scoring off vurgusu
- Shot / içki / alkol yazısı yok

## 10. Submit

Review notes şablonu: [SUBMIT_REVIEW.md](./SUBMIT_REVIEW.md)

Version sayfasında `partyround_premium_yearly` seç → Submit to App Review
