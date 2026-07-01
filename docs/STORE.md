# ShotMat — Store Release Checklist

**Ana rehber:** [RELEASE_RUNBOOK.md](./RELEASE_RUNBOOK.md)

## Quick links

| Doc | Purpose |
|-----|---------|
| [RELEASE_RUNBOOK.md](./RELEASE_RUNBOOK.md) | Sıralı yayın adımları (başla buradan) |
| [APPLE_ACCOUNT_SETUP.md](./APPLE_ACCOUNT_SETUP.md) | Developer Program, sözleşme, banka |
| [APP_STORE_CONNECT.md](./APP_STORE_CONNECT.md) | ASC kayıt, IAP, TestFlight |
| [ADMOB_SETUP.md](./ADMOB_SETUP.md) | Reklam konsol kurulumu |
| [EAS_BUILD.md](./EAS_BUILD.md) | İlk build + Apple credentials |
| [SUBMIT_REVIEW.md](./SUBMIT_REVIEW.md) | İncelemeye gönder |
| [PRIVACY_POLICY.md](./PRIVACY_POLICY.md) | Gizlilik metni |
| [public/privacy.html](./public/privacy.html) | Yayınlanabilir HTML (GitHub Pages vb.) |
| [APP_PRIVACY_ANSWERS.md](./APP_PRIVACY_ANSWERS.md) | App Privacy anketi cevapları |
| [APP_STORE_METADATA.md](./APP_STORE_METADATA.md) | Açıklama, keywords, subtitle |

## EAS Build

```bash
npm install -g eas-cli
eas login
npm run release:ios      # production build
npm run submit:ios       # ASC'ye yükle (opsiyonel)
npm run screenshots:ios  # 6.7" screenshot yakalama
```

Config: [`eas.json`](../eas.json) | Bundle: `com.shotmat.app`
