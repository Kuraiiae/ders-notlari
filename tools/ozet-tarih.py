# -*- coding: utf-8 -*-
"""KPSS Tarih konu özetlerinin tek kaynağı.

Bu dosya YALNIZCA veriyi tutar. Uygulama (HTML üretimi, oku.html'e gömme)
tools/ozet.py içindedir.

Blok şeması
-----------
    {"ad":     "Blok başlığı" (<h4>),
     "giris":  "isteğe bağlı giriş paragrafı",
     "maddeler": [{"t": "Başlık",
                   "d": "açıklama",
                   "n": [{"tur": "Dipnot", "d": "not metni"}]}],
     "notlar":  [{"tur": "Kritik Kural", "d": "not metni"}],
     "tablo":   {"basliklar": ["sütun 1", ...],
                 "satirlar":  [["hücre", ...], ...]}}

`maddeler` ve `tablo` aynı anda kullanılmaz; tablo varsa maddeler yazılmaz.

Bölüm şeması: {"no": "1", "ad": "...", "etiket": "...", "giris": "...", "bloklar": [...]}

Değiştirdikten sonra:

    python tools/ozet.py
    python tools/check.py
"""

# ── Sayfa üst bilgisi ───────────────────────────────────────────────────────
DERS_ADI = "Tarih"
ACIKLAMA = ("KPSS Tarih genel tekrar notları: İslamiyet öncesi Türk tarihi, Türk-İslam "
            "devletleri, Osmanlı teşkilatı, ordu, toprak, hukuk, vergiler ve dönemler.")
LEAD = ("KPSS Tarih genel tekrar notları &middot; İslamiyet öncesi Türk tarihi, "
        "Türk-İslam devletleri, Osmanlı teşkilatı, ordu, hukuk ve vergiler")
VURGU = ["İslamiyet Öncesi", "Türk-İslam Devletleri", "Devlet Teşkilatı",
         "Kara Ordusu", "Tımar ve Toprak", "Hukuk", "Vergi", "Dönemler"]

GIRIS = ("Tarih oturumunun ağırlıklı kısmı <b>Osmanlı Devleti</b>'dir. Bu özet önce "
         "İslamiyet öncesi Türk devletlerini ve Türk-İslam devletlerini kısa bir "
         "hatırlatır; asıl yoğunluk Osmanlı'da teşkilat, ordu, toprak, hukuk, "
         "vergiler ve dönemlerdedir.")

NOT = ("<b>Not:</b> <b>İlkler</b> tabloları ve <b>Kritik Kural</b> notları doğrudan "
       "soru çıkar. Sayfa sonundaki <b>En Kritik Ezber Listesi</b> tekrar için ayrılmıştır.")


# ── 1. İslamiyet Öncesi Türk Tarihi ─────────────────────────────────────────
B1 = {
    "no": "1", "ad": "İslamiyet Öncesi Türk Tarihi", "etiket": "Türk destan çağı",
    "giris": ("Türk devlet düzeni, yazıya geç gelen topluluklarda <b>ordu-millet</b> "
              "mantığıyla kurulmuştur. Karar hanın, yönetim boyların elindedir."),
    "bloklar": [
        {"ad": "Devlet Teşkilatı",
         "maddeler": [
             {"t": "Kut inancı",
              "d": "Gök Tanrı'nın hükümdara verdiği kutsal yetki inancıdır; han ve "
                   "kağanların iktidarı bu inanca dayanır."},
             {"t": "Kağan–Hatun",
              "d": "En yüksek makam kağan (han), onun eşi hatundur. Türk devletlerinde "
                   "hükümdar ve eşi birlikte anılır.",
              "n": [{"tur": "Pratik Yol", "d": "«Han–hatun» ikilisi görüldüğünde bu ikisinin "
                                                "üst makam olduğunu hatırla."}]},
             {"t": "Toy (Kurultay)",
              "d": "Boyların bir araya gelip karar aldığı danışma ve seçim toplantısıdır."},
             {"t": "Tigin",
              "d": "Prenslik; hükümdarın oğullarına verilen yüksek makam.",
              "n": [{"tur": "Pratik Yol", "d": "«Tigin» gördüğünde prenslik / şehzade düşün."}]},
             {"t": "Yabgu ve Şad",
              "d": "Taşradaki yönetici makamlardır; eyalet yönetiminde görev alırlar."},
             {"t": "Ordu–Millet sistemi",
              "d": "Ordu birliğiyle millet birliğinin örtüştüğü düzendir; boy yönetimi "
                   "askerî organizasyonla iç içedir."},
         ]},
        {"ad": "Sosyal Hayat",
         "maddeler": [
             {"t": "Boy düzeni",
              "d": "Topluluk boylar hâlinde örgütlenir; yönetim ve ordu boy yapısına dayanır."},
             {"t": "Yurt (çadır)",
              "d": "Göçebe yaşamın temel yerleşim birimi çadırdır; «yurt» aynı zamanda "
                   "ülke anlamına gelir."},
             {"t": "Kadınların etkin rolü",
              "d": "Kadınlar topluluk yaşamında etkin bir rol üstlenir; han–hatun düzeni "
                   "bunun göstergesidir."},
         ]},
        {"ad": "Din",
         "maddeler": [
             {"t": "Gök Tanrı inancı",
              "d": "En eski inanç biçimi; yukarıda Tanrı, aşağıda kara anlayışıdır."},
             {"t": "Atalar kültü",
              "d": "Ataya saygı ve atadan güç alma inancıdır."},
             {"t": "Doğa kültleri",
              "d": "Güneş, gök, dağ ve su gibi doğa unsurlarına yönelik inançlardır."},
             {"t": "Kam / Şaman",
              "d": "Sihirli ve dinî törenleri yürüten kişidir."},
         ]},
        {"ad": "Hukuk",
         "maddeler": [
             {"t": "Töre",
              "d": "Yazısız, sözlü gelenek hukukudur; kurallar töre ile belirlenir."},
         ]},
        {"ad": "Ekonomi",
         "maddeler": [
             {"t": "Hayvancılık", "d": "Temel geçim ve üretim dalıdır."},
             {"t": "İpek Yolu ticareti",
              "d": "Doğu–batı ticaret yolu üzerinden yürütülen ticarettir."},
             {"t": "Ganimet", "d": "Savaş ve akınlardan elde edilen maldır."},
         ]},
        {"ad": "Dil–Edebiyat",
         "maddeler": [
             {"t": "Orhun Yazıtları (732–735)",
              "d": "Türklerin ilk yazılı belgeleridir.",
              "n": [{"tur": "Kritik Kural", "d": "«İlk yazılı belge» dendiğinde Orhun "
                                                "Yazıtları gelir."}]},
         ]},
        {"ad": "İlkler",
         "tablo": {
             "basliklar": ["İlk", "Cevap"],
             "satirlar": [
                 ["İlk yazılı belgeler", "Orhun Yazıtları"],
                 ["Yerleşik hayata geçen ve matbaa kullanan Türkler", "Uygurlar"],
                 ["İlk teşkilatlanma", "Asya Hun (Mete Han)"],
             ],
         }},
    ],
}


# ── 2. Türk-İslam Devletleri ────────────────────────────────────────────────
B2 = {
    "no": "2", "ad": "Türk-İslam Devletleri", "etiket": "2 konu",
    "giris": "İlk Müslüman Türk devletinden sonra sıralama ve iki Selçuklu devletinin "
             "karşılaştırması bu bölümün çekirdeğidir.",
    "bloklar": [
        {"ad": "İlk Müslüman Türk Devleti",
         "maddeler": [
             {"t": "Karahanlılar",
              "d": "İlk Müslüman Türk devletidir; hükümdarı Satuk Buğra Han'dır.",
              "n": [{"tur": "Kritik Kural", "d": "«İlk Müslüman Türk devleti» dendiğinde "
                                                "Karahanlılar ve Satuk Buğra Han gelir."}]},
         ]},
        {"ad": "Devletler Sırası",
         "maddeler": [
             {"t": "Karahanlılar → Gazneliler → Selçuklular → Eyyubiler → Memlükler",
              "d": "Türk-İslam devletlerinin doğuş sırasıdır."},
         ]},
        {"ad": "Büyük Selçuklu × Anadolu Selçuklu",
         "giris": "İki Selçuklu devleti arasındaki farklar sınavda en sık karşılaştırılan konudur.",
         "tablo": {
             "basliklar": ["Özellik", "Büyük Selçuklu", "Anadolu Selçuklu"],
             "satirlar": [
                 ["Merkezî Otorite", "Melik ve atabeylere geniş yetki var",
                  "Atabeylere geniş yetki yok"],
                 ["Divan", "Arz, tuğra, istifa, işraf, saltanat",
                  "Pervane divanı (ikta) + niyabet-i saltanat (naib)"],
                 ["Ordu", "Donanma yok",
                  "Donanma var (emirü'l-sevahil, reisü'l-bahr)"],
                 ["Unvan", "Klasik — Gıyaseddin, Rükneddin, Keykavus… (İran-Fars etkisi)",
                  "Klasik"],
                 ["Dil", "Farsça", "Farsça"],
                 ["Medrese", "Nizamiye medreseleri var",
                  "Nizamiye yok — Koca Hasan Paşa Medresesi var"],
                 ["Sınır", "Uç beyliği yok", "Uç beyliği var"],
             ],
         }},
    ],
}


# ── 3. Osmanlı Devlet Teşkilatı ─────────────────────────────────────────────
B3 = {
    "no": "3", "ad": "Osmanlı Devlet Teşkilatı", "etiket": "3 sınıf",
    "giris": "Bürokrasinin <b>divan üyeliği</b> ile <b>divan dışı görev</b> ayrımı "
             "sınavda en sık sorulan noktadır.",
    "bloklar": [
        {"ad": "Üç Sınıf",
         "maddeler": [
             {"t": "Seyfiye (Askerî bürokrasi)",
              "d": "Divan: sadrazam, vezirler, Yeniçeri ağası, kaptan-ı derya. "
                   "Divan dışı: beylerbeyi, sancakbeyi, tımarlı sipahi."},
             {"t": "İlmiye (Din–Hukuk–Eğitim)",
              "d": "Divan: şeyhülislam, kazasker. Divan dışı: kadı, müderris, imam, "
                   "müezzin, seyyid-şerif, nakibüleşraf."},
             {"t": "Kalemiye (Sivil bürokrasi)",
              "d": "Divan: nişancı, reisülküttap, defterdar. Divan dışı: saderet "
                   "kethüdası, memurlar, katipler."},
         ],
         "notlar": [{"tur": "Pratik Yol",
                     "d": "Üç sınıfın ortak özelliği <b>bürokrasi</b>dir; ayrım, görevin "
                          "niteliğindedir: askerî, dinî–eğitimsel, sivil."}]},
        {"ad": "Erkan-ı Erbaa (Toplumun 4 Unsuru)",
         "maddeler": [
             {"t": "Ümera", "d": "Asker — Seyfiye"},
             {"t": "Ulema", "d": "Din–bilim — İlmiye"},
             {"t": "Esnaf–Zanaatkâr", "d": "Ehli hiref"},
             {"t": "Köylü–Ziraat", "d": "Tarım ve üretim"},
         ],
         "notlar": [{"tur": "Pratik Yol",
                     "d": "Erkan-ı erbaa <b>toplumun</b> dört unsurudur; üç sınıf <b>devletin</b> "
                          "bürokrasisidir. İkisini karıştırma."}]},
    ],
}


# ── 4. Osmanlı Kara Ordusu ──────────────────────────────────────────────────
B4 = {
    "no": "4", "ad": "Osmanlı Kara Ordusu", "etiket": "3 kol",
    "giris": "Ordu üçe ayrılır: <b>merkez</b> (Kapıkulu), <b>taşra</b> (tımarlı sipahi) "
             "ve <b>yardımcı kuvvetler</b>.",
    "bloklar": [
        {"ad": "A) Merkez Ordusu = Kapıkulu",
         "maddeler": [
             {"t": "Köken ve yerleşim",
              "d": "Devşirme kökenlidir; başkentte yaşarlar."},
             {"t": "Ücret",
              "d": "Ulufe (3 ayda bir maaş) + cülus bahşişi + sefer bahşişi."},
             {"t": "I. Murat",
              "d": "Pencik sistemini kurdu; savaşta esir çocuklar toplandı.",
              "n": [{"tur": "Kritik Kural", "d": "Kapıkulu'yu kuran <b>I. Murat</b>'tır (pencik). "
                                                "Devşirmeye dönüştüren <b>II. Murat</b>'tır."}]},
             {"t": "II. Murat",
              "d": "Pencik sistemini devşirme sistemine dönüştürdü."},
             {"t": "Acemioğlan Ocağı",
              "d": "Buradan çıkanlar «çıkma» (mezuniyet) ile üç sınıfa dağıtılır."},
             {"t": "Amaç",
              "d": "Merkezî otoriteyi güçlendirmek; asker, memur ve sanatkâr ihtiyacını karşılamak."},
         ]},
        {"ad": "B) Taşra Ordusu = Tımarlı Sipahiler",
         "maddeler": [
             {"t": "Köken ve yerleşim", "d": "Türkmen kökenlidir; taşrada yaşarlar."},
             {"t": "Ücret", "d": "Maaş yerine dirlik (iktâ) alırlar."},
             {"t": "Cebelü",
              "d": "Aldıkları dirlik nedeniyle bu adı alırlar.",
              "n": [{"tur": "Kritik Kural", "d": "Taşra ordusunun karşılığı <b>cebelü</b>dür."}]},
             {"t": "Büyüklük", "d": "Ordunun en kalabalık grubudur."},
             {"t": "Komuta", "d": "Beylerbeyi ve sancakbeyi komutasında savaşırlar."},
         ]},
        {"ad": "C) Yardımcı Kuvvetler",
         "giris": "Özel görevli yardımcı birliklerdir.",
         "maddeler": [
             {"t": "Akıncılar",
              "d": "İstihbarat görevi görür.",
              "n": [{"tur": "Pratik Yol", "d": "Akıncı = istihbarat; ordunun «gözü»dür."}]},
             {"t": "Azaplar, Sakalar, Turnalar, Müsellemler (Orhan Bey), Baltacılar, "
                   "Deliler, Voynuklar, Martaloslar, Cerehorlar",
              "d": "Yardımcı kuvvet birlikleridir."},
         ]},
    ],
}


# ── 5. Tımar Sisteminin Faydaları ───────────────────────────────────────────
B5 = {
    "no": "5", "ad": "Tımar Sisteminin Faydaları", "etiket": "11 madde",
    "giris": "Tımar sisteminin faydaları soru çıkar; hepsini kelime kelime bil.",
    "bloklar": [
        {"ad": "Faydalar",
         "maddeler": [
             {"t": "Üretimde süreklilik", "d": "Üretimde süreklilik sağlanır."},
             {"t": "Piyasada ürün bolluğu",
              "d": "Piyasada ürün bol olur, fiyatlar ucuzlar."},
             {"t": "Alım gücü", "d": "Halkın alım gücü artar."},
             {"t": "Bağlılık", "d": "Halkın devlete bağlılığı artar."},
             {"t": "Devletin yükü azalır",
              "d": "Devlet vergi toplama ve maaş dağıtma işinden kurtulur."},
             {"t": "Kalan vergiler yerinde toplanır",
              "d": "Kalan vergiler yerinde rahat toplanır."},
             {"t": "Hazineden para çıkmadan ordu",
              "d": "Hazineden para çıkmadan hazır ordu oluşturulur."},
             {"t": "Para yerine geçer", "d": "Dirlik para yerine geçer."},
             {"t": "Güvenlik",
              "d": "Askerin bulunduğu bölgenin güvenliği sağlanır."},
             {"t": "Merkezî otorite", "d": "Merkezî otorite güçlenir."},
             {"t": "Bayındırlık",
              "d": "Bölgenin bayındırlık hizmetleri yerinde görülür."},
         ]},
    ],
}


# ── 6. Toprak Sistemi ───────────────────────────────────────────────────────
B6 = {
    "no": "6", "ad": "Toprak Sistemi", "etiket": "mülk / miri",
    "giris": "Topraklar <b>özel mülkiyet</b> (mülk) veya <b>devlet mülkiyeti</b> "
             "(miri) olmak üzere ikiye ayrılır.",
    "bloklar": [
        {"ad": "A) Mülk Toprak (Özel mülkiyet)",
         "maddeler": [
             {"t": "Öşriye",
              "d": "Müslümanların özel mülküdür → vergisi <b>Çift Resmi</b>'dir.",
              "n": [{"tur": "Kritik Kural", "d": "Öşriye = Müslüman = Çift Resmi. "
                                                "Haraciye = Gayrimüslim = İspenç."}]},
             {"t": "Haraciye",
              "d": "Gayrimüslimlerin özel mülküdür → vergisi <b>İspenç</b>'tir."},
         ]},
        {"ad": "B) Miri Toprak",
         "maddeler": [
             {"t": "Tanım",
              "d": "Mülkiyeti devlete aittir, işletme hakkı halka verilir."},
             {"t": "Vergi gelirleri", "d": "Farklı hizmet alanlarına ayrılır."},
             {"t": "Vakıf", "d": "Geliri sosyal müesseselere aktarılır."},
         ]},
        {"ad": "Vakıf Terimleri",
         "tablo": {
             "basliklar": ["Terim", "Karşılığı"],
             "satirlar": [
                 ["Yönetici", "Mütevelli"],
                 ["Vakfedilen mal", "Mevkuf"],
                 ["Kuruluş belgesi", "Vakfiye"],
             ],
         },
         "notlar": [{"tur": "Pratik Yol",
                     "d": "Vakıfların örnekleri: cami, medrese, köprü, külliye, han."}]},
    ],
}


# ── 7. Devlet Gelirleri (Dirlik Türleri) ────────────────────────────────────
B7 = {
    "no": "7", "ad": "Devlet Gelirleri", "etiket": "dirlik türleri",
    "giris": "Dirlikler, devlet gelirlerini toplayan kişilere verilen görevdir.",
    "bloklar": [
        {"ad": "Dirlik Türleri",
         "maddeler": [
             {"t": "Ocaklık",
              "d": "Kale muhafızı (dizdar–candar) ve tersanelere verilir."},
             {"t": "Yurtluk", "d": "Sınır boylarındaki güçlü ailelere verilir."},
             {"t": "Paşmaklık", "d": "Saray kadınlarına verilir."},
             {"t": "Malikâne", "d": "Üstün hizmet gösterenlere verilir."},
             {"t": "Arpalık", "d": "Emekli memura verilir."},
             {"t": "Mevat", "d": "Taşlık ve bataklık arazilere verilir."},
             {"t": "Metruk", "d": "Pazar yeri, harman yeri, köy meydanı gibi yerlere verilir."},
         ],
         "notlar": [{"tur": "Pratik Yol",
                     "d": "Kullanım alanları: askerlik–güvenlik, denizcilik (tersaneler), saray, "
                          "halkın refahı, tarım ve üretim."}]},
    ],
}


# ── 8. Osmanlı Hukuk Sistemi ────────────────────────────────────────────────
B8 = {
    "no": "8", "ad": "Osmanlı Hukuk Sistemi", "etiket": "5 dal",
    "giris": "Osmanlı'da hukuk tek kaynaklı değildir; farklı dönemlerde farklı hukuk "
             "kolları uygulanmıştır.",
    "bloklar": [
        {"ad": "Örfi Hukuk",
         "maddeler": [
             {"t": "Tanım", "d": "Türk geleneklerinden doğan hukuktur."},
             {"t": "Belgeler", "d": "Ferman, berat, adaletname, amanname."},
             {"t": "Kanunname",
              "d": "Kanonik derlemedir.",
              "n": [{"tur": "Kritik Kural", "d": "<b>Fatih → Kanunname-i Ali</b>, "
                                                "<b>Kanuni → Kanun-i Kadim</b>."}]},
         ]},
        {"ad": "Şer'î Hukuk",
         "maddeler": [{"t": "Tanım", "d": "İslam hukukudur."}]},
        {"ad": "Cemaat (Azınlık) Hukuku",
         "maddeler": [
             {"t": "Tanım",
              "d": "Gayrimüslimlerin kendi dinî hukuklarıdır (İstimalet politikası)."},
             {"t": "Sonuç", "d": "1926'da kalktı."},
         ]},
        {"ad": "Yabancı Hukuku",
         "maddeler": [{"t": "Kaynak", "d": "Kapitülasyonlar sonucu ortaya çıkmıştır."}]},
        {"ad": "Batı Tarzı Hukuk",
         "maddeler": [{"t": "Kaynak", "d": "Tanzimat sonrası Avrupa'dan alınmıştır."}]},
    ],
}


# ── 9. Sosyal Hayat ─────────────────────────────────────────────────────────
B9 = {
    "no": "9", "ad": "Sosyal Hayat", "etiket": "reaya / zimmi",
    "giris": "",
    "bloklar": [
        {"ad": "Halkın Ayrımı",
         "maddeler": [
             {"t": "Yönetilen halk", "d": "Reaya (Teba) denir."},
             {"t": "Gayrimüslimler", "d": "Zimmî denir."},
         ]},
        {"ad": "Millet Sistemi",
         "maddeler": [
             {"t": "Esas", "d": "İnanç–din esasına göre oluşur.",
              "n": [{"tur": "Kritik Kural", "d": "Millet sistemi <b>inanca göre</b> oluşur, "
                                                "coğrafyaya göre değil."}]},
         ]},
        {"ad": "Vergi Veren Gruplar",
         "maddeler": [
             {"t": "Çiftçiler, zanaatkârlar, tüccarlar, göçebeler",
              "d": "Vergi veren gruplardır."},
         ]},
    ],
}


# ── 10. Yatay ve Dikey Hareketlilik ─────────────────────────────────────────
B10 = {
    "no": "10", "ad": "Yatay ve Dikey Hareketlilik", "etiket": "2 eksen",
    "giris": "",
    "bloklar": [
        {"ad": "Yatay Hareketlilik (Yer değiştirme)",
         "maddeler": [
             {"t": "Kuruluş–Yükselme",
              "d": "Anadolu'dan Balkanlar'a iskân politikası."},
             {"t": "Duraklama",
              "d": "Celali isyanları → Büyük Kaçgun (köyden kente göç)."},
             {"t": "Gerileme–Dağılma",
              "d": "Toprak kayıpları sonucu Anadolu'ya geri dönüş."},
         ]},
        {"ad": "Dikey Hareketlilik (Yükselme)",
         "maddeler": [
             {"t": "Nasıl olur",
              "d": "Bilgi ve liyakatle en üst makamlara çıkılabilir (devşirme + medrese)."},
         ]},
        {"ad": "Sosyal Tabakalaşmanın Oluşmama Sebepleri",
         "maddeler": [
             {"t": "a) Veraset sistemi", "d": "Mülk babadan oğula geçer."},
             {"t": "b) Toprakların miri olması", "d": "Toprak mülkiyeti devlete aittir."},
             {"t": "c) İslamiyet'in eşitlik ilkesi",
              "d": "Müslümanlar arasında ayrım gözetilmez."},
             {"t": "d) Göçebe kültür özellikleri",
              "d": "Göçebe yaşam tabakalaşmayı sınırlar."},
         ]},
    ],
}


# ── 11. Osmanlı'da Ekonomik Modeller ────────────────────────────────────────
B11 = {
    "no": "11", "ad": "Ekonomik Modeller", "etiket": "3 model",
    "giris": "Osmanlı ekonomisinin üç farklı yaklaşımı vardır.",
    "bloklar": [
        {"ad": "İasecilik",
         "maddeler": [{"t": "Amaç",
                       "d": "Temel ihtiyaçların bol ve kaliteli temini, fiyat istikrarı ve "
                           "halkın memnuniyetidir."}]},
        {"ad": "Gelenekçilik",
         "maddeler": [{"t": "Amaç",
                       "d": "Piyasa dengesini korumak ve gerekli tedbirleri almaktır."}]},
        {"ad": "Fiskalizm",
         "maddeler": [{"t": "Amaç",
                       "d": "Hazine gelirini maksimum, gideri minimum tutmaktır; güçlü hazine "
                           "ve devlet hedeflenir."}]},
    ],
}


# ── 12. Osmanlı Vergi Sistemi ───────────────────────────────────────────────
B12 = {
    "no": "12", "ad": "Osmanlı Vergi Sistemi", "etiket": "şer'î / örfi",
    "giris": "Vergiler <b>şer'î</b> ve <b>örfi</b> olmak üzere ikiye ayrılır.",
    "bloklar": [
        {"ad": "Şer'î Vergiler",
         "maddeler": [
             {"t": "Öşür", "d": "Müslümanlardan <b>1/10</b> ürün vergisi."},
             {"t": "Haraç", "d": "Gayrimüslimlerden <b>1/5</b> ürün vergisi."},
             {"t": "Cizye",
              "d": "Gayrimüslim erkeklerden, askere gitmedikleri için alınan kelle vergisidir.",
              "n": [{"tur": "Kritik Kural", "d": "Öşür = 1/10, Haraç = 1/5."}]},
         ]},
        {"ad": "Örfi Vergiler",
         "maddeler": [
             {"t": "Bennak (evlilik), mücerred (bekârlık), resm-i arus (evlenme)",
              "d": "Evlilik ve bekârlıkla ilgili vergilerdir."},
             {"t": "Avarız",
              "d": "Olağanüstü durumlarda alınan vergidir; <b>II. Bayezid</b> sürekli hale "
                   "getirdi.",
              "n": [{"tur": "Kritik Kural", "d": "Avarız olağanüstü vergidir; sürekli hale "
                                                "getiren <b>II. Bayezid</b>'dir."}]},
             {"t": "Cerime, amediye, reftiye",
              "d": "Sırasıyla suçlulardan, ithalat ve ihracattan alınır."},
             {"t": "İmdad-ı seferiyye, imdad-ı cihadiye",
              "d": "Savaş ve sefer için toplanan vergilerdir."},
         ]},
        {"ad": "Müsadere",
         "maddeler": [
             {"t": "Tanım",
              "d": "Cezalandırılan kişilerin malının hazineye aktarılmasıdır."},
             {"t": "Amaç",
              "d": "Hazine ihtiyacını karşılamak, alternatif zengin sülalelerin oluşmasını "
                  "engellemek ve haksız kazançların önüne geçmek."},
         ],
         "notlar": [{"tur": "Kritik Kural",
                     "d": "Müsadere, özel mülkiyetin güvende olmadığını gösterir."}]},
    ],
}


# ── 13. Osmanlı'da Sanat Dalları ────────────────────────────────────────────
B13 = {
    "no": "13", "ad": "Osmanlı'da Sanat Dalları", "etiket": "7 dal",
    "giris": "",
    "bloklar": [
        {"ad": "Müzik",
         "maddeler": [{"t": "İsimler",
                       "d": "Itrî, Hacı Arif Bey, Dede Efendi, Tamburi Cemil Bey, "
                           "III. Selim (Suzi Dilara makamı)."}]},
        {"ad": "Çini",
         "maddeler": [{"t": "Merkezler", "d": "İznik, Kütahya, İstanbul."}]},
        {"ad": "Resim",
         "maddeler": [{"t": "İsimler",
                       "d": "İlk resmi yaptıran II. Mehmet (Gentile Bellini), II. Mahmud, "
                           "Şeker Ahmed Paşa, Osman Hamdi Bey (Sanayi-i Nefise Mektebi)."}]},
        {"ad": "Hat",
         "maddeler": [{"t": "İsimler", "d": "Şeyh Hamdullah — hattatların kıblegâhı."}]},
        {"ad": "Tezhip",
         "maddeler": [{"t": "İsimler", "d": "Müzehhip — kitap süsleme.",
                       "n": [{"tur": "Kritik Kural", "d": "Kitap süsleme = <b>müzehhip</b>."}]}]},
        {"ad": "Ebru",
         "maddeler": [{"t": "İsimler", "d": "Çiçek Bulutu."}]},
        {"ad": "Vitray ve Çeşm-i Bülbül",
         "maddeler": [{"t": "Alan", "d": "Cam sanatı."}]},
    ],
}


# ── 14. Osmanlı Dönemleri ───────────────────────────────────────────────────
B14 = {
    "no": "14", "ad": "Osmanlı Dönemleri", "etiket": "5 evre",
    "giris": "",
    "bloklar": [
        {"ad": "Kuruluş → Yükselme → Duraklama → Gerileme → Dağılma",
         "maddeler": [
             {"t": "Kuruluş (1299)",
              "d": "Osman Gazi liderliğinde Söğüt ve çevresinde beylik olarak kuruldu."},
             {"t": "Yükselme",
              "d": "Beylikten cihan devletine yükseliş, fetihler ve güçlü yönetim."},
             {"t": "Duraklama",
              "d": "17. yy'dan itibaren ilerleme yavaşladı → <b>Karlofça 1699</b> "
                   "(ilk toprak kaybı)."},
             {"t": "Gerileme",
              "d": "Siyasi, ekonomik, askerî sorunlar → <b>Küçük Kaynarca 1774</b> "
                   "(en ağır antlaşma)."},
             {"t": "Dağılma",
              "d": "I. Dünya Savaşı sonrası toprak kayıpları hızlandı, 1922'de sona erdi."},
         ]},
        {"ad": "Yeni Yönetim Birimleri (Dağılma Dönemi)",
         "maddeler": [
             {"t": "Sıralama",
              "d": "Eyalet → Sancak (il) → Kaza (ilçe) → Karye (köy)."},
         ],
         "notlar": [{"tur": "Pratik Yol",
                     "d": "<b>1864 Vilayet Nizamnamesi</b> ile mutasarrıflık ve liva, "
                          "<b>1871</b>'de nahiye kuruldu."}]},
    ],
}


# ── 15. Balkan Savaşları ────────────────────────────────────────────────────
B15 = {
    "no": "15", "ad": "Balkan Savaşları", "etiket": "1912–1913",
    "giris": "",
    "bloklar": [
        {"ad": "I. Balkan Savaşı (1912)",
         "maddeler": [
             {"t": "Taraflar",
              "d": "Karadağ (ilk saldıran), Yunanistan, Sırbistan, Bulgaristan."},
             {"t": "Sonuç",
              "d": "Osmanlı Balkan topraklarının büyük kısmını kaybetti."},
         ]},
        {"ad": "II. Balkan Savaşı (1913)",
         "maddeler": [
             {"t": "Taraflar", "d": "Balkan devletleri kendi aralarında savaştı."},
             {"t": "Sonuç", "d": "Osmanlı Edirne ve Kırklareli'ni geri aldı."},
         ]},
    ],
}


# ── En Kritik Ezber Listesi ─────────────────────────────────────────────────
EZBER = {
    "no": "★", "ad": "En Kritik Ezber Listesi", "etiket": "tekrar",
    "giris": "Bu liste özetin tamamından çıkan, en sık sorulan on kalemdir. "
             "Sınava önce bunları bitir.",
    "bloklar": [
        {"ad": "On Kalem",
         "tablo": {
             "basliklar": ["Sorulan", "Cevap"],
             "satirlar": [
                 ["İlk Osmanlı Devleti", "1299"],
                 ["İlk toprak kaybı", "Karlofça 1699"],
                 ["En ağır antlaşma", "Küçük Kaynarca 1774"],
                 ["Kapıkulu'nu kuran", "I. Murat (pencik)"],
                 ["Devşirme'ye dönüştüren", "II. Murat"],
                 ["Taşra ordusu", "Cebelü"],
                 ["Kitap süsleme", "Müzehhip"],
                 ["Millet sistemi", "İnanca göre"],
                 ["Müsadere", "Özel mülkiyet güvende değildir"],
                 ["Avarız",
                  "Olağanüstü vergi — II. Bayezid sürekli hale getirdi"],
             ],
         }},
    ],
}


VERI = {
    "key": "tarih",
    "baslik": "KPSS Orta Öğretim",
    "ders_adi": DERS_ADI,
    "aciklama": ACIKLAMA,
    "lead": LEAD,
    "giris": GIRIS,
    "not": NOT,
    "vurgu": VURGU,
    "bolumler": [B1, B2, B3, B4, B5, B6, B7, B8, B9, B10, B11, B12, B13, B14, B15, EZBER],
}