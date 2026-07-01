# ShotMat — İçerik Rehberi

21+ yetişkin parti shot oyunu. Ton: cesur, keskin, flörtöz — lise/çocuk dili değil.

## Soru tipleri

| Tip | `type` | Kim cevaplar | Placeholder |
|-----|--------|--------------|-------------|
| Grup | `group` | Herkes kendi durumuna göre | Yok |
| Kişisel | `personal` | Sadece hedef oyuncu | `{{player}}` zorunlu |
| Görev | `dare` | Hedef oyuncu yapar | `{{player}}` zorunlu |

## Yasaklı kalıplar

- Sonda `Shot!`, `shot at`, `yapamazsan shot`, `anlatmazsan shot` vb.
- Emoji
- Aynı cümle iskeletinin 3+ kez tekrarı
- Çocukça görevler (utanç dansı, "ben seksi insanım" mesajı)
- Her kişisel soruda "itiraf et / söylemezsen"

## İyi / kötü örnekler

**Grup — kötü:**  
`Daha önce tek gecelik ilişki yaşadıysan shot at.`

**Grup — iyi:**  
`Son altı ayda tek gecelik yaşayan var mı — kendi durumuna göre cevapla.`

**Kişisel — kötü:**  
`{{player}}, en utanç verici cinsel anını anlat. Anlatmazsan shot!`

**Kişisel — iyi:**  
`{{player}}, son bir yılda pişman olduğun bir mesaj veya aramayı anlat.`

**Görev — kötü:**  
`{{player}}, en kötü cinsel taklidi yap. Yapamazsan shot!`

**Görev — iyi:**  
`{{player}}, masadaki birine 30 saniye boyunca göz teması kur — konuşmadan.`

## Uzunluk

- TR: ~15–120 karakter, tek net cümle veya iki kısa cümle
- EN: doğal karşılık; kelime kelime çeviri değil

## Onay akışı

1. Taslak: `docs/QUESTIONS_DRAFT.md`
2. Gözden geçir / düzenle
3. **"kullandı"** deyince → `src/data/questions.js` güncellenir
