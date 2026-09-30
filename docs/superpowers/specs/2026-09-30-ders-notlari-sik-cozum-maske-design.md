# Ders Notları — Simetrik Şıklar + Çözüm Maskesi (Tasarım)

**Tarih:** 2026-09-30
**Kapsam:** `Kuraiiae/ders-notlari` — Kitap Modu (`oku.html`), Galeri Modu (`galeri.html`), Dinamik Mod (`viewer.html`)
**Durum:** Onaylandı (2026-09-30)

---

## 1. Amaç

Deneme sayfalarında:

1. **Tüm A‑B‑C‑D‑E şıkları tıklanabilir** olsun.
2. **ÇÖZÜM: / Cevap: blokları** "Çözümü Göster" butonuyla gizlensin.
3. **ÖRNEK şeritli soruların çözüm blokları** da gizlensin.
4. **SORU metni hiçbir zaman gizlenmesin** — yalnız çözüm ve örnek çözümü gizlenir.
5. **A‑B‑C‑D‑E alanları simetrik** olsun ve her biri **kendi cümlesini tamamen kapsasın** (tıklama alanı = metin satırının tamamı).

## 2. Kapsam Dışı

- `turkce-cikmis` (Türkçe Çıkmış Sorular) sayfalarında çözüm/cevap/örnek bloğu **yoktur** (görselle doğrulandı). Bu sette yalnız şık simetriği uygulanır, maske uygulanmaz.
- `page_*.html` (ders sayfaları, `enhancements.js` ile metin tabanlı) — sınav sorusu içermez, dokunulmaz.
- Kaynak PDF'ler diskte yoktur; tüm üretim **OCR** ile yapılacaktır.

---

## 3. Mevcut Durum (doğrulanmış)

### 3.1 Çalışan

- Üç mod da A‑E hotspot çiziyor, işaretlemeyi `localStorage`'a yazıyor, "Denemeyi bitir" ile puanlıyor.
- 702 sorunun **tamamında** A‑B‑C‑D‑E koordinatı var: `turkce-test` 225, `turkce-cikmis` 157, `deneme` 320.

### 3.2 Kırık

| # | Sorun | Kanıt |
|---|---|---|
| K1 | **Çözüm maskesi hiç çalışmıyor** | `tools/quiz-embed.py` `pages[p]["sol"]` okuyor; `quiz-data.json`'da `sol` alanı **yok** (sadece 21 soruluk `qs` listesi var). `qzSolutionMaskKoy()` her çağrıda `return` ediyor → "Çözümü Göster" butonu hiçbir yerde görünmüyor. |
| K2 | **Şık kutuları simetrik değil** | `tools/quiz-vis.py` ile üretilen `tools/preview/quiz-deneme-4.png`: yatay dizilimde (`A) 65  B) 63  C) 60  D) 57  E) 54`) kutular üst üste biniyor, sol/sağ kenarlar ragged. `qzHotHiza()` sezgisel; satır/sütun gruplaması ve genişlik kırpma mantığı tutmuyor. |
| K3 | **Soru tespiti eksik ve hatalı** | `turkce-test` sayfa 3'ün sol sütunu (ÇÖZÜM + Cevap'lı sorular) hiç veri içermiyor. `deneme` sayfa 4'te çözüm metni "soru" sanılmış: soru no `8, 13, 712`; sayfa 5'te `0, 1`; sayfa 6'da `0, 24, 49`. |
| K4 | **Yayınevi bandı içerik kesiyor** | `qzPublisherMaskKoy()` her sayfanın üst %7 / alt %7'sini opak kapatıyor. |
| K5 | **Üç ayrı kod kopyası** | `viewer.html` 30 `qz*` fonksiyonu, `oku.html` 24 `qhotspot` kullanımı + `qzHotOlcek`/`qzHotspotsHizala`, `galeri.html` 14 `qz-hot` kullanımı. Üçü de farklı sınıf adları (`.qhotspot` / `.qz-hot`) ve farklı fonksiyon kümeleri kullanıyor. |

### 3.3 Kısıt

`tools/render.py` ve `tools/quiz.py` şu kaynak PDF'leri bekliyor; **hiçbiri diskte yok**:

```
C:\Users\KURAI\Downloads\Türkçe 2.pdf
C:\Users\KURAI\Downloads\turkce (1).pdf
C:\Users\KURAI\Downloads\tarih.pdf
C:\Users\KURAI\Downloads\cografya.pdf
C:\Users\KURAI\Downloads\vatandaslik.pdf
C:\Users\KURAI\Downloads\Turkce.pdf
C:\Users\KURAI\Downloads\paraf-akademi-kpss-...-turkce-cikmis-sorular.pdf
```

Bu yüzden `tools/quiz.py` yeniden çalıştırılamaz; yeni koordinat üretimi görselden yapılacaktır.

---

## 4. Yaklaşım

**OCR ile tam yeniden üretim.** `rapidocr-onnxruntime` kuruldu ve spike ile doğrulandı:

- `ORNEK` (0.99), `Cevap:B` (0.97), `A)65`/`B)63` (0.99) — metin + kutu doğru okunuyor.
- 8 sn/sayfa → 735 sayfa ≈ 98 dk tek iş parçacığı; `ProcessPoolExecutor` ile ≈ 12 dk.
- Sunucu / API anahtarı / harici ikili dosya gerekmiyor.
- Türkçe karakterler `ç→c, ğ→g, ü→u, ş→s, ı→i` okunuyor → işaret eşleştirmede **bulanık normalizasyon** zorunlu.

Alternatifler ve neden seçilmedi:
- *Renk maskesiyle tespit:* `deneme`de çalışıyor (magenta `#E060A0`), `turkce-test`te başarısız (soluk mor `#907090`), `turkce-cikmis`te sıfır. Kitap paletleri farklı → OCR ile metin eşleştirmesi belirgin biçimde daha güvenilir.
- *Salt geometrik çıkarım:* Sadece mevcut (eksik) koordinatlarla çalışır; K3'teki eksik sütunu ve bozuk soru numaralarını düzeltemez.

---

## 5. Mimari

```
tools/ocr-extract.py      OCR → tools/ocr-cache/<set>/page-NNN.json   (önbellek, depoya girmez)
tools/rebuild-quiz.py     OCR önbelleği + eski anahtarlar → quiz-data.json (v2)
tools/quiz-embed.py       quiz-data.json + quiz-keys.json → 3 HTML'e gömer (sol dahil)
tools/quiz-vis.py         Kutu + maske çizimi → tools/preview/*.png (gözle doğrulama)
tools/verify-masks.py     Maske/soru/şık çakışma ve kapsam denetimi
quiz-core.js              TEK hotspot + maske çekirdeği (oku/galeri/viewer yükler)
```

**Çalıştırma sırası:** `ocr-extract` → `rebuild-quiz` → `quiz-embed` → `verify-masks` → `quiz-vis` (gözle) → `check` → `ui-test`

---

## 6. Veri Şeması

`quiz-data.json` v2:

```json
{
  "deneme": {
    "w": 595.28, "h": 841.89, "pdf": "...",
    "pages": {
      "4": {
        "q": [
          { "n": 8,
            "b": [0.5255, 0.0583, 0.8868, 0.0753],
            "c": { "A": [x0,y0,x1,y1], "B": [...], "C": [...], "D": [...], "E": [...] } }
        ],
        "qs":  ["8", "13"],
        "sol": { "8": [x0,y0,x1,y1] }
      }
    }
  }
}
```

**Kırıcı şema değişikliği:** `sol` kutuları `[y0, y1, x0, x1]` (eski okuyucu beklentisi) değil, **`[x0, y0, x1, y1]`** olacak — `b` ve `c` ile aynı sıralama. Üç modun maske okuyucusu buna göre güncellenir. Eski `sol` verisi (yok) ve `qs` listesi korunur.

---

## 7. Simetrik Şık Hizalama Algoritması

`QuizCore.hizalaSiklar(secenekler)` — girdi `{A:[x0,y0,x1,y1], …}`, çıktı `{A:{x,y,w,h}, …}`. **Deterministik, girdiye bağlı olarak aynı sonucu üretir.**

1. **Satır gruplama.** Kutular `cy = (y0 + y1) / 2` ile sıralanır. Greedy: bir kutu, o ana kadarki satırların medyan `cy`'sine `|Δcy| <= max(0.006, h_satır * 0.6)` ise o satıra eklenir, değilse yeni satır açılır. (OCR kutuları sütun bazlı okunduğu için yatay dizilimler doğal olarak tek satırda toplanır.)
2. **Senaryo A — yatay dizilim** (bir satırda 5 kutu):
   - `sol = min(x0)`, `sag = max(x1)`
   - `slot = (sag - sol) / 5`
   - `kolon_i: x0 = sol + i·slot + GAP/2`, `x1 = sol + (i+1)·slot − GAP/2`, `GAP = 0.002`
   - Sonuç: **5 eşit aralıklı, çakışmayan kolon.** Her kolon kendi cümlesini tamamen kapsar.
3. **Senaryo B — dikey dizilim** (her satırda 1 kutu):
   - `sol = min(x0)` tüm 5 kutu üzerinden
   - `genislik = max(x1) − sol + 0.008` tüm 5 kutu üzerinden
   - Her kutu **aynı sol kenarı, aynı genişliği** alır; yükseklik kendi satır bandında.
4. **Satır bandı.** Her satır için `y0 = min(y0) − 0.004`, `h = (max(y1) − min(y0)) + 0.008`. Aynı satırdaki tüm kutular aynı `y0`/`h` alır.
5. **Rozet.** A‑B‑C‑D‑E harfi kolonun sol kenarına sabitlenir (`--qh-b` ile ölçülür, kutu yüksekliğini asla aşmaz). Seçili → kırmızı, doğru → yeşil `✓`, yanlış → kırmızı `✗`.
6. **Sıra koruması.** Kolon ataması harfe göredir (A en solda), konuma göre değil — OCR hangi harfin nerede olduğunu zaten biliyor.

> Eski `qzHotHiza`'daki "sütun `Math.abs(x0 - col.x) < 0.04` ile eşleştirme" ve "sağdaki komşuya göre genişlik kırpma" mantıkları kaldırılır; bu iki kural K2'deki binme ve ragged kenarların kaynağıdır.

---

## 8. Çözüm / Örnek Maskesi

### 8.1 İşaret bulma (OCR metni)

Metin şu sırayla normalize edilir: `lower()` + `ç→c, ğ→g, ı→i, ö→o, ş→s, ü→u, â→a, î→i, û→u, â→a` + fazla boşluk temizliği.

| İşaret | Desen |
|---|---|
| Çözüm başlığı | `^(cozum)\s*:?` |
| Cevap satırı | `^(cevap)\s*:\s*([a-e])` |

### 8.2 Blok sınırları (aynı sütun içinde)

```
y0 = isaret.y0 − 0.004
y1 = cevap satırı varsa      → cevap.y1 + 0.004
     yoksa 1. sonraki soru kökünün (b) y0'u
     yoksa 2. sonraki "A)" satırının y0'u
     yoksa 3. sonraki çözüm/örnek işaretinin y0'u
     yoksa 4. sütun alt sınırı. Sütun, sayfadaki tüm soru köklerinin `b`
             merkezlerinin x'e göre kümelenmesiyle bulunur; sütun alt sınırı
             bu kümenin alt sınırıdır. Küme bulunamazsa sayfa sonu − 0.05.
x0 = soru kökünün (b) sol kenarı − 0.004
x1 = soru kökünün (b) sağ kenarı + 0.004
```

Bir soruya hem `Çözüm:` hem `Cevap:` düşüyorsa **tek birleşik kutu** üretilir.

### 8.3 ÖRNEK şeritli sorular

`ORNEK` şeridi bir sorunun başlığıdır → **şerit, soru metni ve A‑B‑C‑D‑E şıkları maskelenmez.** Yalnız şeridin altındaki `Çözüm:` bloğu 8.2 kurallarıyla maskelenir.

### 8.4 Sert koruma kuralları

1. **Soru kökü koruması.** `sol` kutusu herhangi bir soru köküyle (`b`) kesişiyorsa kesişen şerit kırpılır. Kırpma sonrası yükseklik `< 0.01` ise o soru için maske **üretilmez**.
2. **Şık koruması.** `sol` kutusu herhangi bir şık kutusuyla (`c`) kesişiyorsa aynı şekilde kırpılır.
3. **Sayfa kenarı koruması.** Maske sayfanın üst/alt %4'üne taşamaz.
4. Bu üç kural `tools/verify-masks.py` tarafından her kutu için doğrulanır; ihlal varsa `rebuild-quiz.py` hata verir.

### 8.5 Yayınevi bandı

`qzPublisherMaskKoy()` içindeki kör `top:0 h:%7` / `top:%93 h:%7` bantları **kaldırılır**. Yerine: sayfa görselinin üst/alt bantlarında gerçekten yayınevi logosu bulunan dikdörtgenler kapatılır; bulunamazsa hiç örtü konmaz.

---

## 9. Paylaşılan Çekirdek — `quiz-core.js`

- K5'i çözer. `viewer.html`'daki 30 `qz*` fonksiyonu referans alınarak tek dosyaya taşınır.
- `oku.html`, `galeri.html`, `viewer.html` `<script src="quiz-core.js">` ile yükler.
- Sınıf adları **tekilleştirilir**: `.qhotspot` (kanonik). `.qz-hot` ve diğer takma adlar kaldırılır.
- Dışa açılan API: `QuizCore.hizalaSiklar`, `QuizCore.rozetOlcek`, `QuizCore.masKoy`, `QuizCore.yayineviMaskKoy`, `QuizCore.soruyuKoru`.
- Üç modun kendi `qz*` kopyaları silinir; çağrılar `QuizCore`'a yönlendirilir.

---

## 10. Doğrulama

| Katman | Araç | Kriter |
|---|---|---|
| Veri bütünlüğü | `tools/check.py` | Her soruda tam 5 şık; her `sol` kutusu `[0,1]` aralığında; `qs` ⊆ `sol` anahtarları |
| Maske güvenliği | `tools/verify-masks.py` | Hiçbir `sol` kutusu soru köküyle veya şık kutusuyla kesişmiyor; hiçbiri sayfa kenar bandına taşmıyor |
| Görsel | `tools/quiz-vis.py` | Kutular + maskeler sayfa görseline çizilir → `tools/preview/` → gözle inceleme |
| Davranış | `node tools/ui-test.js` | Mevcut 194 kontrol korunur + yeni: 5 şık tıklanabilir, simetrik kutu genişlikleri eşit, maske butonu açıp kapanıyor, soru kökü maskesiz kalıyor |
| Regresyon | `tools/verify_all.py` | Sayfa bütünlüğü, asset varlığı |

**Manuel kabul:** en az 20 sayfa (`deneme:4`, `turkce-test:3`, `turkce-cikmis:3` vb.) `quiz-vis.py` çıktısı üzerinden gözle incelenecek ve kullanıcı onaylayacak.

---

## 11. Riskler

| Risk | Etki | Azaltma |
|---|---|---|
| OCR süresi (735 sayfa) | ~100 dk tek thread | `ProcessPoolExecutor`, disk önbelleği; `--force` ile kısmi yeniden tarama |
| OCR `712`, `49` gibi metinleri soru sanabilir | Sahte soru (K3'ün kaynağı) | Soru numaraları **art arda artmalı** olmalı; anahtardaki (`tools/quiz-keys.json`) numaralarla çapraz doğrulanır; tutmayanlar atılır |
| Kitaplar arası yazı tipi farkı | Eşik kaçırması | Kitap bazlı eşikler `tools/ocr-conf.json`'da; gözle doğrulama turu |
| 3 mod birden değişiyor | Kırılma riski | Aşama sırası: önce `quiz-core.js` + Aşama 2 (veri bağımsız, hemen görünür kazanç), sonra veri. Her adımda `ui-test.js` çalıştırılır |
| Şema değişikliği (`sol` sıralaması) | Eski maske verisi okunamaz | `sol` alanı zaten yok; sıralama 3 okuyucuda birlikte değiştirilir |

---

## 12. Aşama Sırası

1. **Aşama 1** — `quiz-core.js` çekirdeği + 3 moda bağlama (davranış değişmez, K5 çözülür).
2. **Aşama 2** — Deterministik simetrik hizalama (K2 çözülür, veri gerekmez → hemen görünür kazanç).
3. **Aşama 3** — Yayınevi bandı düzeltmesi + soru kökü koruması (K4).
4. **Aşama 4** — `tools/ocr-extract.py` + `rebuild-quiz.py` (K3, K1'in veri kısmı).
5. **Aşama 5** — `quiz-embed.py` `sol` gömmesi + maske okuyucuları (K1'in arayüz kısmı).

Aşama 1‑3 veri üretiminden bağımsızdır ve hemen test edilebilir. Aşama 4‑5 maskeyi açar.
