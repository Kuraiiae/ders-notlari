# KPSS Orta Öğretim — Dijital Kütüphane + Kitap Modu

KPSS ders notlarının (taranmış PDF) tarayıcıda dergi gibi okunmasını sağlayan
**tek dosyalık, çevrimdışı** bir okuyucu.

| Ders | Sayfa | Sıra |
|---|---|---|
| Türkçe | 52 | Dersler 1 |
| Tarih | 169 | Dersler 2 |
| Coğrafya | 130 | Dersler 3 |
| Vatandaşlık | 43 | Dersler 4 |
| Türkçe Testleri | 97 | Denemeler 1 |
| Türkçe Çıkmış Sorular | 46 | Denemeler 2 |
| KPSS Tam Deneme | 102 | Denemeler 3 |
| **Toplam** | **639** | |

## Kullanım

`oku.html` **(Kitap Modu — önerilen)**: sürekli kaydırma ile kitap gibi okuma,
otomatik sayfa takibi, kaldığın yerden devam, ayraçlar, Beyaz/Sepya/Gece kâğıt,
genişlik ayarı, Odak modu ve gri zeminleri bastıran **temizlenmiş sayfalar**.
Tercih orijinal tarama ile tek tuşla değiştirilebilir (`C`).

`galeri.html` (Galeri görünümü): tek/çift sayfa, zum, küçük resim şeridi,
sayfa ayraçları (kütüphane panelinde "Ayraçlarım" listesi).

İki görünümde de sol altta **yardımcı butonu (`?`)** bulunur: tek dokunuşla açılan
menüden sayfa çevirme, büyüt/küçült, sayfa görünümü, tema ve ana sayfa/galeri
bağlantılarına tek elle ulaşılır.

Her iki dosyayı da tarayıcıda açmak yeterli. Sunucu, kurulum veya internet
gerekmez — tüm görseller `assets/` klasöründen `file://` üzerinden yüklenir.

### Kaydırma, üst bar ve yan bölme (her iki görünüm)

- **Aşağı kaydırınca üst bar ve yan bölme birlikte kapanır**; okuma alanı
  büyür, dikkat dağılmaz.
- **Yukarı kaydırınca yalnızca üst bar geri gelir**; yan bölme (İçindekiler /
  Kütüphane) **kendiliğinden açılmaz** — yalnızca elle açılır.
- Kenardaki **ok düğmesi** paneli elle açar/kapatır ve **panel ile tek parça
  hareket eder**: panel açıkken okun konumu her karede panelin sağ kenarından ve
  dikey ortasından ölçülür, panel kayarken ok da onunla birlikte kayar
  (telefonda da masaüstünde de). Ok üzerindeki `›` işareti panel açıkken `‹`
  olacak şekilde döner, düğme `aria-expanded` ile durumu bildirir.
- Panel ve üst bar durumu `localStorage`'da saklanır; sayfayı yenilediğinizde
  kaldığınız düzen ve **kaldığınız sayfa** ile devam edersiniz.

### Odak modu

- **Yalnızca sol kenardaki ok şeffaflaşır** — panel tamamen gizlenir, ok
  bulunduğu yerden ayrılıp üst alana kaymaz.
- **"Odak Kapat" düğmesi sol üst köşededir** (`✕ Odak Kapat`); `O` tuşu da
  modu açıp kapatır.
- Odakta üst bar gereksiz bölmeleri gizler, okuma alanı ekranın tamamını
  kullanır.

### Telefon ve gece modu

- Telefonda üst bar **sadeleştirilir**: ders şeridi, sayfa görünümü, genişlik
  ayarı, "Temiz" düğmesi ve ana sayfa bağlantısı gizlenir; yalnızca gerekli
  düğmeler kalır (bu işlevler yardımcı menüsünde ve sol panelde durur).
  Bar yüksekliği ve boşluklar daraltılarak okuma alanı büyütülür.
- **Gece modunda üst bar opaktır** (saydamlık kaldırıldı): bar arkasından sayfa
  geçmediği için bar içindeki yazılar ve ikonlar net okunur.

### Ders ve deneme menüsü (akordeon)

- Sol paneldeki **Dersler** ve **Denemeler** başlıkları açılıp kapanır
  akordeondur (`▾` oku döner, seçim `localStorage`'da saklanır).
- Her başlığın yanında o gruptaki ders/deneme sayısı görünür; bir grubu
  kapatınca yalnızca o grubun listesi gizlenir.

### Konu özeti renkleri

`turkce-ozet.html` ve Kitap Modu çekmecesindeki özet blokları ezber kolaylığı
göz önünde tutularak renklendirilir: konu başlıkları vurgu renginde, maddeler
arası boşluk artırılmış, "Dipnot / Pratik Yol / Kritik Kural / Önemli Tuzak"
notları kendi renkli kutusunda gösterilir.

### Kitap Modu kısayolları

| Tuş | İşlev |
|---|---|
| `↑` / `↓` | Kaydır |
| `B` | Ayraç ekle/sil |
| `C` | Temizlenmiş / orijinal sayfa |
| `O` | Odak modu |
| `D` | Aydınlık / karanlık tema |
| `Ö` | Türkçe konu özeti çekmecesi |
| `K` | İçindekiler paneli |
| `Esc` | Açık çekmeceyi / yardımcı menüsünü kapat |
| `1`–`7` | Bölüm seç: 1–4 Dersler, 5–7 Denemeler |
| `+` / `-` | Sayfa genişliği artır / azalt |
| `PgDn` / `Space` / `PgUp` | Sayfa sayfa ileri / geri kaydır |
| `Home` | En başa dön |
| Sol alttaki `?` | Yardımcı menüsünü aç/kapat |

### Galeri kısayolları (`galeri.html`)

| Tuş | İşlev |
|---|---|
| `←` / `→` / `↑` / `↓` | Sayfa çevir / sayfa içinde kaydır |
| `+` / `-` / `0` | Yakınlaştır / uzaklaştır / sıfırla |
| `T` | Sayfa şeridi |
| `S` | Çift sayfa görünümü |
| `B` | Bu sayfaya ayraç koy / kaldır |
| `D` | Aydınlık / karanlık tema |
| `F` | Tam ekran |
| `K` | Kütüphane paneli |
| `Home` / `End` | İlk / son sayfa |
| `Esc` | Yardımcı menüsünü kapat |
| Sol alttaki `?` | Yardımcı menüsünü aç/kapat |

Okunan sayfa, **ayraçlar**, ders, zum/çift sayfa, tema ve panel durumu tarayıcıda
(`localStorage`) saklanır; kaldığınız yerden devam edersiniz. Ayraçlar ders
başına ayrı tutulur; kütüphane panelindeki **Ayraçlarım** listesinden tek
tıkla o sayfaya dönebilir veya ayracı silebilirsiniz.

## Site (GitHub Pages)

Canlı adres: **https://kuraiiae.github.io/ders-notlari/**

| Sayfa | Rol |
|---|---|
| `/` (`index.html`) | Tanıtım + ders kartları (statik, JS yok) |
| `/oku.html` | Kitap Modu (önerilen okuma) |
| `/galeri.html` | Galeri görünümü (tek/çift sayfa, zum) |
| `/turkce-ozet.html` | Türkçe konu özetleri (yazdırılabilir çalışma sayfası) |

`oku.html?ders=tarih` gibi derin bağlantılar doğrudan ilgili dersi açar.
Özel alan adı (`dersnotlari.com`) şu an **başkası tarafından kayıtlı**
olduğu için kullanılamıyor; ileride boşalırsa: `CNAME` dosyası ekle +
DNS'te apex `A` kayıtları (`185.199.108.153` … `.111.153`) veya `www`
için `CNAME → kuraiiae.github.io`, sonra Pages ayarından doğrula.

## Yapı

```
index.html          Tanıtım sayfası (statik, JS yok — sitenin giriş kapısı)
oku.html            Kitap Modu (önerilen okuma: sürekli kaydırma + temiz sayfa)
galeri.html         Galeri görünümü (tek/çift sayfa, zum, şerit)
turkce-ozet.html    Türkçe konu özetleri (tools/ozet.py üretir, elle düzenlenmez)
manifest.json     Ders listesi (sayfa sayısı, boyut, renk) - araçlar tarafından üretilir
assets/<ders>/    page-NNN.jpg (1400px genişlik, JPEG q74) + thumbs/page-NNN.jpg (300px)
assets/<ders>/clean/  Gri zemini bastırılmış ders çalışma sayfaları (JPEG q68)
tools/            Yeniden üretim ve doğrulama araçları
```

## Araçlar

```powershell
python tools/render.py          # PDF'lerden sayfa görselleri + küçük resimleri üretir
python tools/render.py turkce   # yalnızca seçilen dersi yeniden üretir
python tools/order.py           # ders sırasını dört dosyaya uygular (aşağıya bakın)
python tools/ozet.py            # Türkçe konu özetini sayfaya + oku.html'e (JSON) uygular
python tools/check.py           # script söz dizimini ayıklar + tüm görsellerin varlığını doğrular
node tools/ui-test.js           # üst bar / yan panel / ok / odak / akordeon / yardımcı / özet renkleri / kaldığın yer / ayraç davranışını headless tarayıcıda doğrular (156 kontrol)
python tools/enhance.py --all             # temizlenmiş ders sayfalarını üretir (assets/*/clean/)
python tools/enhance.py tarih 1           # tek sayfa önizleme -> tools/preview/ (depoya girmez)
```

`tools/render.py` içindeki `SUBJECTS` listesi PDF yollarını tutar; PDF'ler depoda
yer almaz. `tools/info.py` kaynak PDF'lerin sayfa/boyut bilgisini çıkarır.

### Türkçe konu özetleri

Özet metinlerinin **tek kaynağı** `tools/ozet.py` içindeki `BOLUM1` / `BOLUM2` /
`BOLUM3` verisidir. Betik çalıştırıldığında bu veri iki yere uygulanır:

1. `turkce-ozet.html` — bağımsız, yazdırılabilir çalışma sayfası.
2. `oku.html` — `<!-- OZET-DATA-BEGIN -->` … `<!-- OZET-DATA-END -->` arasına JSON
   olarak gömülür; Kitap Modu'nda `Ö` tuşuyla açılan çekmece ve Türkçe sayfa
   listesinin başındaki "sınav yapısı" kartı bu veriyi kullanır.

İçerik yapısı: 1. Bölüm Dil Bilgisi (7 soru) — ses bilgisi, yazım kuralları,
noktalama işaretleri, sözcükte yapı ve her biri kendi başlığı olan sözcük türü
blokları (Sıfat, Zamir, Zarf, Edat, Bağlaç, Ayrımlar) ile fiilimsi blokları
(Fiilimsiler, Adlaşma/Kalıcı İsim/Tuzaklar); 2. Bölüm sözel mantık stratejileri;
3. Bölüm paragraf taktikleri. Madde altındaki "Dipnot / Pratik Yol / Kritik Kural /
Önemli Tuzak" notları ayrı kutuda gösterilir. Özet sayfasında her blok `<h4>`,
Kitap Modu çekmecesinde `<h5>` başlığı olarak listelenir; yeni bir konu eklemek için
`tools/ozet.py` içindeki ilgili `*_BLOKLAR` listesine `{"ad": ..., "giris": ...,
"maddeler": [...], "notlar": [...]}` biçiminde yeni bir blok eklemek yeterlidir.

```
python tools/ozet.py            # içeriği uygula
python tools/check.py           # JSON + sayfa bütünlüğünü doğrula
```

### Ders sırası

Okuma sırası iki gruptur — **Dersler: Türkçe → Tarih → Coğrafya → Vatandaşlık**,
ardından **Denemeler: Türkçe Testleri → Türkçe Çıkmış Sorular → KPSS Tam Deneme** —
ve tek
kaynaktan yönetilir: `tools/order.py` içindeki `ORDER` listesi. Sırayı
değiştirmek için bu listeyi güncelleyip betiği çalıştırın; sıra `index.html`
(`LIBRARY`), `oku.html` (`LIBRARY`), `manifest.json` ve `tools/render.py`
(`SUBJECTS`) dosyalarına birlikte uygulanır.

## Notlar

- Orijinal taramalar sayfa başına ~130 KB; temizlenmiş sayfalar ~240 KB
  (tam boy, keskinleştirilmiş).
- Kaynak PDF'ler telif nedeniyle depoda bulunmaz, yalnızca türetilmiş sayfa
  görselleri yer alır.
