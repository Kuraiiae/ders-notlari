# ders-notlari - Ortak Hafiza

> Bu dosyayi TUM ajanlar okur ve yazar. Bir ajanin buraya yazdigi bilgi,
> diger ajanlarin proje devam ederken gorecegi kalici hafizadir.
> Otomatik: `HAFIZA.ps1 -Ekle -Proje ders-notlari -Ajan <ad> -Tip <tip> -Metin "..."`

## Kararlar

### [2026-09-29 12:49] gemini / karar
Kapsamli guncellemeler tamamlandi: 1) Cozum/Cevap maskeleme (mor 'Cozumu Goster' butonu), 2) Interaktif soru siklari (A-E secenekleri), 3) Yayinevi isimlerinin temizlenmesi, 4) Gelismis tema cekmecesi (Dark/Light + 4 arka plan rengi: Pastel Mavi, Soft Bej, Klasik Gri, Gece Mavisi) ve localStorage entegrasyonu.


### [2026-09-29 13:38] gemini / karar
Tum duzeltmeler tamamlandi ve push edildi (commit d458c44): 1) qzHasSolution duzeltildi - artik yalnizca quiz-data.json qs listesindeki sorulara maske uygulaniyor (yanlis gizleme sorunu giderildi). 2) Mask nextTop=1.0 yapildi - Cevap: satiri artik maskenin icinde kaliyor. 3) Galeri wheel scroll: page modunda sayfa atlama, width/actual modunda normal scroll. 4) index.html: Turkce Ozet chip kaldirildi, butonlar Kitap Modu / Dinamik Mod / Galeri Modu yapildi. 5) enhancements.js hideSolutions: COZUM: + Cevap: satirlari birlikte tek wrapper'a aliniyor. 6) galeri.html: yayinevi blur bandi (ust/alt %8) ve soru govdesi blur maskesi eklendi.


### [2026-09-29 19:38] opencode / karar
IS B (Tek Koyu Tema) TAMAM: 175/175 HTML'de FOUC, mor (7c5cff/6366f1/rgba124) repo genelinde 0. Sayfa toplu donusumu uygulandi (169 sayfa, +58KB). quote-box-note acik zemin/acik metin bug'i duzeltildi (#333->#b9c7e0 eslemesinin yan etkisi; #2e3842 yapildi). Kalan okunabilirlik rezidulleri rapor edildi: #111 (.quote-highlight/.highlight-quote, sayfa dogrudan), #6a1b9a .section-heading-purple, #1e3a8a bullet marker'lari - plan B kapsami disinda bilincli birakildi, onay bekliyor.


### [2026-09-29 19:44] opencode / ilerleme
Kontrast-final tamamlandi: 4 kural uygulandi (169/168/168/168 dosya), kapsayici override eklendi (tip3=20 dosya card-box, tip4=40 dosya card-box+note-callout). Yedek: C:\Users\KURAI\AppData\Local\Temp\opencode\dn-kontrast-final-yedek-2026-09-29. .table-col-left/right dokunulmadi, #111 reziduel yok, LF+BOM korundu. Betik: C:\Users\KURAI\AppData\Local\Temp\opencode\kontrast-final.py (--dry/--apply).


### [2026-09-29 19:54] opencode / ilerleme
IS A+B tamam, commit ae77f02 push edildi ve GitHub Pages canli dogrulandi (index/page_99/viewer: koyu+mavi tema, mor=0, maske motoru d.sol, FOUC korumasi). Ek duzeltmeler: viewer img ustu serit koyu, page_1 base bullet acik mavi, manifest.json+tools/* (app.js, oku.js, ozet.py, render.py, make-cover.py) mor/teal set renkleri mavi ailesine cevrildi. tools/app.js+oku.js gitignore'da (HEAD'de yok), deploy yuzeyine dahil degil.


### [2026-09-30] opencode / karar
Tarih konu ozeti eklendi ve ozet motoru "cok dersli" hale getirildi. Yeni dosya tools/ozet-tarih.py (SADE veri: 16 bolum / 49 blok / 4 tablo / 112 madde). tools/ozet.py artik sadece UYGULAMA: DERSLER = {"turkce": VERI, "tarih": veri_yukle("ozet-tarih.py")}; veri_yukle() importlib kullanir cunku dosya adi tireli ve normal import calismaz. Yeni ders eklemek = veri dosyasi yaz + DERSLER'e satir ekle. Blok semasina "tablo" alani eklendi ({"basliklar":[...],"satirlar":[[...]]}) -> .ozt; .tablo{overflow-x:auto} sarmalayici sayfayi genisletmiyor (olculdu: 412px'te tasma 0px).


### [2026-09-30] opencode / hata
ONCEDEN VAR olan bir drift bulundu ve duzeltildi: commit ae77f02 turkce-ozet.html'i elle koyu-mavi palete + color-scheme meta + enhancements.js cevirmis, ama tools/ozet.py bunu bilmiyordu. Yani "python tools/ozet.py" calistirmak turkce-ozet.html'in temasini GERI ALIYORDU. Duzeltme: koyu palet STIL'e, color-scheme TEMPLATE'a, enhancements.js enjeksiyonu sayfa_yaz()'a alindi -> uretec tek kaynak. inject-enhancements.py glob'u 'turkce-ozet.html' -> '*-ozet.html' yapildi. Ders: uretilen HTML'e elle tema/eklenti ekleme; ozet.py'den gecir.


### [2026-09-30] opencode / ilerleme
oku.html'deki "Tam sayfa ozet" linki artik sabit kodlu degil: ozSayfaAd(key) -> key+'-ozet.html'. ozBlockHTML'a ozTable() eklendi (cekmece icinde tablo cizimi), aria-label da d.ders_adi'na baglandi. index.html ozet bolumu "Konu ozetleri" olarak iki derse acildi. check.py cok dersli: her ozetli ders icin sayfa varligi, sema butunlugu (bir blokta hem tablo hem maddeler olamaz), tablo hucre/sutun tutarliligi, kitap modu linki, enhancements varligi. ui-test.js'e 37 yeni kontrol (tarih ozeti masaustu+telefon, ozet sayfasi tasma olcumu): 212 -> 249 gecti. 9 basarisiz kontrol OLDUGU GIBI (onceki commit'lerden, bu isin disinda) - kanit: git stash ile baseline 212/9 ayni.

