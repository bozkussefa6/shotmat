# App Store Connect — App Privacy Anketi

ShotMat için önerilen cevaplar. App Store Connect → App Privacy → Get Started.

## Özet

- **Do you or your third-party partners collect data from this app?** → **Yes**
- Kendi backend’iniz yok; toplama esas olarak **AdMob (third party)** kaynaklı.

## Data types

### Identifiers — Advertising Data

| Soru | Cevap |
|------|--------|
| Collect? | Yes |
| Linked to user? | No (ShotMat hesabı yok) |
| Used for tracking? | AdMob policy — typically Yes for advertising |
| Purpose | Third-Party Advertising |
| Third party | Google (AdMob) |

### Contact Info, Location, Health, Financial, etc.

**No** — ShotMat bu kategorileri toplamaz.

### Usage Data / Diagnostics (kendi analitiğin)

**No** — Firebase Analytics vb. yok.

## Notlar

- Oyuncu adları, sorular, parti sonuçları: **cihazda kalır**, App Privacy’de “Collected by you” olarak işaretlenmez.
- Privacy Nutrition Label’da yalnızca reklam partner’ının topladığı veriler görünür.
- AdMob App Privacy formunu Google dokümantasyonu ile çapraz kontrol et: https://support.google.com/admob/answer/10113207

## Privacy Policy URL

`https://shotmat.app/privacy` — kaynak: [public/privacy.html](./public/privacy.html)
