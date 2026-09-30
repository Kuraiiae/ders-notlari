# -*- coding: utf-8 -*-
"""KPSS Coğrafya konu özetlerinin tek kaynağı.

Bu dosya YALNIZCA veriyi tutar. Uygulama (HTML üretimi, oku.html'e gömme)
tools/ozet.py içindedir.
"""

DERS_ADI = "Coğrafya"
ACIKLAMA = ("KPSS Coğrafya genel tekrar ders notları: Türkiye'nin coğrafi konumu, yer şekilleri, "
            "iklim ve bitki örtüsü, nüfus ve yerleşme, tarım, hayvancılık, madenler, sanayi ve ulaşım.")
LEAD = ("KPSS Coğrafya genel tekrar notları &middot; fiziki coğrafya, yer şekilleri, iklim, "
        "nüfus, ekonomik coğrafya ve harita taktikleri")
VURGU = ["Coğrafi Konum", "Yer Şekilleri", "İklim ve Bitki", "Nüfus ve Yerleşme",
         "Tarım ve Hayvancılık", "Maden ve Enerji", "Sanayi ve Ulaşım", "Bölgeler"]

GIRIS = ("KPSS Coğrafya oturumunda <b>18 soru</b> gelmektedir. Soruların yaklaşık <b>6-7 tanesi "
         "fiziki coğrafya</b> (konum, yer şekilleri, iklim, su varlığı), <b>3-4 tanesi beşeri coğrafya</b> "
         "(nüfus, yerleşme, göç) ve <b>7-8 tanesi ekonomik coğrafya</b> (tarım, hayvancılık, maden, enerji, "
         "sanayi, ticaret, ulaşım, turizm) alanlarından oluşur.")

NOT = ("<b>Not:</b> ÖSYM coğrafya sorularında <b>harita ve dilsiz harita okuma</b> becerisini doğrudan "
       "test eder. Karşılaştırma tabloları ve <b>Kritik Kural</b> notları doğrudan soru potansiyeli taşır.")


# ── 1. Türkiye'nin Coğrafi Konumu ──────────────────────────────────────────
B1 = {
    "no": "1", "ad": "Türkiye'nin Coğrafi Konumu ve Etkileri", "etiket": "Matematik ve Özel Konum",
    "giris": "Türkiye <b>36°-42° Kuzey paralelleri</b> ile <b>26°-45° Doğu meridyenleri</b> arasında yer alır.",
    "bloklar": [
        {"ad": "Matematik (Mutlak) Konum ve Sonuçları",
         "maddeler": [
             {"t": "Kuzey Yarımküre ve Orta Kuşak",
              "d": "Türkiye Yengeç Dönencesi'nin kuzeyindedir. Bu nedenle güneş ışınları hiçbir zaman 90° dik açıyla gelmez, gölge boyu asla sıfır olmaz ve gölge yönü daima kuzeyi gösterir."},
             {"t": "Dört Mevsim Belirginliği (A-B-C-D Kuralı)",
              "d": "Orta kuşakta yer almanın 4 temel kanıtı: <b>A</b>kdeniz iklim kuşağında yer alması, <b>B</b>atı rüzgarlarının etkisinde olması, <b>C</b>ephesel (Frontal) yağışların görülmesi, <b>D</b>ört mevsimin belirgin yaşanması.",
              "n": [{"tur": "Pratik Yol", "d": "«A-B-C-D» formülü orta kuşağın kesin kanıtıdır; aynı anda farklı mevsim yaşanması ise özel konumdur."}]},
             {"t": "Güneyden Kuzeye Değişenler (Enlem Etkisi)",
              "d": "Güneyden kuzeye gidildikçe: Güneş ışınlarının geliş açısı küçülür, sıcaklık ortalamaları genel olarak azalır, çizgisel hız azalır, yerçekimi artar, alacakaranlık (grup/tan) süresi uzar, denizlerin tuzluluk oranı azalır (Akdeniz %38 > Karadeniz %18)."},
             {"t": "Bakı Etkisi",
              "d": "Dönenceler dışında olduğumuz için dağların daima <b>güney yamaçları</b> güneşe bakar; daha sıcaktır, karlar daha erken erir, tarım üst sınırı ve yerleşme üst sınırı daha yüksektir. (İstisna: Karadeniz'de kışın kuzey yamaç denizellik nedeniyle daha ılık olabilir)."},
         ]},
        {"ad": "Özel (Göreceli) Konum ve Sonuçları",
         "maddeler": [
             {"t": "Üç Tarafı Denizlerle Çevrili Olma",
              "d": "Kıyı kesimlerde nemlilik ve yağış fazla, sıcaklık farkları azdır; iç kesimlerde karasallık ve sıcaklık farkları fazladır."},
             {"t": "Yükselti ve Engebe",
              "d": "Batıdan doğuya gidildikçe yükselti artar, sıcaklık düşer, karın yerde kalma süresi uzar, tarım ürünlerinin olgunlaşma süresi gecikir."},
             {"t": "Jeopolitik ve Jeostratejik Konum",
              "d": "Üç kıtanın (Asya, Avrupa, Afrika) kavşak noktasındadır. İstanbul ve Çanakkale boğazlarına sahiptir, enerji koridoru (transit boru hatları) konumundadır."},
         ]},
        {"ad": "Matematik Konum vs Özel Konum Karşılaştırması",
         "tablo": {
             "basliklar": ["Özellik", "Konum Türü", "Temel Gerekçe / Açıklama"],
             "satirlar": [
                 ["Akdeniz'in Karadeniz'den tuzlu olması", "Matematik Konum", "Enlem, sıcaklık ve buharlaşma farkı"],
                 ["Aynı anda farklı mevsim özelliklerinin yaşanması", "Özel Konum", "Kısa mesafede yükselti ve yer şekli değişimi"],
                 ["Gölge yönünün daima kuzeye düşmesi", "Matematik Konum", "Yengeç Dönencesi'nin kuzeyinde yer alma"],
                 ["Doğu Anadolu'da ürünlerin geç olgunlaşması", "Özel Konum", "Yükseltinin batıdan doğuya artması"],
                 ["Cephesel (Frontal) yağışların görülmesi", "Matematik Konum", "Orta kuşakta sıcak ve soğuk havanın karşılaşması"],
                 ["Jeotermal enerji ve sıcak su kaynakları", "Özel Konum", "Genç oluşumlu kırıklı (fay) arazi yapısı"],
             ]
         }},
    ]
}


# ── 2. Türkiye'nin Yer Şekilleri ───────────────────────────────────────────
B2 = {
    "no": "2", "ad": "Türkiye'nin Yer Şekilleri ve Jeolojik Yapısı", "etiket": "Fiziki Coğrafya",
    "giris": "Türkiye, <b>III. Jeolojik Zaman (Tersiyer)</b> sonu ve <b>IV. Jeolojik Zaman (Kuvaterner)</b> başında şekillenmiş genç, dinamik ve yüksek bir ülkedir.",
    "bloklar": [
        {"ad": "Orojenez (Dağ Oluşumu) ve Dağ Tipleri",
         "maddeler": [
             {"t": "Kıvrım Dağları (Alp-Himalaya Kıvrımı)",
              "d": "Esnek tortul tabakaların sıkışmasıyla oluşur. Yüksekte kalan kubbe kısımlara <b>Antiklinal</b>, alçakta kalan çanaklara <b>Senklinal</b> denir. Kuzey Anadolu Dağları (Kaçkar, Canik, Küre, Ilgaz) ve Toroslar (Aladağlar, Bolkarlar, Bey Dağları)."},
             {"t": "Kırık Dağları (Horst - Graben)",
              "d": "Sert kütlelerin yan basınçlarla kırılmasıyla oluşur. Yüksekte kalan blok <b>Horst</b>, çöken çöküntü ovası <b>Graben</b>'dir. Ege'de yaygındır: Kaz Dağı, Madra, Yunt, Bozdağlar, Aydın Dağları, Menteşe Dağları (Horst); Bakırçay, Gediz, Küçük Menderes, Büyük Menderes (Graben). Hatay'daki Nur (Amanos) Dağları da horsttur."},
             {"t": "Volkanik Dağlar",
              "d": "Magmanın yer kabuğundan yüzeye çıkıp katılaşmasıyla oluşur. <b>İç Anadolu:</b> Erciyes, Hasan Dağı, Melendiz, Karadağ, Karacadağ. <b>Doğu Anadolu:</b> Ağrı (Büyük/Küçük), Tendürek, Süphan, Nemrut. <b>Güneydoğu:</b> Karacadağ (Kalkan volkan). <b>Ege:</b> Kula (Türkiye'nin en genç volkan konileri)."},
         ]},
        {"ad": "Platolar ve Oluşum Türleri",
         "maddeler": [
             {"t": "Aşınım (Peneplen) Platoları",
              "d": "Çatalca-Kocaeli Platosu (sanayi, nüfus ve yerleşme en yoğun plato)."},
             {"t": "Karstik Platolar",
              "d": "Teke ve Taşeli Platoları (Akdeniz; kireçtaşı arazisi, nüfus seyrek, kıl keçisi yetiştiriciliği)."},
             {"t": "Volkanik (Lav Örtüsü) Platolar",
              "d": "Erzurum-Kars ve Ardahan Platoları (yaz yağışları, çernezyom toprak, gür çayırlar, büyükbaş mera hayvancılığı)."},
             {"t": "Yatay Duruşlu (Tabaka Düzlüğü) Platoları",
              "d": "İç Anadolu ve Güneydoğu: Haymana, Cihanbeyli, Obruk, Bozok, Uzunyayla, Gaziantep, Şanlıurfa (küçükbaş hayvancılık ve tahıl tarımı)."},
         ]},
        {"ad": "Dış Kuvvetler ve Oluşturdukları Yer Şekilleri",
         "maddeler": [
             {"t": "Akarsu Aşındırma ve Biriktirme",
              "d": "Aşındırma: Vadi tipleri (Kanyon, Çentik, Boğaz/Yarma, Tabanlı), Kırgıbayır (Kapadokya), Dev kazanı, Peri bacaları (akarsu + rüzgar + volkanizma). Biriktirme: Delta ovaları (Çukurova, Bafra, Çarşamba, Silifke, Balat, Menemen, Dikili), Birikinti konisi, Dağ eteği ovası."},
             {"t": "Karstik Şekiller",
              "d": "Kalker, jips ve kaya tuzu erimesiyle oluşur. Aşındırma: Lapya &gt; Dolin &gt; Uvala &gt; Polye (Gölova: Tefenni, Acıpayam, Korkuteli, Kestel, Elmalı, Muğla). Mağara, Düden, Obruk (Kızılören, Çıralı). Biriktirme: Traverten (Pamukkale), Sarkıt, Dikit, Sütun."},
             {"t": "Rüzgar Şekilleri",
              "d": "Bitki örtüsünün cılız, kurak/yarı kurak olduğu İç Anadolu ve Güneydoğu'da etkilidir: Mantarkaya, Tafoni, Yardang, Barkan, Lös."},
             {"t": "Kıyı Tipleri",
              "d": "<b>Boyuna Kıyı:</b> Karadeniz ve Akdeniz (falez çok, kıta sahanlığı dar, koy/körfez az). <b>Enine Kıyı:</b> Ege (girinti-çıkıntı çok, kıta sahanlığı geniş, delta çok). <b>Ria Tipi:</b> İstanbul ve Çanakkale boğazları, Haliç. <b>Dalmaçya Tipi:</b> Kaş-Finike kıyıları. <b>Limanlı Kıyı:</b> Büyük ve Küçükçekmece."},
         ]},
    ]
}


# ── 3. Türkiye'nin İklimi ve Bitki Örtüsü ──────────────────────────────────
B3 = {
    "no": "3", "ad": "Türkiye'nin İklimi, Sıcaklık, Basınç ve Yağış", "etiket": "İklim Bilgisi",
    "giris": "Türkiye'de topoğrafik çeşitlilik ve denizellik-karasallık nedeniyle kısa mesafelerde çok farklı iklim tipleri görülür.",
    "bloklar": [
        {"ad": "Türkiye'yi Etkileyen Basınç Merkezleri ve Rüzgarlar",
         "maddeler": [
             {"t": "Basınç Merkezleri",
              "d": "<b>Sibirya Termik AYB:</b> Kışın etkilidir; aşırı soğuk, ayaz ve kar getirir. <b>İzlanda Dinamik AB:</b> Kışın etkilidir; ılık ve yağışlı hava getirir. <b>Asor Dinamik YB:</b> Yazın kuraklık ve sıcaklık getirir; kışın ılık hava. <b>Basra Termik AB:</b> Yazın Güneydoğu'dan sokulur; aşırı sıcaklık, kuraklık ve samyeli rüzgarı getirir."},
             {"t": "Yerel Rüzgarlar (KAYIP SAKAL)",
              "d": "Kuzeyden esenler sıcaklığı düşürür: <b>K</b>arayel (KB), <b>Y</b>ıldız (K), <b>P</b>oyraz (KD). Güneyden esenler sıcaklığı artırır: <b>S</b>amyeli/Keşişleme (GD), <b>K</b>ıble (G), <b>L</b>odos (GB - denizciliği olumsuz etkiler, soba zehirlenmelerine yol açar, karları hızlı eritir)."},
             {"t": "Fön Rüzgarı",
              "d": "Dağ yamacından aşağı inerken her 100 metrede 1°C ısınan kuru rüzgardır. Karadeniz (Rize'de turunçgil mikroklimaları) ve Toroslar'da etkilidir. Erken erime, çığ ve ürünlerin erken olgunlaşmasına yol açar."},
         ]},
        {"ad": "Türkiye'nin 4 Ana İklim Tipi ve Yağış Rejimleri",
         "tablo": {
             "basliklar": ["İklim Tipi", "En Fazla Yağış Mevsimi", "Yağış Oluşum Tipi", "Doğal Bitki Örtüsü", "Toprak Türü"],
             "satirlar": [
                 ["Karadeniz İklimi", "Sonbahar", "Yamaç (Orografik)", "Geniş ve İğne Yapraklı Orman", "Kahverengi Orman Toprağı"],
                 ["Akdeniz İklimi", "Kış", "Cephesel (Frontal)", "Maki (Garig / Kızılçam)", "Terra Rossa (Kırmızı Akdeniz)"],
                 ["İç Anadolu Karasal", "İlkbahar (Kırkikindi)", "Konveksiyonel (Yükselim)", "Bozkır (Step)", "Kestane / Kahverengi Bozkır"],
                 ["Sert Karasal (Erzurum-Kars)", "Yaz", "Konveksiyonel (Yükselim)", "Dağ Çayırları (Alpin)", "Çernezyom (Kara Toprak)"],
             ]
         }},
    ]
}


# ── 4. Türkiye'nin Nüfus ve Ekonomik Coğrafyası ─────────────────────────────
B4 = {
    "no": "4", "ad": "Nüfus, Yerleşme, Tarım, Hayvancılık ve Madenler", "etiket": "Ekonomik Coğrafya",
    "giris": "Nüfusun dağılışı sanayi, ticaret, tarım, ulaşım ve iklim koşullarıyla doğrudan ilişkilidir.",
    "bloklar": [
        {"ad": "Nüfus Yoğunluğu ve Göç Hareketleri",
         "maddeler": [
             {"t": "Tenha (Seyrek) Nüfuslu Alanlar",
              "d": "<b>Teke ve Taşeli:</b> Karstik arazi ve engebe. <b>Yıldız Dağları:</b> Ulaşım yollarına sapa ve dağlık. <b>Hakkari Yöresi:</b> Aşırı engebe, yükselti ve iklim sertliği. <b>Tuz Gölü Çevresi:</b> Kuraklık ve yağış azlığı. <b>Sinop Çevresi:</b> Art bölgesi (hinterland) dağlarla kapalı ve ulaşım zor."},
             {"t": "Yoğun Nüfuslu Alanlar",
              "d": "Çatalca-Kocaeli (sanayi ve finans), Ege Kıyıları (tarım ve turizm), Çukurova (tarım ve sanayi), Doğu Karadeniz Kıyı Şeridi (tarım ve denizellik dar alana sıkışmış)."},
         ]},
        {"ad": "Kritik Tarım Ürünleri ve Yetişme Alanları",
         "maddeler": [
             {"t": "Devlet Kontrolündeki Ürünler",
              "d": "<b>Pirinç (Çeltik):</b> Sıtma hastalığı riski nedeniyle yerleşim alanları çevresinde izne bağlıdır. <b>Tütün:</b> Kaliteyi korumak amacıyla devlet kotasındadır. <b>Şeker Pancarı:</b> Fabrika kapasitesi ve kota kuralı (çabuk bozulduğu için fabrika yakın kurulur). <b>Haşhaş:</b> Uyuşturucu yapımı kontrolü (Afyon, Konya çevresi). <b>Kenevir:</b> Uyuşturucu kontrolü."},
             {"t": "Üretiminde Dünya Birincisi Olduklarımız",
              "d": "Fındık (Karadeniz), Kuru İncir (Aydın/Ege), Kuru Kayısı (Malatya), Kiraz, Antep Fıstığı (Güneydoğu)."},
             {"t": "Zeytin ve Turunçgiller",
              "d": "Kış ılıklığı ister, don olayına duyarlıdır; Akdeniz, Ege ve Güney Marmara'da yoğundur."},
         ]},
        {"ad": "Kritik Madenler ve Enerji Kaynakları",
         "tablo": {
             "basliklar": ["Maden / Kaynak", "Önemli Çıkarım Alanları", "İşletme / Tesis", "Kullanım / Not"],
             "satirlar": [
                 ["Demir", "Sivas (Divriği), Malatya (Hekimhan, Hasançelebi)", "Karabük, Ereğli, İskenderun", "Ağır sanayinin hammaddesi"],
                 ["Bakır", "Artvin (Murgul), Kastamonu (Küre), Rize (Çayeli), Elazığ (Maden)", "Samsun (İzabe tesisi), Murgul", "Elektrik-elektronik sanayi"],
                 ["Boksit (Alüminyum)", "Antalya (Akseki), Konya (Seydişehir)", "Konya Seydişehir Alüminyum Tesisleri", "Hafif metal, uçak ve otomotiv"],
                 ["Bor Mineralleri", "Balıkesir (Bigadiç), Kütahya (Emet), Bursa (Mustafakemalpaşa), Eskişehir (Kırka)", "Bandırma ve Kırka Bor Tesisleri", "Dünya rezervinin %73'ü Türkiye'dedir"],
                 ["Krom", "Elazığ (Guleman), Muğla (Fethiye, Köyceğiz)", "Antalya ve Elazığ Ferrokrom Tesisleri", "Çeliğin sertleştirilmesi ve paslanmaz çelik"],
                 ["Taş Kömürü (I. Zaman)", "Zonguldak, Bartın, Karabük Havzası", "Çatalağzı Termik Santrali", "Demir-çelik eritmede yüksek ısı"],
                 ["Linyit (III. Zaman)", "Manisa (Soma), Kütahya (Tunçbilek, Tavşanlı, Seyitömer), Kahramanmaraş (Afşin-Elbistan), Muğla (Yatağan)", "Soma, Yatağan, Afşin-Elbistan santralleri", "Türkiye genelinde en yaygın madendir"],
                 ["Jeotermal Enerji", "Denizli (Sarayköy), Aydın (Germencik), Manisa, Çanakkale", "Sarayköy ve Germencik Santralleri", "Fay hatlarına bağlı sıcak su"],
             ]
         }},
    ]
}

VERI = {
    "key": "cografya",
    "baslik": "KPSS Orta Öğretim Coğrafya",
    "ders_adi": "Coğrafya",
    "aciklama": ACIKLAMA,
    "lead": LEAD,
    "giris": GIRIS,
    "not": NOT,
    "vurgu": VURGU,
    "bolumler": [B1, B2, B3, B4],
}
