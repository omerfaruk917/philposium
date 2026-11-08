# Philposium

Siteyi tarayıcıda açmak için `index.html` dosyasını kullanın. Türkçe ve İngilizce sayfalar ayrı HTML dosyalarıdır.

```sh
python3 serve.py
```

Sayfalar `site-pages.cjs`, blog yazıları `blog-data.js`, galeri eserleri `gallery-data.js` dosyalarından üretilir. Değişiklikten sonra `sh build.sh` komutunu çalıştırın. Site haritası `site-haritasi.html` dosyasında.

Yerel sunucu e-posta listesi ve mesajları `local-data/philposium.sqlite3` dosyasında saklar. HTML doğrudan açıldığında formlar deneme modundadır. Harici gönderim için derleme sırasında `PHILPOSIUM_CONTACT_ENDPOINT` ve `PHILPOSIUM_NEWSLETTER_ENDPOINT` değişkenlerine CORS üzerinden multipart POST kabul eden HTTPS adresleri verin. Adresler tarayıcıya gönderilen HTML’de görünür.

- [Orbital photo gallery](https://codepen.io/paulnoble/pen/vENXprg), Paul Noble, MIT. Yerel fork `orbital.js` içinde.
- [Wormhole](https://codepen.io/wodniack/pen/XJbYWXx), Antoine Wodniack.
- [Confirm confetti button](https://codepen.io/aaroniker/pen/bGVGNrV), Aaron Iker.
- Galeri eserleri [The Met Open Access](https://www.metmuseum.org/hubs/open-access) koleksiyonundan, CC0.
