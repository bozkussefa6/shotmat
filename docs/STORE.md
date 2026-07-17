# PartyRound — Store Release Checklist

**Yeni listing (4.3b sonrası):** [PARTYROUND_ASC_SETUP.md](./PARTYROUND_ASC_SETUP.md)

**Eski ShotMat:** [RETIRE_SHOTMAT.md](./RETIRE_SHOTMAT.md)

## Quick links

| Doc | Purpose |
|-----|---------|
| [PARTYROUND_ASC_SETUP.md](./PARTYROUND_ASC_SETUP.md) | Yeni ASC app adımları (başla buradan) |
| [RETIRE_SHOTMAT.md](./RETIRE_SHOTMAT.md) | ShotMat withdraw / Resolution Center |
| [SUBMIT_REVIEW.md](./SUBMIT_REVIEW.md) | İncelemeye gönder |
| [APP_STORE_METADATA.md](./APP_STORE_METADATA.md) | Açıklama, keywords, subtitle |
| [ADMOB_SETUP.md](./ADMOB_SETUP.md) | Reklam konsol kurulumu |
| [EAS_BUILD.md](./EAS_BUILD.md) | İlk build + Apple credentials |
| [APP_PRIVACY_ANSWERS.md](./APP_PRIVACY_ANSWERS.md) | App Privacy anketi cevapları |
| [public/privacy.html](./public/privacy.html) | Gizlilik HTML |
| [public/support.html](./public/support.html) | Destek HTML |

## EAS Build

```bash
npm install -g eas-cli
eas login
npm run release:ios      # production build
npm run submit:ios       # ASC'ye yükle (opsiyonel)
```

Config: [`eas.json`](../eas.json) | Bundle: `com.kamoteakko.partyround` | Product: `partyround_premium_yearly`
