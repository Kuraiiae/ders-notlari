# Ders Notları — Dijital Kütüphane

KPSS ders notlarının (taranmış PDF) tarayıcıda dergi gibi okunmasını sağlayan
**tek dosyalık, çevrimdışı** bir okuyucu.

| Ders | Sayfa | Sıra |
|---|---|---|
| Türkçe | 52 | 1 |
| Tarih | 169 | 2 |
| Coğrafya | 130 | 3 |
| Vatandaşlık | 43 | 4 |
| **Toplam** | **394** | |

## Kullanım

`index.html` dosyasını tarayıcıda açın. Sunucu, kurulum veya internet gerekmez —
tüm görseller `assets/` klasöründen `file://` üzerinden yüklenir.

### Klavye kısayolları

| Tuş | İşlev |
|---|---|
| `←` / `→` | Sayfa çevir |
| `+` / `-` / `0` | Yakınlaştır / uzaklaştır / sıfırla |
| `T` | Sayfa şeridi |
| `S` | Çift sayfa görünümü |
| `D` | Aydınlık / karanlık tema |
| `F` | Tam ekran |
| `K` | Kütüphane paneli |

Okunan sayfa, tema, yakınlaştırma ve görünüm tercihleri tarayıcıda
(`localStorage`) saklanır; kaldığınız yerden devam edersiniz.

## Yapı

```
index.html        Tek dosyalık okuyucu (HTML + CSS + JS gömülü, glassmorphism UI)
manifest.json     Ders listesi (sayfa sayısı, boyut, renk) - araçlar tarafından üretilir
assets/<ders>/    page-NNN.jpg (1400px genişlik, JPEG q74) + thumbs/page-NNN.jpg (300px)
tools/            Yeniden üretim ve doğrulama araçları
```

## Araçlar

```powershell
python tools/render.py          # PDF'lerden sayfa görselleri + küçük resimleri üretir
python tools/render.py turkce   # yalnızca seçilen dersi yeniden üretir
python tools/order.py           # ders sırasını üç dosyaya uygular (aşağıya bakın)
python tools/check.py           # script söz dizimini ayıklar + tüm görsellerin varlığını doğrular
```

`tools/render.py` içindeki `SUBJECTS` listesi PDF yollarını tutar; PDF'ler depoda
yer almaz. `tools/info.py` kaynak PDF'lerin sayfa/boyut bilgisini çıkarır.

### Ders sırası

Okuma sırası **Türkçe → Tarih → Coğrafya → Vatandaşlık** olarak sabittir ve tek
kaynaktan yönetilir: `tools/order.py` içindeki `ORDER` listesi. Sırayı
değiştirmek için bu listeyi güncelleyip betiği çalıştırın; sıra `index.html`
(`LIBRARY`), `manifest.json` ve `tools/render.py` (`SUBJECTS`) dosyalarına
birlikte uygulanır.

## Notlar

- Görseller tarama olduğu için sayfa başına ~130 KB; toplam depo ~101 MB.
- Kaynak PDF'ler telif nedeniyle depoda bulunmaz, yalnızca türetilmiş sayfa
  görselleri yer alır.
