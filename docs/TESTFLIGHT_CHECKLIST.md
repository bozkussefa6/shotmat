# TestFlight Kontrol Listesi

Production build TestFlight’a yüklendikten sonra bu listeyi cihazda doğrula.

## Kurulum

1. App Store Connect → **TestFlight** → build **Processing** bitsin (5–30 dk)
2. **Internal Testing** → Default group → build ekle
3. iPhone’da **TestFlight** uygulamasından yükle

## Sandbox IAP testi

1. App Store Connect → **Users and Access** → **Sandbox** → **Testers** → yeni test Apple ID
2. iPhone **Ayarlar → App Store → Sandbox Hesabı** → test hesabıyla giriş
3. Uygulamada **Premium** ekranından satın al / geri yükle dene

## Fonksiyonel test

- [ ] Uygulama açılıyor, onboarding tamamlanıyor
- [ ] Yeni parti başlatılabiliyor
- [ ] Sorular görünüyor, shot sayacı çalışıyor
- [ ] Parti sonu ekranı ve istatistikler
- [ ] Özel soru ekleme (ücretsiz limit: 5)
- [ ] Premium satın alma (sandbox) başarılı
- [ ] Restore purchase çalışıyor
- [ ] Premium sonrası reklam yok
- [ ] Premium sonrası sınırsız özel soru
- [ ] Interstitial reklamlar görünüyor (premium olmayan kullanıcı, her 3 soruda bir + parti sonu)

## Bilinen notlar

- Expo Go’da reklam ve IAP **çalışmaz** — yalnızca TestFlight / development build
- AdMob yeni uygulamalarda ilk günlerde reklam göstermeyebilir
- Sandbox satın almalar gerçek ücretlendirme yapmaz

Sorun yoksa: [SUBMIT_REVIEW.md](./SUBMIT_REVIEW.md)
