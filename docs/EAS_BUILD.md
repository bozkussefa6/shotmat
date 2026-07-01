# EAS Build — İlk Kurulum

İlk production build için Apple kimlik bilgileri (sertifika + provisioning profile) gereklidir.

## 1. İlk build (interaktif)

Terminalde proje kökünden:

```bash
eas login          # kamoteakko olarak giriş yapılmış olmalı
eas build --platform ios --profile production
```

EAS soracak:

1. **Apple Developer hesabı** — Apple ID ve app-specific password (veya ASC API key)
2. **Distribution Certificate** — “Let EAS handle it” önerilir
3. **Provisioning Profile** — otomatik oluşturulur

`--non-interactive` yalnızca kimlik bilgileri daha önce kaydedildiyen çalışır.

## 2. Build durumu

```bash
eas build:list
```

Build tamamlanınca App Store Connect → **TestFlight**’ta görünür (5–30 dk processing).

## 3. Sonraki build’ler

Kimlik bilgileri kaydedildikten sonra:

```bash
npm run release:ios
```

## 4. TestFlight testi

[TESTFLIGHT_CHECKLIST.md](./TESTFLIGHT_CHECKLIST.md)

## Bilinen hata

```
Credentials are not set up. Run this command again in interactive mode.
```

Çözüm: `eas build --platform ios --profile production` (interaktif, `--non-interactive` olmadan)

## App-specific password

Apple ID → [appleid.apple.com](https://appleid.apple.com) → Sign-In and Security → App-Specific Passwords → +

EAS submit için de aynı şifre gerekebilir.
