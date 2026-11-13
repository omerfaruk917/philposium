# Philposium

Marmara Üniversitesi Felsefe //Düzenleyeceğimiz sempozyum için geliştirdiğim site.

```sh
python3 serve.py
```

Sayfalar `site-pages.cjs`, blog yazıları `blog-data.js`, galeri eserleri `gallery-data.js` dosyalarından build edilir. Değişiklikten sonra `sh build.sh` komutunu çalıştırmalısınız. Site haritası: `site-haritasi.html`

Yerel sunucu mail listesi ve mesajları `local-data/philposium.sqlite3` dosyasında saklar. Cloudflare Workers formları `worker.mjs` içindeki `/api/contact` ve `/api/newsletter` yollarına bağlar. Gönderimleri Cloudflare panelindeki **D1 → philposium-forms** veritabanında `messages` ve `subscribers` tablolarından okunabiliyor. Tablolar ilk başarılı gönderimde oluşur. İletişim formu kayıt oluşturur. mail bildirimi ve bülten gönderimi başka iş. Farklı hizmet kullanmanız lazım. 

Başka bir form hizmeti kullanmak için derleme sırasında `PHILPOSIUM_CONTACT_ENDPOINT` ve `PHILPOSIUM_NEWSLETTER_ENDPOINT` değişkenlerine CORS üzerinden multipart POST kabul eden HTTPS adresleri verin. Adresler htmlde görünür.

- [Orbital photo gallery](https://codepen.io/paulnoble/pen/vENXprg), Paul Noble, MIT. Yerel fork `orbital.js` içinde.
- Galeri eserleri [The Met Open Access](https://www.metmuseum.org/hubs/open-access) koleksiyonundan, CC0.
