# Ders Notları — Dijital Kütüphane + Kitap Modu

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

`index.html` (Galeri görünümü): tek/çift sayfa, zum, küçük resim şeridi.

Her iki dosyayı da tarayıcıda açmak yeterli. Sunucu, kurulum veya internet
gerekmez — tüm görseller `assets/` klasöründen `file://` üzerinden yüklenir.

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
| `Esc` | Açık çekmeceyi kapat |
| `1`–`7` | Bölüm seç: 1–4 Dersler, 5–7 Denemeler |

### Galeri kısayolları (`galeri.html`)

| Tuş | İşlev |
|---|---|
| `←` / `→` | Sayfa çevir |
| `+` / `-` / `0` | Yakınlaştır / uzaklaştır / sıfırla |
| `T` | Sayfa şeridi |
| `S` | Çift sayfa görünümü |
| `D` | Aydınlık / karanlık tema |
| `F` | Tam ekran |
| `K` | Kütüphane paneli |

Okunan sayfa, ayraçlar, ders, kâğıt, genişlik ve tema tercihleri tarayıcıda
(`localStorage`) saklanır; kaldığınız yerden devam edersiniz.

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
noktalama işaretleri, sözcükte yapı, sözcük türleri, fiilimsiler; 2. Bölüm sözel
mantık stratejileri; 3. Bölüm paragraf taktikleri. Madde altındaki "Dipnot /
Pratik Yol / Kritik Kural / Önemli Tuzak" notları ayrı kutuda gösterilir.

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
