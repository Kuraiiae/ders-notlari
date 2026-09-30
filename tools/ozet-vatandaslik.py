# -*- coding: utf-8 -*-
"""KPSS Vatandaşlık ve Anayasa Hukuku konu özetlerinin tek kaynağı.

Bu dosya YALNIZCA veriyi tutar. Uygulama (HTML üretimi, oku.html'e gömme)
tools/ozet.py içindedir.
"""

DERS_ADI = "Vatandaşlık"
ACIKLAMA = ("KPSS Vatandaşlık ve Anayasa Hukuku genel tekrar ders notları: Temel hukuk kavramları, "
            "devlet biçimleri, Türk anayasa tarihi, 1982 Anayasası, yasama, yürütme, yargı ve idare hukuku.")
LEAD = ("KPSS Vatandaşlık genel tekrar notları &middot; temel hukuk kavramları, 1982 Anayasası, "
        "yasama, yürütme, yargı, idare hukuku ve kritik sınav püf noktaları")
VURGU = ["Temel Hukuk", "Anayasa Tarihi", "1982 Anayasası", "Temel Haklar",
         "Yasama (TBMM)", "Yürütme (CB)", "Yargı Organları", "İdare Hukuku"]

GIRIS = ("KPSS Genel Yetenek - Genel Kültür oturumunda <b>9 adet Vatandaşlık</b> ve <b>6 adet Güncel Bilgiler</b> "
         "olmak üzere toplam <b>15 soru</b> gelir. Vatandaşlık soruları; Temel Hukuk (2-3 soru), Anayasa Hukuku "
         "(3-4 soru) ve İdare Hukuku (2-3 soru) konu dağılımına sahiptir.")

NOT = ("<b>Not:</b> 2017 Anayasa Değişiklikleri (Cumhurbaşkanlığı Hükümet Sistemi, Başbakanlık ve Bakanlar Kurulu'nun "
       "kaldırılması, KHK yerine CBK gelmesi, HSK yapısı, Askeri Yargının kaldırılması) en kritik soru havuzudur.")


# ── 1. Temel Hukuk Bilgisi ─────────────────────────────────────────────────
B1 = {
    "no": "1", "ad": "Temel Hukuk Bilgisi ve Kavramları", "etiket": "Temel Kavramlar",
    "giris": "Toplumsal düzen kuralları; din, ahlak, görgü ve <b>hukuk kuralları</b>dır. Hukuk kurallarını diğerlerinden ayıran temel özellik <b>maddi yaptırımlı (devlet gücüyle destekli)</b> olmasıdır.",
    "bloklar": [
        {"ad": "Hukukun Yaptırım (Müeyyide) Türleri",
         "maddeler": [
             {"t": "Ceza",
              "d": "Ceza kanunlarına aykırı fiillere (suçlara) uygulanan yaptırımdır (Hapis cezası, Adli para cezası)."},
             {"t": "Cebri İcra",
              "d": "Borcunu veya hukuki yükümlülüğünü rızasıyla yerine getirmeyen kimsenin, devlet zoruyla (icra memurları aracılığıyla) yükümlülüğünü ifa etmesidir."},
             {"t": "Tazminat",
              "d": "Hukuka aykırı veya kusurlu bir eylemle başkasına verilen zararın para ile giderilmesidir (Maddi ve Manevi tazminat)."},
             {"t": "İptal",
              "d": "Hukuka aykırı olarak yapılan <b>idari işlemlerin</b> idari yargı (Danıştay, İdare Mahkemesi) kararıyla geçmişe etkili olarak ortadan kaldırılmasıdır."},
             {"t": "Hükümsüzlük (Geçersizlik)",
              "d": "Hukuki işlemlerin kanunun öngördüğü kurallara uygun yapılmaması sonucu hukuki sonuç doğurmamasıdır. 4 türe ayrılır: Yokluk, Mutlak Butlan, Nisbi Butlan, Tek Taraflı Bağlamazlık (Askıda Hükümsüzlük)."},
         ]},
        {"ad": "Hükümsüzlük Çeşitleri Karşılaştırması",
         "tablo": {
             "basliklar": ["Tür", "Tanım ve Gerekçe", "Örnek"],
             "satirlar": [
                 ["Yokluk", "Kurucu unsurlardan birinin tamamen eksik olmasıdır; işlem hiç doğmamıştır.", "Resmi evlendirme memuru olmadan yapılan imam nikahı"],
                 ["Mutlak Butlan", "Kurucu unsur var ama emredici hukuk kuralına, ahlaka veya kamu düzenine aykırıdır.", "Akıl hastası olan birinin evlenmesi ya da amca-yeğen evliliği"],
                 ["Nisbi Butlan (İptal Edilebilirlik)", "İrade sakatlığı (hata, hile, korkutma) ile yapılan geçerli bir işlemin sonradan iptal ettirilmesidir.", "Korkutularak (tehditle) sözleşme imzalatılması"],
                 ["Tek Taraflı Bağlamazlık", "Sınırlı ehliyetsizin (küçük/kısıtlı) yasal temsilcisinin izni olmadan tek başına yaptığı borçlandırıcı işlem.", "16 yaşındaki çocuğun veli izni olmadan motosiklet satın alması"],
             ]
         }},
        {"ad": "Normlar Hiyerarşisi (Kelsen Piramidi)",
         "maddeler": [
             {"t": "1. Anayasa",
              "d": "En üst hukuk normudur. Hiçbir kanun veya düzenleme Anayasaya aykırı olamaz."},
             {"t": "2. Kanun ve Milletlerarası Antlaşmalar",
              "d": "Usulüne göre yürürlüğe konulmuş temel hak ve özgürlüklere ilişkin milletlerarası antlaşmalar ile kanunlar çatışırsa antlaşma hükümleri esas alınır."},
             {"t": "3. Cumhurbaşkanlığı Kararnamesi (CBK)",
              "d": "Yürütme yetkisine ilişkin konularda çıkarılır. Kanunda açıkça düzenlenen konularda CBK çıkarılamaz; CBK ile kanun çelişirse kanun hükümleri uygulanır."},
             {"t": "4. Yönetmelik",
              "d": "Cumhurbaşkanı, bakanlıklar ve kamu tüzel kişileri tarafından kanunların ve CBK'lerin uygulanmasını sağlamak amacıyla çıkarılır."},
             {"t": "5. Genelge, Tebliğ, Yönerge",
              "d": "İdarenin iç işleyişini ve uygulamayı yönlendiren adsız düzenleyici işlemlerdir."},
         ]},
    ]
}


# ── 2. Türk Anayasa Tarihi ve 1982 Anayasası ────────────────────────────────
B2 = {
    "no": "2", "ad": "Türk Anayasa Tarihi ve 1982 Anayasası Temel İlkeleri", "etiket": "Anayasa Tarihi",
    "giris": "Türk anayasal gelişimi 1808 Sened-i İttifak ile başlamış, ilk yazılı anayasa 1876 Kanun-i Esasi olmuştur.",
    "bloklar": [
        {"ad": "Anayasa Tarihimizdeki Kritik İlkler",
         "maddeler": [
             {"t": "1808 Sened-i İttifak",
              "d": "Padişahın (II. Mahmut) yetkilerini ilk kez sınırlandıran belgedir (Anayasa değildir; Magna Carta benzeridir)."},
             {"t": "1839 Tanzimat Fermanı",
              "d": "Hukukun üstünlüğü ilkesi ilk kez kabul edilmiştir. Can, mal, ırz güvenliği güvenceye alınmıştır."},
             {"t": "1876 Kanun-i Esasi",
              "d": "Türk tarihinin <b>ilk yazılı anayasasıdır</b>. Meşrutiyet yönetimine geçilmiş, çift meclisli parlamento (Heyet-i Ayan ve Heyet-i Mebusan) kurulmuştur."},
             {"t": "1921 Anayasası (Teşkilat-ı Esasiye)",
              "d": "Tek <b>yumuşak ve çerçeve</b> anayasamızdır. Güçler birliği ve Meclis hükümeti sistemi benimsenmiştir. Yargıdan bahsedilmemiştir."},
             {"t": "1924 Anayasası",
              "d": "Karma hükümet sistemi (Meclis hükümeti + Parlamenter sistem) uygulanmıştır. İlk sert ve kazuistik anayasadır. 1928'de 'Devletin dini İslam'dır' ibaresi çıkarılmış, 1934'te kadınlara seçme-seçilme hakkı verilmiş, 1937'de Atatürk ilkeleri anayasaya girmiştir."},
             {"t": "1961 Anayasası",
              "d": "En <b>özgürlükçü ve çoğulcu</b> anayasamızdır. Anayasa Mahkemesi, MGK, DPT kurulmuş; çift meclisli yapı (Millet Meclisi + Cumhuriyet Senatosu) getirilmiştir."},
             {"t": "1982 Anayasası",
              "d": "Halen yürürlükte olan, en <b>katı (sert) ve kazuistik</b> anayasamızdır. Çift meclis kaldırılmış, yürütme güçlendirilmiş, rasyonelleştirilmiş parlamentarizm ve 2017'de Cumhurbaşkanlığı Hükümet Sistemine geçilmiştir."},
         ]},
        {"ad": "1982 Anayasası Değiştirilemez İlk 3 Madde",
         "maddeler": [
             {"t": "Madde 1", "d": "Türkiye Devleti bir Cumhuriyettir."},
             {"t": "Madde 2 (Cumhuriyetin Nitelikleri)",
              "d": "Türkiye Cumhuriyeti; toplumun huzuru, milli dayanışma ve adalet anlayışı içinde, insan haklarına saygılı, Atatürk milliyetçiliğine bağlı, başlangıçta belirtilen temel ilkelere dayanan, demokratik, laik, sosyal ve bir hukuk devletidir."},
             {"t": "Madde 3 (Devletin Bütünlüğü)",
              "d": "Türkiye Devleti, ülkesi ve milletiyle bölünmez bir bütündür. Dili Türkçedir. Bayrağı beyaz ay yıldızlı al bayraktır. Milli marşı İstiklal Marşı'dır. Başkenti Ankara'dır."},
             {"t": "Madde 4", "d": "Anayasanın 1 inci maddesindeki Devletin şeklinin Cumhuriyet olduğu hakkındaki hüküm ile, 2 nci maddesindeki Cumhuriyetin nitelikleri ve 3 üncü maddesi hükümleri değiştirilemez ve değiştirilmesi teklif edilemez."},
         ]},
    ]
}


# ── 3. Devletin Temel Organları: Yasama, Yürütme, Yargı ──────────────────────
B3 = {
    "no": "3", "ad": "Devletin Temel Organları: Yasama, Yürütme ve Yargı", "etiket": "Kuvvetler Ayrılığı",
    "giris": "1982 Anayasası'na göre Yasama yetkisi TBMM'ye, Yürütme yetkisi Cumhurbaşkanına, Yargı yetkisi bağımsız ve tarafsız mahkemelere aittir.",
    "bloklar": [
        {"ad": "Yasama: Türkiye Büyük Millet Meclisi (TBMM)",
         "maddeler": [
             {"t": "Üye Sayısı ve Seçim Dönemi",
              "d": "TBMM <b>600 milletvekilinden</b> oluşur. Genel seçimler <b>5 yılda bir</b> Cumhurbaşkanı seçimiyle birlikte aynı gün yapılır. Seçilme yaşı <b>18</b>'dir."},
             {"t": "TBMM'nin Temel Görev ve Yetkileri",
              "d": "Kanun koymak, değiştirmek ve kaldırmak; bütçe ve kesinhesap kanun tekliflerini görüşmek ve kabul etmek; para basılmasına ve savaş ilanına karar vermek; milletlerarası antlaşmaların onaylanmasını uygun bulmak; genel ve özel af ilanına karar vermek (üye tamsayısının 3/5 çoğunluğu = 360 milletvekili gerekir)."},
             {"t": "TBMM Bilgi Edinme ve Denetim Yolları",
              "d": "<b>Yazılı Soru</b> (CB yardımcıları ve bakanlara yazılı sorulur, 15 günde cevaplanır), <b>Genel Görüşme</b>, <b>Meclis Araştırması</b>, <b>Meclis Soruşturması</b> (CB yardımcısı ve bakanların görev suçları için; 301 önerge, 360 komisyon, 400 Yüce Divan sevk). Gensoru ve Sözlü Soru 2017'de kaldırılmıştır."},
         ]},
        {"ad": "Yürütme: Cumhurbaşkanlığı",
         "maddeler": [
             {"t": "Cumhurbaşkanının Nitelikleri ve Seçimi",
              "d": "40 yaşını doldurmuş, yükseköğrenim mezunu, milletvekili seçilme yeterliliğine sahip Türk vatandaşları arasından halk tarafından 5 yıllığına seçilir. Bir kimse en fazla iki defa seçilebilir (İstisna: İkinci döneminde TBMM seçimleri yenilerse bir kez daha aday olabilir)."},
             {"t": "Aday Gösterme Şartları",
              "d": "Siyasi parti grupları (en az 20 milletvekili), en son genel seçimlerde geçerli oyların tek başına veya birlikte en az %5'ini almış siyasi partiler, veya <b>en az 100.000 seçmen</b> imza ile aday gösterebilir."},
             {"t": "Cumhurbaşkanlığı Kararnamesi (CBK)",
              "d": "Cumhurbaşkanı, yürütme yetkisine ilişkin konularda CBK çıkarabilir. Anayasanın ikinci kısmındaki 'Kişi Hakları' ve 'Siyasi Haklar' CBK ile düzenlenemez; yalnızca <b>Sosyal ve Ekonomik Haklar</b> düzenlenebilir (Olağanüstü Hal CBK'lerinde çekirdek haklar hariç tüm haklar sınırlandırılabilir)."},
         ]},
        {"ad": "Yargı Organları ve Yüksek Mahkemeler",
         "tablo": {
             "basliklar": ["Yüksek Mahkeme", "Üye Sayısı", "Seçen Makamlar", "Temel Görevi"],
             "satirlar": [
                 ["Anayasa Mahkemesi", "15 Üye", "12 Üye Cumhurbaşkanı, 3 Üye TBMM", "Kanunların/CBK'lerin anayasaya uygunluk denetimi, Bireysel Başvuru, Yüce Divan yargılamaları"],
                 ["Yargıtay", "Daire ve Genel Kurullar", "Üyelerini HSK seçer; Başsavcıyı CB seçer", "Adli yargının (hukuk ve ceza mahkemeleri) en üst temyiz mercidir"],
                 ["Danıştay", "Daire ve Genel Kurullar", "3/4'ünü HSK, 1/4'ünü Cumhurbaşkanı seçer", "İdari yargının (idare ve vergi mahkemeleri) en üst temyiz mercidir"],
                 ["Uyuşmazlık Mahkemesi", "1 Başkan + 12 Üye", "Başkanını Anayasa Mahkemesi kendi üyeleri arasından seçer", "Adli ve idari yargı mercileri arasındaki görev ve hüküm uyuşmazlıklarını çözer"],
             ]
         }},
    ]
}


# ── 4. İdare Hukuku ve Türkiye'nin İdari Teşkilatı ──────────────────────────
B4 = {
    "no": "4", "ad": "İdare Hukuku ve İdari Teşkilat Yapısı", "etiket": "İdare Hukuku",
    "giris": "Türkiye'nin idari yapısı; <b>merkezden yönetim</b> ve <b>yerinden yönetim</b> olmak üzere iki ana kola ayrılır.",
    "bloklar": [
        {"ad": "İdarenin Bütünlüğü ve Denetim Araçları",
         "maddeler": [
             {"t": "Hiyerarşi (Ast-Üst İlişkisi)",
              "d": "Aynı kamu tüzel kişiliği içerisindeki üstün asta emir ve talimat verme, işlemini değiştirme, iptal etme yetkisidir (Örnek: Bakan - Müsteşar, Vali - Kaymakam, Rektör - Dekan)."},
             {"t": "İdari Vesayet",
              "d": "Farklı kamu tüzel kişilikleri arasındaki denetimdir. Devlet tüzel kişiliğinin, yerinden yönetim kuruluşları üzerindeki kanunla sınırlı hukuka uygunluk denetimidir (Örnek: İçişleri Bakanı'nın belediye başkanını geçici uzaklaştırması, Valinin köy muhtarını denetlemesi)."},
             {"t": "Yetki Genişliği",
              "d": "Merkeze danışmadan merkez adına karar alabilme yetkisidir. Anayasamıza göre yetki genişliği <b>yalnızca Valilere</b> aittir (Kaymakamın yetki genişliği yoktur)."},
         ]},
        {"ad": "Türkiye'nin İdari Teşkilat Tablosu",
         "tablo": {
             "basliklar": ["Merkezden Yönetim (Başkent Teşkilatı)", "Merkezden Yönetim (Taşra Teşkilatı)", "Mahalli İdareler (Yerel Yerinden)", "Hizmet Yerinden Yönetim Kuruluşları"],
             "satirlar": [
                 ["Cumhurbaşkanlığı", "İl Genel İdaresi (Vali, İl İdare Şube Bşk, İl İdare Kurulu)", "İl Özel İdaresi (Vali, İl Genel Meclisi, İl Encümeni)", "Üniversiteler, YÖK, TÜBİTAK"],
                 ["Bakanlıklar", "İlçe İdaresi (Kaymakam, İlçe İdare Şube Bşk, İlçe İdare Kurulu)", "Belediye İdaresi (Belediye Başkanı, Belediye Meclisi, Belediye Encümeni)", "TRT, TCDD, Karayolları Genel Müd."],
                 ["Yardımcı Kuruluşlar (Danıştay, Sayıştay, MGK)", "Bucak İdaresi (Uygulamada kaldırıldı)", "Büyükşehir Belediyesi (Büyükşehir Bld Bşk, BB Meclisi, BB Encümeni)", "Meslek Kuruluşları (Barolar, Odalar, TOBB)"],
                 ["Cumhurbaşkanlığı Politika Kurulları", "Bölge Kuruluşları (GAP, DOKAP vb.)", "Köy İdaresi (Muhtar, İhtiyar Heyeti, Köy Derneği)", "Düzenleyici Kurullar (RTÜK, BDDK, SPK)"],
             ]
         }},
    ]
}

VERI = {
    "key": "vatandaslik",
    "baslik": "KPSS Orta Öğretim Vatandaşlık",
    "ders_adi": "Vatandaşlık",
    "aciklama": ACIKLAMA,
    "lead": LEAD,
    "giris": GIRIS,
    "not": NOT,
    "vurgu": VURGU,
    "bolumler": [B1, B2, B3, B4],
}
