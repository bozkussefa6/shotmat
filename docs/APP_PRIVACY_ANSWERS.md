# App Store Connect — App Privacy Anketi

ShotMat için önerilen cevaplar (review reddi sonrası — **tracking: No**).

App Store Connect → App Privacy → Edit → Publish.

## Özet

- **Do you or your third-party partners collect data from this app?** → **Yes**
- Kendi backend’iniz yok; toplama esas olarak **AdMob (third party)** kaynaklı.

## Data types

### Identifiers — Device ID

| Soru | Cevap |
|------|--------|
| Collect? | Yes |
| Linked to user? | No (ShotMat hesabı yok) |
| **Used for tracking?** | **No** — ATT kaldırıldı, izin istenmiyor |
| Purpose | Third-Party Advertising |
| Third party | Google (AdMob) |

### Contact Info, Location, Health, Financial, etc.

**No** — ShotMat bu kategorileri toplamaz.

### Usage Data / Diagnostics (kendi analitiğin)

**No** — Firebase Analytics vb. yok.

## Notlar

- Oyuncu adları, sorular, parti sonuçları: **cihazda kalır**, App Privacy’de “Collected by you” olarak işaretlenmez.
- `NSUserTrackingUsageDescription` app binary’den kaldırıldı (`app.json`).
- AdMob App Privacy formunu Google dokümantasyonu ile çapraz kontrol et: https://support.google.com/admob/answer/10113207

## Privacy Policy URL

`https://bozkussefa6.github.io/shotmat/public/privacy.html`
