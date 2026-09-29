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

