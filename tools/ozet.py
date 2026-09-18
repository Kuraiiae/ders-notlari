# -*- coding: utf-8 -*-
"""KPSS Türkçe konu özetlerinin tek kaynağı.

Bu dosya veriyi tutar ve iki yere uygular:
  1) turkce-ozet.html -> bağımsız çalışma sayfası (yazdırılabilir)
  2) oku.html -> <!-- OZET-DATA-BEGIN --> ... <!-- OZET-DATA-END --> arasına gömülen
     JSON; Kitap Modu'ndaki "Özet" çekmecesi (Ö) ve sayfa başı kartı bu veriyi kullanır.

Özet metnini değiştirmek için yalnızca bu dosyayı düzenleyip çalıştırın:

    python tools/ozet.py

Ardından: python tools/check.py
"""
import html as H
import json
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OKU = os.path.join(ROOT, "oku.html")
PAGE = os.path.join(ROOT, "turkce-ozet.html")
BEGIN = "<!-- OZET-DATA-BEGIN -->"
END = "<!-- OZET-DATA-END -->"

BASLIK = "KPSS Orta Öğretim"
GIRIS = ("ÖSYM'nin son yıllardaki soru dağılımlarına bakıldığında KPSS Türkçe oturumu "
         "<b>7 adet dil bilgisi sorusu</b> ve geri kalanı <b>anlam/paragraf</b> soruları "
         "üzerine kuruludur.")
NOT = ("<b>Not:</b> Fiilde çatı, anlatım bozukluğu ve cümle türleri uzun süredir ÖSYM "
       "tarafından sorulmamaktadır.")
VURGU = ["Ses Bilgisi", "Yazım Kuralları", "Noktalama İşaretleri", "Sözcükte Yapı",
         "Sözcük Türleri", "Fiilimsiler"]
BOLUM1_GIRIS = ("Dil bilgisi soruları temel olarak şu altı başlıktan gelmektedir: "
                "<b>Ses Bilgisi, Yazım Kuralları, Noktalama İşaretleri, Sözcükte Yapı, "
                "Sözcük Türleri</b> (Sıfat, Zarf, Zamir, Edat/Bağlaç) ve <b>Fiilimsiler</b>.")

SES_BLOK = {
    "ad": "Ses Bilgisi",
    "maddeler": [
        {"t": "Ünlü Düşmesi",
         "d": "Sözcüğe ek geldiğinde ya da sözcük türerken ünlünün düşmesidir "
              "(şehir &gt; şehri, burun &gt; burnu, omuz &gt; omzu, beniz &gt; benziyor, "
              "ileri &gt; ilerliyor).",
         "n": [{"tur": "Dipnot",
                "d": "Ek eylem olan <b>idi, imiş, ise</b> eklerinin başındaki <b>i</b> harfinin "
                     "düşmesi (büyüğü idi &gt; büyüdü) ünlü düşmesi olarak kabul edilir."}]},
        {"t": "Ünlü Daralması",
         "d": "Temelde <b>-yor</b> ekiyle yapılır.",
         "n": [{"tur": "Pratik Yol",
                "d": "<b>-yor</b> ekini atıp yerine <b>-mek/-mak</b> getirin ya da eylemin kökünün "
                     "ünlüyle bitip bitmediğine bakın. Kök ünlüyle bitiyorsa daralma vardır "
                     "(bekliyor &gt; bekle), ünsüzle bitiyorsa daralma yoktur (geliyor &gt; gel)."}]},
        {"t": "Ünsüz Yumuşaması (Değişimi)",
         "d": "Sert ünsüzlerin (p, ç, t, k) ek aldığında yumuşak ünsüzlere (b, c, d, g, ğ) "
              "dönüşmesidir (dolap &gt; dolabı, renk &gt; rengi).",
         "n": [{"tur": "Önemli Detay",
                "d": "<b>Sosyolog, psikolog, diyalog</b> gibi sözcüklerde son harf olan <b>g</b> "
                     "yumuşak g'ye dönüşmez; dolayısıyla bu sözcüklerde yumuşama yoktur."}]},
        {"t": "Ünsüz Benzeşmesi (Sertleşmesi)",
         "d": "<b>Fıstıkçı Şahap</b> (f, ç, s, t, k, ş, h) ile başlayan bir ekin bu harflerle biten "
              "bir sözcüğe gelmesiyle oluşur.",
         "n": [{"tur": "Pratik Yol",
                "d": "Yan yana gelen iki ünsüzün ikisi de fıstıkçı şahap harflerindense benzeşme "
                     "vardır (çiçekçi, seçkin)."}]},
        {"t": "Ünsüz Türemesi",
         "d": "Aynı harflerin yan yana gelmesidir (hissetti, zannetti).",
         "n": [{"tur": "İstisna",
                "d": "<b>t</b> harflerinin yan yana gelmesi türeme değil, ünsüz benzeşmesidir "
                     "(git-ti)."}]},
        {"t": "Ünsüz Düşmesi",
         "d": "Genellikle <b>-cik/-cük</b> ekini alan sözcüklerde <b>k</b> harfinin düşmesidir "
              "(minik &gt; minicik, sıcak &gt; sıcacık)."},
    ],
    "notlar": [{"tur": "Kritik Kural",
                "d": "Türkçe bir sözcüğe ek gelmediği sürece (kök halindeyse) o sözcükte ses olayı "
                     "aranmaz: <b>nokta, kuvvet, millet</b>."}],
}

YAZIM_BLOKLAR = [{
    "ad": "Yazım Kuralları",
    "maddeler": [
        {"t": "Unvan ve Lakaplar",
         "d": "Unvanlar, makam adları ve saygı bildiren sözcükler daima büyük yazılır (Vali Bey, "
              "Cumhurbaşkanı, Doktor Ahmet). Akrabalık adları lakap haline gelmişse büyük "
              "(Ramiz Dayı), akrabalık bildiriyorsa küçük yazılır."},
        {"t": "Kesme İşareti",
         "d": "Bir sözcükte <b>yapım eki</b> varsa (Türkçe), asla kesme işareti konulmaz."},
        {"t": "Coğrafi Terimler ve Varlıklar",
         "d": "Özel ada dahil olan tür adları büyük yazılır (Van Gölü, Ağrı Dağı). Özel ada dahil "
              "olmayıp cins isim olarak kullanılanlar küçük yazılır (Van kedisi, antep baklavası). "
              "Taşınabilen tür adları küçük, coğrafi yapılar (göl, nehir, ova) büyük yazılır."},
        {"t": "Birli Kelimeler",
         "d": "<b>Birkaç, biraz, hiçbir, birçok</b> bitişik yazılır."},
        {"t": "Alt ve Üst Sözcükleri",
         "d": "Somut olarak yer bildiriyorsa ayrı (toprak altı, su altı), soyut ve kalıcı bir durumu "
              "bildiriyorsa bitişik yazılır (suçüstü, akşamüstü)."},
        {"t": "İkilemeler",
         "d": "Daima ayrı yazılır. Tek istisnası <b>gitgide</b> sözcüğünün bitişik olmasıdır."},
        {"t": "Birleşik Fiiller",
         "d": "İkinci kelimesi anlamını kaybedenler bitişik yazılır (birdenbire, zannetti, "
              "sabretti). Ses olayı (türeme veya düşme) olan yardımcı eylemler bitişik yazılır "
              "(hissetti), olmayanlar ayrı yazılır (fark etti, terk etti)."},
    ],
    "notlar": [],
}]

NOK_BLOKLAR = [
    {
        "ad": "Virgülün Kullanılmadığı Yerler",
        "giris": "<b>Soru potansiyeli yüksek.</b> Şu dört yerde virgül gelmez:",
        "maddeler": [
            {"t": "Şart eki (-se/-sa)",
             "d": "Cümlede şart eki varsa ardına virgül gelmez."},
            {"t": "Tek zarf-fiil eki",
             "d": "Tek bir zarf-fiil ekinden sonra virgül gelmez."},
            {"t": "İsim ve sıfat tamlaması",
             "d": "İsim ve sıfat tamlamalarının arasına virgül gelmez."},
            {"t": "Bağlaçlar",
             "d": "Bağlaçların (ve, veya, hem... hem..., ne... ne...) önüne veya arkasına virgül "
                  "gelmez."},
        ],
        "notlar": [],
    },
    {
        "ad": "Noktalı Virgül ve İki Nokta Ayrımı",
        "maddeler": [
            {"t": "Yüklem testi",
             "d": "Boşluğa kadar olan yerde yüklem yoksa (cümlenin içi) adaylar virgül veya noktalı "
                  "virgül; yüklem varsa (cümlenin sonu) adaylar nokta veya iki noktadır."},
            {"t": "Tercih kuralı",
             "d": "Cümlede virgül yoksa virgül, virgül varsa noktalı virgül tercih edilir."},
            {"t": "İki nokta",
             "d": "Boşluktan sonra örnekleme veya açıklama yapılıyorsa iki nokta (:) kullanılır."},
        ],
        "notlar": [],
    },
]

YAPI_BLOKLAR = [{
    "ad": "Sözcükte Yapı ve Ekler",
    "maddeler": [
        {"t": "Kök",
         "d": "Sözcüğün anlamlı en küçük kısmıdır. İsim kökü ve fiil kökü olarak ikiye ayrılır. Kök "
              "bulurken mekanik olarak <b>-mek/-mak</b> eki getirmek yanıltabilir; mutlaka cümledeki "
              "anlamına bakılmalıdır."},
        {"t": "Yapı Bakımından Sözcükler",
         "d": "Basit, türemiş ve birleşik olmak üzere üçe ayrılır."},
        {"t": "İyelik Ekleri ile Hâl Eklerinin Ayrımı",
         "d": "Belirtme hâl eki (-i) ile 3. tekil şahıs iyelik ekini ayırt etmek için sözcüğün başına "
              "<b>onun</b> getirilir. <b>Onun + sözcük</b> uyuyorsa iyelik ekidir; uymuyorsa belirtme "
              "hâl ekidir. Ayrıca isim tamlamalarındaki tamlayan eki (-in) varsa, tamlanandaki ek "
              "kesinlikle iyelik ekidir.",
         "n": [{"tur": "Test",
                "d": "<b>onun</b> kelimesini başa getir: \"onun kitabı\" uyuyor → iyelik; \"onun "
                     "kitab-ı\" uymuyor → belirtme hâl eki."}]},
    ],
    "notlar": [],
}]

TUR_BLOKLAR = [{
    "ad": "Sıfat (Ön Ad)",
    "giris": "İsimlerden önce gelerek onları niteleyen veya belirten sözcüklerdir. Sıfatın "
             "yanında mutlaka bir isim bulunur; isim kullanılmazsa sözcük adlaşır.",
    "maddeler": [
        {"t": "Niteleme Sıfatı",
         "d": "İsmin <b>nasıl olduğunu</b> bildirir; sorusu <b>nasıl?</b> → güzel ev, büyük "
              "bina, mavi gömlek, çalışkan öğrenci, uzun yol."},
        {"t": "İşaret Sıfatı",
         "d": "<b>bu, şu, o, öteki, beriki</b> ismi işaret ederek belirtir: bu kitap, şu ev, o "
              "çocuk, öteki öğrenci."},
        {"t": "Asıl Sayı Sıfatı", "d": "İsmin sayısını bildirir: iki kitap, beş öğrenci."},
        {"t": "Sıra Sayı Sıfatı", "d": "İsmin sırasını bildirir: ikinci kat, üçüncü sıra."},
        {"t": "Üleştirme Sayı Sıfatı",
         "d": "İsmin eşit olarak paylaştırıldığını bildirir: ikişer kalem, beşer kişi."},
        {"t": "Kesir Sayı Sıfatı",
         "d": "İsmi kesirli olarak belirtir: yarım ekmek, çeyrek altın."},
        {"t": "Belgisiz Sıfat",
         "d": "<b>bazı, birkaç, birçok, kimi, her, hiçbir, herhangi bir</b> ismi kesin olmayan "
              "miktarda veya belirsiz biçimde belirtir: bazı insanlar, birkaç kitap, her gün."},
        {"t": "Soru Sıfatı",
         "d": "<b>hangi, kaç, kaçıncı, nasıl</b> ismi soru yoluyla belirtir: hangi kitap?, kaç "
              "kişi?, kaçıncı sınıf?, nasıl bir ev?"},
    ],
    "notlar": [{"tur": "Kural",
                "d": "Belirtme sıfatları <b>işaret, sayı, belgisiz ve soru</b> olmak üzere dört "
                     "gruptur; sayı sıfatı da <b>asıl, sıra, üleştirme ve kesir</b> olarak "
                     "ayrılır."}],
}, {
    "ad": "Zamir (Adıl)",
    "giris": "İsmin yerini tutan sözcüklerdir. Temel ayrım: <b>sıfat ismin yanında bulunur, "
             "zamir ismin yerine geçer.</b>",
    "maddeler": [
        {"t": "Kişi Zamiri",
         "d": "<b>ben, sen, o, biz, siz, onlar</b> insan isimlerinin yerini tutar: \"Ahmet "
              "bugün gelmedi.\" → \"<b>O</b> bugün gelmedi.\""},
        {"t": "İşaret Zamiri",
         "d": "<b>bu, şu, o, bunlar, şunlar, onlar</b> varlıkların yerini işaret yoluyla tutar: "
              "\"Bu kalemi al.\" (sıfat) / \"<b>Bunu</b> al.\" (zamir)."},
        {"t": "Belgisiz Zamir",
         "d": "<b>biri, birisi, bazıları, kimisi, çoğu, hepsi, herkes, hiçbiri</b> ismin yerini "
              "belirsiz biçimde tutar: Bazıları geldi, hiçbiri gelmedi."},
        {"t": "Soru Zamiri",
         "d": "<b>kim, ne, hangisi, kaçı</b> ismin yerini soru yoluyla tutar: Kim geldi? "
              "Hangisini aldın?"},
        {"t": "İlgi Zamiri",
         "d": "<b>-ki</b> ekiyle yapılır ve daha önce söylenen bir ismin yerini tutar: \"Benim "
              "kalemim kırmızı, <b>seninki</b> mavi.\" → seninki = senin kalemin."},
    ],
    "notlar": [{"tur": "Sıfat mı, Zamir mi?",
                "d": "Yanında isim varsa sıfat, ismin yerini tutuyorsa zamirdir. \"<b>Bu kitap</b> "
                     "benim.\" → sıfat / \"<b>Bu</b> benim.\" → zamir. \"Bazı insanlar\" → sıfat / "
                     "\"Bazıları\" → zamir."}],
}, {
    "ad": "Zarf (Belirteç)",
    "giris": "Fiilleri, fiilimsileri, sıfatları veya başka zarfları <b>durum, zaman, miktar, "
             "yer-yön ve soru</b> bakımından belirten sözcüklerdir. Zarf genellikle fiili belirtir.",
    "maddeler": [
        {"t": "Durum Zarfı",
         "d": "Fiilin <b>nasıl</b> yapıldığını bildirir; sorusu <b>nasıl?</b> → hızlı koştu, "
              "güzel konuştu, sessizce girdi, yavaş yürüdü."},
        {"t": "Zaman Zarfı",
         "d": "Fiilin <b>ne zaman</b> yapıldığını bildirir; sorusu <b>ne zaman?</b> → bugün "
              "geldim, dün aradı, yarın gideceğiz, sabah uyandım."},
        {"t": "Miktar (Azlık-Çokluk) Zarfı",
         "d": "Fiilin, sıfatın veya başka bir zarfın <b>miktarını/derecesini</b> belirtir: "
              "\"<b>Çok</b> çalıştı.\" (fiil), \"Çok <b>güzel</b> ev.\" (sıfat), \"<b>Oldukça</b> "
              "hızlı koşuyor.\" (zarf)."},
        {"t": "Yer-Yön Zarfı",
         "d": "<b>içeri, dışarı, ileri, geri, aşağı, yukarı, öte, beri</b> sözcükleri hâl eki "
              "almadan kullanıldığında yön bildirir: İçeri girdi, yukarı çıktı, geri döndü."},
        {"t": "Soru Zarfı",
         "d": "<b>nasıl, ne zaman, niçin, neden, niye, ne kadar</b> fiil hakkında soru sorar: "
              "Nasıl geldin? Ne zaman gideceksin? Ne kadar çalıştın?"},
    ],
    "notlar": [
        {"tur": "Yer-yön tuzağı",
         "d": "Yer-yön sözcükleri <b>hâl eki alırsa zarf olmaktan çıkar ve isim olur</b>: "
              "\"İçeri girdi.\" (zarf) / \"İçeriye girdi.\" (isim). Aynı şekilde dışarı/dışarıya, "
              "yukarı/yukarıya, aşağı/aşağıya, ileri/ileriye, geri/geriye."},
        {"tur": "Miktar zarfı",
         "d": "Yalnızca fiili değil, sıfat ve zarfı da belirtebilir: \"Çok güzel konuştu.\" "
              "cümlesinde <b>çok</b> zarfı <b>güzel</b> zarfını belirtir."},
    ],
}, {
    "ad": "Edat (İlgeç)",
    "giris": "Tek başına tam bir anlamı olmayan, başka sözcüklerle birlikte kullanılarak "
             "<b>anlam ilişkisi kuran</b> sözcüklerdir. Edat sözcüğe \"ilişki\", bağlaç "
             "\"bağlama\" görevi yapar.",
    "maddeler": [
        {"t": "Benzerlik", "d": "<b>gibi</b> → \"Çocuk gibi sevindi.\""},
        {"t": "Amaç / Neden", "d": "<b>için</b> → \"Ders çalışmak için kütüphaneye gitti.\""},
        {"t": "Görelik", "d": "<b>göre</b> → \"Bana göre haklı.\""},
        {"t": "Karşılaştırma / Sınır", "d": "<b>kadar</b> → \"Senin kadar hızlı değil.\""},
        {"t": "Araç / Birliktelik", "d": "<b>ile</b> → \"Kalem ile yazdı.\""},
        {"t": "Diğer Edatlar",
         "d": "<b>üzere, dolayı, ötürü, karşı, doğru, beri, dek, değin</b>"},
    ],
    "notlar": [{"tur": "Edat – Bağlaç farkı",
                "d": "Edat sözcükler arasında <b>anlam ilişkisi kurar</b>, bağlaç sözcük veya "
                     "cümleleri <b>birbirine bağlar</b>. \"Senin gibi düşünüyorum.\" → edat / "
                     "\"Ali ve Veli geldi.\" → bağlaç."}],
}, {
    "ad": "Bağlaç",
    "giris": "Eş görevli sözcükleri, sözcük gruplarını veya cümleleri <b>birbirine bağlayan</b> "
             "sözcüklerdir. Temel görevleri bağlamaktır.",
    "maddeler": [
        {"t": "\"ve\" Bağlacı",
         "d": "Sözcükleri ve cümleleri bağlar: \"Ali ve Ahmet geldi.\", \"Kitap okudu ve uyudu.\""},
        {"t": "\"ile\" Bağlacı",
         "d": "Yerine <b>ve</b> getirilebiliyorsa bağlaçtır: \"Ali ile Veli geldi.\" → Ali ve Veli "
              "geldi. Araç/birliktelik anlamı varsa edattır: \"Kalem ile yazdı.\""},
        {"t": "\"de / da\" Bağlacı",
         "d": "Ayrı yazılan <b>de/da</b> bağlaçtır: \"Ben de geleceğim.\", \"Ali de geldi.\" "
              "Cümleden çıkarıldığında temel anlam bozulmaz: \"Ben de geldim.\" → \"Ben geldim.\""},
        {"t": "\"-de / -da\" Hâl Eki (Karıştırma)",
         "d": "Bitişik yazılan <b>-de/-da</b> bulunma hâli ekidir: \"Evde oturuyorum.\" → "
              "\"Ev oturuyorum.\" olmaz, bu nedenle buradaki <b>-de</b> hâl ekidir."},
        {"t": "\"ki\" Bağlacı",
         "d": "Bağlaç olan <b>ki ayrı yazılır</b>: \"Biliyorum ki başarılı olacaksın.\", \"Duydum "
              "ki yarın geliyormuş.\""},
        {"t": "\"-ki\" Eki (Karıştırma)",
         "d": "\"-ki\" her zaman bağlaç değildir: \"Seninki daha güzel.\" → ilgi zamiri, "
              "\"Evdeki kitaplar\" → sıfat yapan ek."},
        {"t": "Diğer Bağlaçlar",
         "d": "<b>ama, fakat, lakin, ancak, çünkü, veya, ya da, yahut, ise, ne...ne, hem...hem, "
              "gerek...gerek</b>"},
    ],
    "notlar": [{"tur": "Altın test",
                "d": "\"ile\" yerine <b>ve</b> geliyorsa bağlaç, araç/birliktelik ilişkisi "
                     "kuruyorsa edattır. Ayrı yazılan <b>de/da</b> ile ayrı yazılan <b>ki</b> "
                     "bağlaçtır."}],
}, {
    "ad": "Sıfat – Zamir – Zarf – Edat – Bağlaç Ayrımı",
    "giris": "Sınavda en çok karıştırılan sözcük türü ayrımları ve kısa formülleri:",
    "maddeler": [
        {"t": "Sıfat – Zamir",
         "d": "\"Bu kitap benim.\" → bu = sıfat / \"Bu benim.\" → bu = zamir."},
        {"t": "Belgisiz Sıfat – Belgisiz Zamir",
         "d": "\"Bazı öğrenciler geldi.\" → bazı = sıfat / \"Bazıları geldi.\" → bazıları = zamir."},
        {"t": "Soru Sıfatı – Soru Zamiri",
         "d": "\"Hangi kitabı aldın?\" → hangi = sıfat / \"Hangisini aldın?\" → hangisini = zamir."},
        {"t": "Sıfat – Zarf",
         "d": "İsmi belirtiyorsa sıfat, fiili belirtiyorsa zarftır: \"Güzel kız.\" → sıfat / "
              "\"Güzel konuştu.\" → zarf."},
        {"t": "Yer-Yön Zarfı – İsim",
         "d": "Ek almamışsa yer-yön zarfı, hâl eki almışsa isimdir: içeri / içeriye, yukarı / "
              "yukarıya, aşağı / aşağıya."},
        {"t": "Edat – Bağlaç",
         "d": "\"Kalem ile yazdı.\" → ile = edat (araç) / \"Ali ile Veli geldi.\" → ile = bağlaç "
              "(ve)."},
        {"t": "Bağlaç – Hâl Eki",
         "d": "\"Ben de geldim.\" → de = bağlaç / \"Evde kaldım.\" → -de = bulunma hâl eki."},
    ],
    "notlar": [
        {"tur": "Sıfat", "d": "İsmi niteler veya belirtir; ismin yanında bulunur."},
        {"tur": "Zamir", "d": "İsmin yerini tutar."},
        {"tur": "Zarf", "d": "Fiili, fiilimsiyi, sıfatı veya başka bir zarfı belirtir."},
        {"tur": "Edat", "d": "Sözcükler arasında anlam ilişkisi kurar."},
        {"tur": "Bağlaç", "d": "Sözcükleri veya cümleleri birbirine bağlar."},
    ],
}]

FIILIMSI_BLOKLAR = [{
    "ad": "Fiilimsiler (Eylemsiler)",
    "giris": "Fiil kök ve gövdelerinden türeyen ancak <b>çekimli fiil olmayan</b>; cümlede isim, "
             "sıfat veya zarf görevinde kullanılan sözcüklerdir. Kip ve kişi eki alıp çekimli "
             "fiil hâline gelmezler. Üçe ayrılır:",
    "maddeler": [
        {"t": "İsim-Fiil (Mastar)",
         "d": "Fiili isim gibi kullanır. Ekleri: <b>-ma / -me, -mak / -mek, -ış / -iş / -uş / "
              "-üş</b> → \"Kitap <b>okumak</b> faydalıdır.\", \"ders <b>çalışma</b> alışkanlığı\", "
              "\"onun <b>gülüşü</b>\"."},
        {"t": "Sıfat-Fiil (Ortaç)",
         "d": "Fiili sıfat görevine sokar, ismi niteler. Ekleri: <b>-an / -en, -ası / -esi, -maz / "
              "-mez, -ar / -er, -dik / -dık, -acak / -ecek, -mış / -miş</b> (Anası mezar "
              "dikecekmiş) → <b>gülen</b> çocuk, <b>bitmez</b> işler, <b>gelecek</b> günler, "
              "<b>okunacak</b> kitap."},
        {"t": "Zarf-Fiil (Ulaç / Bağ-Fiil)",
         "d": "Fiili zarf görevine sokar; fiilin nasıl, ne zaman, hangi şartla gerçekleştiğini "
              "belirtir. Ekleri: <b>-ken, -alı, -esiye, -meden, -ince, -ip, -arak, -dıkça, "
              "-maksızın, -casına</b> → \"<b>Gülerek</b> konuştu.\", \"<b>Eve gelince</b> beni "
              "ara.\""},
    ],
    "notlar": [{"tur": "Kısa formül",
                "d": "İsim-fiil <b>isim</b>, sıfat-fiil <b>ismi niteleyen sıfat</b>, zarf-fiil "
                     "<b>fiili belirten zarf</b> görevindedir."}],
}, {
    "ad": "Fiilimsilerde Adlaşma, Kalıcı İsim ve Tuzaklar",
    "giris": "Fiilimsi ekleri her zaman aynı görevi üstlenmez; sözcüğün cümledeki görevi ve "
             "kullanımı belirleyicidir.",
    "maddeler": [
        {"t": "Adlaşmış Sıfat-Fiil",
         "d": "Sıfat-fiil, nitelediği isim olmadan kullanılırsa adlaşır: \"<b>Gelen</b> öğrenciler "
              "içeri girdi.\" → sıfat-fiil / \"<b>Gelenler</b> içeri girdi.\" → adlaşmış sıfat-fiil."},
        {"t": "Kalıcı İsim",
         "d": "Bazı fiilimsi ekleri zamanla kalıcı isim olur: <b>dondurma, yemek, çakmak, kazma, "
              "danışma</b>. \"Dondurma aldım.\" → kalıcı isim / \"Dondurma yapmak zor.\" → isim-fiil."},
        {"t": "\"-ar / -er\" Tuzağı",
         "d": "İsmi niteliyorsa sıfat-fiil, yüklemde zaman bildiriyorsa geniş zaman ekidir: "
              "\"<b>Güler</b> yüzlü insanlar\" → sıfat-fiil / \"O her gün <b>güler</b>.\" → geniş "
              "zaman."},
        {"t": "\"-mış / -miş\" Tuzağı",
         "d": "\"<b>Gelmiş</b> misafirler bekliyor.\" → sıfat-fiil / \"Ahmet <b>gelmiş</b>.\" → "
              "öğrenilen (duyulan) geçmiş zaman eki."},
        {"t": "\"-acak / -ecek\" Tuzağı",
         "d": "\"<b>Gelecek</b> günleri düşünüyorum.\" → sıfat-fiil / \"Yarın <b>gelecek</b>.\" → "
              "gelecek zaman eki."},
        {"t": "Üç Türün Bir Arada Görünümü",
         "d": "\"<b>Koşarak</b> gelen çocuk kitap <b>okumayı</b> seviyor.\" → koşarak = zarf-fiil, "
              "gelen = sıfat-fiil, okumayı = isim-fiil."},
    ],
    "notlar": [{"tur": "Altın kural",
                "d": "<b>-ar/-er, -mış/-miş, -acak/-ecek</b> bir ismi niteliyor veya belirtiyorsa "
                     "<b>sıfat-fiil</b>; yüklem olup zaman bildiriyorsa <b>zaman eki</b>dir."}],
}]

BOLUM2 = {
    "no": "2", "ad": "Sözel Mantık Stratejileri", "giris": "",
    "bloklar": [{
        "maddeler": [
            {"t": "Tablo Kurulumu",
             "d": "Soruda gün, tarih veya kronolojik bir sıralama varsa tablo kesinlikle sıralamadan "
                  "(1, 2, 3... 7) kurulur. Sıralama yoksa tablo kişi/isimlerden kurulur."},
            {"t": "Tabloyu Bölme",
             "d": "Sıralama veya ana değişken yukarıya yerleştirildikten sonra tablo ortadan ikiye "
                  "bölünerek diğer özellikler (branş, renk, hastalık) alt alta veya yan yana işlenir."},
            {"t": "Elenenleri Silme Kuralı",
             "d": "Öncüllerde kesin olarak yerine yerleştirilen her veri tablodan ve kenardaki listeden "
                  "silinmelidir. Böylece kalan esnek elemanlar (değişkenler) net görülebilir."},
        ],
        "notlar": [],
    }],
}

BOLUM3 = {
    "no": "3", "ad": "Paragraf Taktikleri", "giris": "",
    "bloklar": [{
        "maddeler": [
            {"t": "Ana Düşünce Soruları",
             "d": "Genellikle paragrafın en başında veya en sonunda yer alır. Son cümledeki yargı, "
                  "yazarın okuyucuya aktarmak istediği temel mesajdır."},
            {"t": "Yardımcı Düşünce / \"Söylenemez\" Soruları",
             "d": "Seçenekler önce okunmalı, ardından metin ikiye bölünerek taranmalıdır. Metinde kesin "
                  "olarak ifade edilmeyen, yorum katılarak genellenen ifadeler genellikle çeldiricidir."},
            {"t": "Akışı Bozan Cümle",
             "d": "Paragrafın genel anlatım tonu, öznesi ve odak noktası takip edilir. Konunun akışını "
                  "başka bir yöne eviren veya alakasız bir detay içeren cümle akışı bozar."},
        ],
        "notlar": [],
    }],
}

BOLUM1 = {
    "no": "1", "ad": "Dil Bilgisi", "etiket": "7 soru", "giris": BOLUM1_GIRIS,
    "bloklar": ([SES_BLOK] + YAZIM_BLOKLAR + NOK_BLOKLAR + YAPI_BLOKLAR + TUR_BLOKLAR
                + FIILIMSI_BLOKLAR),
}

VERI = {
    "key": "turkce", "baslik": BASLIK, "giris": GIRIS, "not": NOT, "vurgu": VURGU,
    "bolumler": [BOLUM1, BOLUM2, BOLUM3],
}

def notlar_html(ns):
    return "".join('<div class="trick"><b>%s:</b> %s</div>' % (n["tur"], n["d"]) for n in (ns or []))


def blok_html(b):
    h = ""
    if b.get("ad"):
        h += "<h4>%s</h4>" % b["ad"]
    if b.get("giris"):
        h += "<p>%s</p>" % b["giris"]
    ms = b.get("maddeler") or []
    if ms:
        h += "<ul>"
        for m in ms:
            h += "<li><b>%s:</b> %s%s</li>" % (m["t"], m["d"], notlar_html(m.get("n")))
        h += "</ul>"
    h += notlar_html(b.get("notlar"))
    return h


def sayfa_html():
    v = VERI
    h = ""
    h += '<section class="oz"><h3 class="ozh">Genel Bak\u0131\u015f</h3><p>%s</p>' % v["giris"]
    h += '<div class="chiprow">%s</div>' % "".join(
        '<span class="chip">%s</span>' % x for x in v["vurgu"])
    h += '<div class="trick">%s</div></section>' % v["not"]
    h += '<div class="chiprow"><a class="chip" href="oku.html?ders=turkce">&#128214; ' \
         'Türkçe sayfalarını oku</a><a class="chip" href="oku.html?ders=turkce">&#128221; ' \
         'Kitap Modu\'nda özet</a></div>'
    for b in v["bolumler"]:
        h += '<section class="oz"><h3 class="ozh"><span class="n">%s</span>%s' % (b["no"], b["ad"])
        if b.get("etiket"):
            h += '<span class="tag">%s</span>' % b["etiket"]
        h += "</h3>"
        if b.get("giris"):
            h += "<p>%s</p>" % b["giris"]
        for bl in b.get("bloklar") or []:
            h += blok_html(bl)
        h += "</section>"
    return h

STIL = """
:root{--bg:#0b1020;--panel:#121a30;--stroke:rgba(255,255,255,.1);--text:#eef2ff;--muted:#a8b3d4;
  --accent:#7c5cff;--accent2:#2ec4b6}
*{box-sizing:border-box}
html{-webkit-text-size-adjust:100%}
body{margin:0;background:radial-gradient(120% 90% at 12% -10%,rgba(124,92,255,.28),transparent 60%),
  radial-gradient(90% 80% at 100% 0,rgba(46,196,182,.2),transparent 55%),var(--bg);color:var(--text);
  font:16px/1.85 "Segoe UI",system-ui,-apple-system,"Helvetica Neue",Arial,sans-serif}
.wrap{max-width:960px;margin:0 auto;padding:26px 18px 70px}
header.top{display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin-bottom:18px}
.chip{display:inline-flex;align-items:center;gap:7px;min-height:42px;padding:0 15px;border-radius:999px;
  border:1px solid var(--stroke);background:rgba(255,255,255,.06);color:var(--text);font-size:13.5px;
  font-weight:600;text-decoration:none;transition:.2s}
.chip:hover{border-color:var(--accent);transform:translateY(-1px)}
h1{font-size:clamp(25px,5.4vw,38px);line-height:1.2;margin:0 0 6px;letter-spacing:-.5px}
.lead{color:var(--muted);font-size:15.5px;margin:0 0 22px}
.oz{border:1px solid var(--stroke);border-radius:20px;background:linear-gradient(180deg,rgba(24,32,58,.9),
  rgba(16,22,42,.9));padding:20px 20px 22px;margin:0 0 16px;box-shadow:0 18px 40px rgba(3,6,18,.45)}
.ozh{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin:0 0 12px;font-size:clamp(18px,3.4vw,23px)}
.ozh .n{flex:0 0 34px;width:34px;height:34px;border-radius:11px;display:grid;place-items:center;
  background:var(--accent);font-size:16px;font-weight:800}
.tag{font-size:11.5px;font-weight:700;padding:4px 10px;border-radius:999px;background:var(--accent2);
  color:#06231f}
.oz h4{margin:18px 0 8px;font-size:16.5px;color:#fff}
.oz h4:first-of-type{margin-top:6px}
.oz p{margin:0 0 10px;color:var(--muted)}
.oz ul{margin:0;padding-left:20px;color:var(--muted)}
.oz li{margin:9px 0}
.oz b,.oz strong{color:var(--text)}
.chiprow{display:flex;gap:8px;flex-wrap:wrap;margin:0 0 12px}
.chiprow .chip{cursor:default}
.trick{border-left:3px solid var(--accent2);background:rgba(255,255,255,.05);border-radius:0 12px 12px 0;
  padding:10px 14px;margin:10px 0;font-size:14.5px;color:var(--muted)}
.trick b{color:var(--accent2)}
footer.site{display:flex;gap:10px;flex-wrap:wrap;margin-top:26px;color:var(--muted);font-size:12.5px}
@media(max-width:640px){
  .wrap{padding:18px 13px 60px}
  .oz{padding:16px 15px 18px;border-radius:16px}
  header.top .chip{flex:1 1 auto;justify-content:center}
  body{font-size:15.5px}
}
@media print{
  body{background:#fff;color:#111}
  .oz{background:#fff;border-color:#ddd;box-shadow:none;break-inside:avoid}
  .oz p,.oz ul,.trick{color:#333}
  .oz b,.oz h4,.ozh{color:#000}
  header.top,footer.site{display:none}
}
"""

TEMPLATE = """<!DOCTYPE html>
<html lang="tr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="description" content="KPSS Türkçe genel tekrar ders notları: dil bilgisi, sözel mantık ve paragraf taktikleri.">
<title>__TITLE__</title>
<style>__STIL__</style>
</head>
<body>
<div class="wrap">
<header class="top">
<a class="chip" href="index.html">&#8592; Ana sayfa</a>
<a class="chip" href="oku.html?ders=turkce">&#128214; Kitap Modu</a>
<a class="chip" href="galeri.html">&#9635; Galeri</a>
<a class="chip" href="javascript:window.print()">&#128424; Yazdır</a>
</header>
<h1>__BASLIK__</h1>
<p class="lead">KPSS Türkçe genel tekrar notları &middot; dil bilgisi, sözel mantık ve paragraf taktikleri</p>
__BODY__
<footer class="site">
<span>Kaynak: kişisel genel tekrar notları</span><span>&middot;</span>
<span>Kitap Modu'nda <b>&Ouml;</b> tuşuyla aynı özet &ccedil;ekmece olarak a&ccedil;ılır.</span>
</footer>
</div>
</body>
</html>
"""

def sayfa_yaz():
    html = (TEMPLATE.replace("__STIL__", STIL)
                    .replace("__TITLE__", BASLIK)
                    .replace("__BASLIK__", BASLIK)
                    .replace("__BODY__", sayfa_html()))
    with open(PAGE, "w", encoding="utf-8", newline="\n") as f:
        f.write(html)
    return len(html)


def oku_enjekte():
    with open(OKU, "r", encoding="utf-8", newline="") as f:
        t = f.read()
    if BEGIN not in t or END not in t:
        raise SystemExit("oku.html icinde OZET-DATA isaretleri bulunamadi")
    i = t.index(BEGIN) + len(BEGIN)
    j = t.index(END)
    if t[j - 12:j].strip().endswith("-->") is False and "<script" not in t[i:j]:
        raise SystemExit("oku.html icinde ozetData script blogu bulunamadi")
    veri = json.dumps({VERI["key"]: VERI}, ensure_ascii=False, indent=1).replace("<", "\\u003c")
    blok = ('\n<script type="application/json" id="ozetData">\n' + veri + '\n</script>\n')
    yeni = t[:i] + blok + t[j:]
    # Eski (bozuk) yerlesimden kalan fazladan </script> varsa temizle.
    kuyruk = yeni[yeni.index(END) + len(END):]
    fazla = kuyruk.lstrip()
    if fazla.startswith("</script>"):
        kalan = kuyruk.index("</script>") + len("</script>")
        yeni = yeni[:yeni.index(END) + len(END)] + kuyruk[kalan:]
    if yeni != t:
        with open(OKU, "w", encoding="utf-8", newline="") as f:
            f.write(yeni)
    return len(veri)


def main():
    n1 = sayfa_yaz()
    n2 = oku_enjekte()
    print("turkce-ozet.html yazildi (%d karakter)" % n1)
    print("oku.html verisi guncellendi (%d karakter)" % n2)
    print("bolumler: %s" % ", ".join("%s-%s" % (b["no"], b["ad"]) for b in VERI["bolumler"]))
    print("blok sayisi: %d" % sum(len(b.get("bloklar") or []) for b in VERI["bolumler"]))


if __name__ == "__main__":
    main()