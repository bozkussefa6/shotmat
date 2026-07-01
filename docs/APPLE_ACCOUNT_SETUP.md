# Apple Developer ve Sözleşmeler

ShotMat iOS yayını için Apple tarafında tamamlanması gereken adımlar.

## 1. Apple Developer Program

1. [developer.apple.com/programs](https://developer.apple.com/programs/) → **Enroll**
2. Bireysel veya şirket hesabı seç ($99/yıl)
3. Onay süresi: genelde 24–48 saat (ilk kayıtta daha uzun olabilir)

## 2. Paid Applications Agreement (IAP için zorunlu)

1. [App Store Connect](https://appstoreconnect.apple.com) → **Business** (veya Agreements, Tax, and Banking)
2. **Paid Applications** satırında **Request** / **View and Agree to Terms**
3. Sözleşmeyi oku ve kabul et

Abonelik satışı için bu adım tamamlanmadan IAP ürünleri yayına giremez.

## 3. Banka ve vergi bilgileri

Aynı **Agreements, Tax, and Banking** bölümünde:

| Bölüm | Ne girilir |
|-------|------------|
| **Bank Account** | Ödeme alacağın IBAN / banka hesabı |
| **Tax Forms** | W-8BEN (Türkiye bireysel) veya şirket formu |
| **Contact** | İletişim bilgileri |

Tüm satırlar **Active** olmalı.

## 4. App Store Connect erişimi

- Apple ID ile [appstoreconnect.apple.com](https://appstoreconnect.apple.com) giriş yap
- **Users and Access** → kendi hesabının **Admin** veya **App Manager** rolünde olduğunu doğrula

## Kontrol listesi

- [ ] Developer Program üyeliği aktif
- [ ] Paid Applications Agreement imzalandı
- [ ] Banka hesabı eklendi
- [ ] Vergi formu tamamlandı
- [ ] App Store Connect’e giriş yapılabiliyor

Sonraki adım: [APP_STORE_CONNECT.md](./APP_STORE_CONNECT.md)
