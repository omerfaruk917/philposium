const fs = require('node:fs');
const path = require('node:path');

global.window = {};
require('./gallery-data.js');
const { philGallery } = window;
const { selections, ufuk, issue } = require('./blog-data.js');
const { renderGuide } = require('./guide-content.cjs');
const { renderCall } = require('./call-content.cjs');

const routes = {
  home: ['index.html', 'en/index.html', 'Ana sayfa', 'Home'],
  about: ['hakkinda.html', 'en/about.html', 'Bizi Tanıyın', 'About Us'],
  team: ['hakkinda/takim.html', 'en/about/team.html', 'Takım', 'Team'],
  call: ['2027-bildiri-cagrisi.html', 'en/2027-call-for-papers.html', '2027 Bildiri Çağrısı', '2027 Call for Papers'],
  gallery: ['galeri.html', 'en/gallery.html', 'Philposium Galerisi', 'Philposium Gallery'],
  blog: ['blog.html', 'en/blog.html', 'Seçmeler', 'Selections'],
  resources: ['arsiv/kaynaklar.html', 'en/archive/resources.html', 'Kaynaklar', 'Resources'],
  guide: ['arsiv/akademik-yazim-kilavuzu.html', 'en/archive/academic-writing-guide.html', 'Akademik Yazım Kılavuzu', 'Academic Writing Guide'],
  archive: ['arsiv.html', 'en/archive.html', 'Arşiv', 'Archive'],
  contact: ['iletisim.html', 'en/contact.html', 'İletişim', 'Contact'],
  map: ['site-haritasi.html', 'en/sitemap.html', 'Site Haritası', 'Sitemap'],
};

const symbols = {
  home: '<path d="m3.5 10 6.8-5.8a2.6 2.6 0 0 1 3.4 0l6.8 5.8M6 8.5v10A2.5 2.5 0 0 0 8.5 21h7a2.5 2.5 0 0 0 2.5-2.5v-10M10 21v-4a2 2 0 0 1 4 0v4"/>',
  about: '<circle cx="12" cy="12" r="7"/><ellipse cx="12" cy="12" rx="10.7" ry="4.2" transform="rotate(-34 12 12)"/>',
  gallery: '<rect x="5.5" y="3.5" width="13" height="17" rx="3" transform="rotate(12 12 12)"/><path d="M5 5.5H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2m4-3 3.5-3.5 4 4.5m-2.3-7.4h.01"/>',
  blog: '<path d="M5 4h10a3 3 0 0 1 3 3v13H7a3 3 0 0 1-3-3V5a1 1 0 0 1 1-1Zm-1 13a3 3 0 0 1 3-3h11M8 8h6m-6 3h4"/>',
  contact: '<rect x="3.5" y="5.5" width="17" height="13" rx="3"/><path d="m4.5 7 6 5a2.4 2.4 0 0 0 3 0l6-5"/>',
  right: '<path d="M4.5 12h14m-5.5-5.5 5.5 5.5-5.5 5.5"/>',
  diag: '<path d="M6 18 18 6M7.5 6H18v10.5"/>',
  up: '<path d="M12 19V5m-6 6 6-6 6 6"/>',
  left: '<path d="M19.5 12h-14M11 6.5 5.5 12l5.5 5.5"/>',
  close: '<path d="m6 6 12 12M18 6 6 18"/>',
};
const escape = value => String(value).replace(/[&<>"']/g, character => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
})[character]);

function render(page, lang) {
  const en = lang === 'en';
  const index = en ? 1 : 0;
  const T = (tr, english) => en ? english : tr;
  const filename = routes[page][index];
  const prefix = '../'.repeat(filename.split('/').length - 1);
  const url = name => prefix + routes[name][index];
  const asset = name => prefix + name;
  const label = name => escape(routes[name][index + 2]);
  const home = page === 'home';
  const withGallery = home || page === 'gallery';
  const withForms = home || page === 'contact' || page === 'call';
  const active = page === 'team' ? 'about' : ['archive','resources','guide'].includes(page) ? 'blog' : page === 'map' ? 'contact' : page;
  const icon = name => `<svg aria-hidden="true"><use href="#i-${name}"/></svg>`;
  const link = name => `<a href="${url(name)}">${label(name)}</a>`;
  const roundLink = (href, title) => `<a class="round-link" href="${href}"><span class="round-link__arrow">${icon('right')}</span><span>${title}</span></a>`;
  const wordmark = `<a class="wordmark" href="${url('home')}" aria-label="Philposium · ${label('home')}"><img src="${asset('design/phil-logo-text.svg')}" width="415" height="93" alt="Philposium"></a>`;
  const language = `<a class="language-link" href="${prefix + routes[page][1-index]}" hreflang="${T('en','tr')}" lang="${T('en','tr')}" aria-label="${T('English','Türkçe')}">${T('EN','TR')}</a>`;
  const masthead = `<header class="masthead layout">${wordmark}
    <nav class="masthead__nav" aria-label="${T('Ana menü','Main menu')}">${['about','gallery','blog','contact'].map(link).join('')}</nav>
    <div class="masthead__actions"><a class="call-link" href="${url('call')}"${page === 'call' ? ' aria-current="page"' : ''}>${label('call')}${icon('diag')}</a>${language}</div>
  </header>`;
  const dockPages = ['home','about','gallery','blog','contact'];
  const activeIndex = dockPages.indexOf(active);
  const dock = `<nav class="dock" aria-label="${T('Bölümler','Sections')}" style="--active:${Math.max(0,activeIndex)}">
    <div class="dock__drop" aria-hidden="true"${activeIndex < 0 ? ' hidden' : ''}></div>
    ${dockPages.map(item => `<a href="${url(item)}" aria-label="${label(item)}"${item === active ? ` aria-current="${item === page ? 'page' : 'location'}"` : ''}>${icon(item)}<span>${item === 'gallery' ? T('Galeri','Gallery') : label(item)}</span></a>`).join('')}
  </nav>`;
  const footer = `<footer class="closing">
    <div class="site-footer layout">${wordmark}<nav aria-label="${T('Alt menü','Footer menu')}">${['call','archive','contact','map'].map(link).join('')}</nav>
    <a class="circle-button" href="#top" aria-label="${T('Başa dön','Back to top')}">${icon('up')}</a></div>
    ${home ? '<div class="wormhole"><canvas aria-hidden="true"></canvas></div>' : ''}
  </footer>`;
  const heading = (title, lead = '') => `<header class="page-heading"><h1>${title}</h1>${lead ? `<p>${lead}</p>` : ''}</header>`;
  const gallery = `<div class="orbit"><div class="orbit__viewport" aria-label="${T('Görsel galeri','Visual gallery')}"><div class="orbit__stage"><div class="sphere">
    ${philGallery.map((item, i) => `<div class="item"><a class="item__image" href="${asset(item.src)}" data-picture="${i}" data-artist="${escape(item.artist || '')}" data-source="${escape(item.source)}"><img src="${asset(item.thumb)}" alt="${escape(item.title[lang])}" loading="lazy" draggable="false"></a></div>`).join('\n')}
    </div></div></div><div class="orbit__controls" hidden>
    <button class="circle-button" type="button" data-orbit-step="1" aria-label="${T('Galeriyi sola çevir','Rotate gallery left')}">${icon('left')}</button>
    <button class="circle-button" type="button" data-orbit-step="-1" aria-label="${T('Galeriyi sağa çevir','Rotate gallery right')}">${icon('right')}</button></div></div>`;
  const lightbox = `<dialog class="lightbox" aria-labelledby="lightbox-title">
    <div class="lightbox__art"><img alt=""></div>
    <div class="lightbox__info"><div><h2 id="lightbox-title"></h2><p class="lightbox__caption"></p>
    <a class="lightbox__source" hidden>${T('Eser kaydı','Artwork record')} ${icon('diag')}</a></div>
    <div class="lightbox__steps">
    <button class="circle-button" type="button" data-detail-step="-1" aria-label="${T('Önceki görsel','Previous image')}">${icon('left')}</button>
    <button class="circle-button" type="button" data-detail-step="1" aria-label="${T('Sonraki görsel','Next image')}">${icon('right')}</button></div></div>
    <form method="dialog"><button class="circle-button lightbox__close" aria-label="${T('Görseli kapat','Close image')}" autofocus>${icon('close')}</button></form></dialog>`;

  function form(kind) {
    const contact = kind === 'contact';
    const configured = process.env[contact ? 'PHILPOSIUM_CONTACT_ENDPOINT' : 'PHILPOSIUM_NEWSLETTER_ENDPOINT'];
    const useBuiltInForms = process.env.PHILPOSIUM_LOCAL_FORMS === '1' || process.env.WORKERS_CI === '1';
    const endpoint = configured || (useBuiltInForms ? '/api/' + kind : '');
    return `<form class="phil-form" data-phil-form="${kind}" method="post"${endpoint ? ` data-endpoint="${escape(endpoint)}"` : ''}>
      ${contact ? `<p class="form-notice">${T('Aklınıza takılan her şeyi sorabilirsiniz, özgür olun', 'Feel free to ask us anything.')}</p>` : ''}
      ${contact ? `<label>${T('Adınız','Name')}<input name="name" autocomplete="name" maxlength="120" required></label>` : ''}
      <label>${T('E-posta adresiniz','Email address')}<input type="email" name="email" autocomplete="email" maxlength="254" required></label>
      ${contact ? `<label>${T('Mesajınız','Message')}<textarea name="message" rows="5" maxlength="3000" required></textarea></label>` : ''}
      <button class="confetti-button" type="submit" disabled>${contact ? T('Mesaj gönder','Send message') : T('Abone ol','Subscribe')}</button>
      <p class="form-status" data-form-status role="status" aria-live="polite"></p>
    </form>`;
  }

  const intro = T('Philposium, Marmara Üniversitesi Felsefe öğrencilerinin yürüttüğü bir lisans felsefe sempozyumu.', 'Philposium is an undergraduate philosophy symposium run by philosophy students at Marmara University.');
  const selectionIntro = T('Ufuk Felsefe Dergisi’nden yazılar.', 'Articles in Turkish from Ufuk Felsefe Dergisi.');
  const newsletter = `<section class="newsletter" id="eposta"><h2>${T('E-posta listesi','Mailing list')}</h2><p>${T('Bildiri çağrıları, program ve yeni yazılar için.','For calls for papers, programmes and new writing.')}</p>${form('newsletter')}</section>`;
  const contactLinks = `<nav class="related-links" aria-label="${T('Diğer bağlantılar','Other links')}">${['map','call','archive'].map(link).join('')}</nav>`;
  const contactChannels = `<nav class="related-links" aria-label="${T('İletişim kanalları','Contact channels')}">
    <a href="mailto:support@philposium.com">support@philposium.com</a>
    <a href="https://www.instagram.com/philposium/">Instagram</a>
    <a href="https://x.com/philposium">X</a>
  </nav>`;

  function selectionCard(item) {
    const credit = item.translator ? T(`Çeviri: ${item.translator}`, `Translation: ${item.translator}`) : '';
    return `<li class="selection-card"><a href="${escape(item.href)}" hreflang="tr">
      <span class="selection-card__title" lang="tr">${escape(item.title)}</span>
      <span class="selection-card__credit">${escape(item.author)}${credit ? `<br>${escape(credit)}` : ''}</span>
      <span class="selection-card__read">${T('Ufuk’ta oku','Read on Ufuk')} ${icon('diag')}</span>
    </a></li>`;
  }
  const selectionList = items => `<ol class="selection-list" role="list">${items.map(selectionCard).join('')}</ol>`;

  function renderResources() {
    const documents = [
      [T('Akademik Metin Yazım Kılavuzu · Türkçe', 'Academic Writing Guide · Turkish'), '1ZqGwjig_aBDCAksW7xuo5gB6-z03pIcA'],
      [T('Bildiri Çağrısı · Türkçe', 'Call for Papers · Turkish'), '1IaO0GxXxHcGal2M6a35NXMp6F26-s5rH'],
      ['Call for Papers · English', '1EhnIIRQxZxuId6hH-bGrT70m6AEvqW-S'],
    ];
    return `
      <div class="resource-tabs" role="tablist" aria-label="${label('resources')}">
        <button id="documents-tab" role="tab" aria-selected="true" aria-controls="documents-panel" tabindex="0">${T('Belgeler','Documents')}</button>
        <button id="media-tab" role="tab" aria-selected="false" aria-controls="media-panel" tabindex="-1">${T('Medya','Media')}</button>
      </div>
      <section id="documents-panel" role="tabpanel" aria-labelledby="documents-tab" tabindex="0">
        <div class="resource-list">${documents.map(([title,id]) => roundLink('https://drive.google.com/file/d/'+id+'/view',title)).join('')}</div>
        <nav class="related-links">${roundLink(url('guide'),T('Yazım kılavuzunu sitede oku','Read the writing guide online'))}</nav>
      </section>
      <section id="media-panel" role="tabpanel" aria-labelledby="media-tab" tabindex="0" hidden>${roundLink(url('gallery'),label('gallery'))}</section>`;
  }
  let content;
  if (home) {
    content = `<section class="opening" aria-label="Philposium"><div class="opening__pin"><div class="opening__track">
      <div class="spread cover">${masthead}
        <div class="cover__body"><div class="cover__type">
          <h1>${T('Felsefe<br> <em>sempozyumu</em>','Philosophy<br> <em>symposium</em>')}</h1><div class="cover__rule"></div>
          ${roundLink('#hakkinda',label('about'))}
        </div>
        <figure class="cover__art">
          <svg class="cover__illustration" viewBox="0 0 960 1440" width="960" height="1440" role="img" aria-label="${T('Bloklardan oluşan merdivenler, sütunlar, kitaplar ve kuşlar', 'Stairs, columns, books and birds made from blocks')}">
            <defs><filter id="cover-bend" x="-5%" y="-5%" width="110%" height="110%">
              <feTurbulence type="fractalNoise" baseFrequency=".0015 .001" numOctaves="1" seed="6" result="warp"/>
              <feDisplacementMap in="SourceGraphic" in2="warp" scale="0" xChannelSelector="R" yChannelSelector="G"/>
            </filter></defs>
            <image href="${asset('assets/art/philposium-cover.webp')}" width="960" height="1440"/>
          </svg>
        </figure></div>
      </div>
      <section class="spread interlude" id="hakkinda" aria-labelledby="interlude-title"><div class="interlude__body about-surface layout"><div class="interlude__type">
        <h2 id="interlude-title">${label('about')}</h2><p>${intro}</p>${roundLink(url('about'),T('Philposium hakkında','About Philposium'))}
        </div></div></section>
      </div></div></section>
      <section id="medya" class="gallery layout" aria-labelledby="gallery-title"><header class="section-head section-head--link"><h2 id="gallery-title">${label('gallery')}</h2>${roundLink(url('gallery'),T('Galeriye git','Open gallery'))}</header>${gallery}</section>
      <section id="arsiv" class="home-blog layout"><header class="section-head section-head--link"><h2>${label('blog')}</h2>${roundLink(url('blog'),T('Tüm yazılar','All articles'))}</header>${selectionList(selections.slice(0, 3))}</section>
      <section id="iletisim" class="home-contact layout"><div><h2>${label('contact')}</h2>${roundLink(url('contact'),T('İletişim formu','Contact form'))}${contactChannels}${contactLinks}</div>${newsletter}</section>`;
  } else if (page === 'about') {
    content = `<div class="page about-surface layout"><div>${heading(label(page))}
      <div class="prose"><p>${intro}</p><p>${T('Sempozyum, lisans öğrencilerini araştırmalarını sunmak ve birbirlerinin çalışmalarını tartışmak üzere bir araya getirir.', 'The symposium brings undergraduate students together to present their research and discuss one another’s work.')}</p>
      <nav class="related-links" aria-label="${T('Bizi Tanıyın bağlantıları','About Us links')}">${link('team')}${link('call')}${link('contact')}</nav></div></div></div>`;
  } else if (page === 'team') {
    content = `<div class="page layout"><nav class="breadcrumb" aria-label="${T('Sayfa yolu','Breadcrumb')}">${link('about')} / ${label(page)}</nav>${heading(label(page),intro)}
      <div class="prose"><p>${T('Öğrenci ekibi, sempozyumun programını, bildiri sürecini ve etkinlik iletişimini yürütür.', 'The student team coordinates the programme, the paper submission process and event communications.')}</p>${roundLink(url('contact'),T('Ekibe ulaşın','Contact the team'))}</div></div>`;
  } else if (page === 'call') {
    content = renderCall(T, label(page), roundLink, newsletter, renderResources());
  } else if (page === 'gallery') {
    content = `<div class="page layout">${heading(label(page))}${gallery}</div>`;
  } else if (page === 'blog') {
    content = `<div class="page layout">${heading(label(page),selectionIntro)}
      ${selectionList(selections)}
      <nav class="related-links" aria-label="${T('Seçmeler bağlantıları','Selections links')}">${link('archive')}<a href="${ufuk}" hreflang="tr">Ufuk Felsefe Dergisi</a></nav></div>`;
  } else if (page === 'archive') {
    content = `<div class="page layout">${heading(label(page))}<section class="prose">
      <h2>Ufuk Felsefe Dergisi</h2><nav class="related-links" aria-label="${T('Arşiv bağlantıları','Archive links')}">
      ${link('resources')}${link('blog')}<a href="${issue}" hreflang="tr">${T('Dergiyi oku','Read the issue')}</a></nav></section></div>`;
  } else if (page === 'resources') {
    content = `<div class="page layout"><nav class="breadcrumb">${link('archive')} / ${label(page)}</nav>${heading(label(page))}${renderResources()}</div>`;
  } else if (page === 'guide') {
    content = `<article class="page layout"><nav class="breadcrumb">${link('archive')} / ${link('resources')}</nav>${heading(label(page))}<div class="prose">${renderGuide(lang)}</div></article>`;
  } else if (page === 'contact') {
    content = `<div class="page layout">${heading(label(page))}<div class="page-split"><section><h2>${T('Mesaj gönder','Send a message')}</h2>${form('contact')}${contactChannels}</section>${newsletter}</div>${contactLinks}</div>`;
  } else if (page === 'map') {
    content = `<div class="page layout">${heading(label(page))}<ul class="site-map">
      ${['home','about','call','gallery','blog','archive','resources','guide','contact','map'].map(name => `<li>${link(name)}${name === 'about' ? `<ul><li>${link('team')}</li></ul>` : ''}</li>`).join('')}</ul></div>`;
  }

  const loader = `<div class="loader" hidden>
    <div class="loader__bird"><img src="${asset('design/phil-logo-kiwi.svg')}" width="163" height="126" alt=""></div>
    <div class="loader__rule" aria-hidden="true"></div>
    <div class="loader__fact"><strong>${T('Biliyor muydunuz?','Did you know?')}</strong><p></p></div>
    <button class="loader__skip" type="button">${T('Geç','Skip')}</button>
  </div>`;
  const scripts = [
    ...(home ? ['design/kiwi-loader/lottie-light.min.js','design/kiwi-loader/kiwi-loader.js'] : []),
    'site.js', 'pointer-fluid.js',
    ...(withGallery ? ['assets/vendor/hammer.min.js','orbital.js'] : []),
    ...(withForms ? ['forms.js'] : []),
  ];
  return `<!doctype html>
<html lang="${lang}">
<head>
  <meta charset="utf-8">
  <script>
    (() => {
      // An English URL is an explicit choice, even on the first visit.
      if (document.documentElement.lang === 'en') {
        try { sessionStorage.setItem('philposium:language-initialized', '1'); } catch {}
        return;
      }
      // Detect only on the initial default-language entry.
      try {
        if (sessionStorage.getItem('philposium:language-initialized')) return;
        sessionStorage.setItem('philposium:language-initialized', '1');
      } catch {
        // Keep language links usable when browser storage is unavailable.
        return;
      }
      const language = navigator.language.toLowerCase().startsWith('tr') ? 'tr' : 'en';
      if (language !== document.documentElement.lang) {
        location.replace(${JSON.stringify(prefix + routes[page][1-index])} + location.search + location.hash);
      }
    })();
  </script>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="#efe9d3">
  <meta name="description" content="${escape(page === 'blog' ? selectionIntro : intro)}">
  <title>${home ? `Philposium · ${T('Felsefe Sempozyumu','Philosophy Symposium')}` : `${label(page)} · Philposium`}</title>
  <link rel="icon" href="${asset('design/phil-logo-kiwi.svg')}" type="image/svg+xml">
  <link rel="alternate" hreflang="${T('en','tr')}" href="${prefix + routes[page][1-index]}">
  <link rel="stylesheet" href="${asset('site.css')}">
  ${withForms ? `<link rel="stylesheet" href="${asset('forms.css')}">` : ''}
  ${scripts.map(src => `<script src="${asset(src)}" defer></script>`).join('\n  ')}
</head>
<body id="top" class="${home ? 'home-page' : 'inner-page'}">
  <canvas class="pointer-fluid" aria-hidden="true"></canvas>
  <svg class="symbols" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${Object.entries(symbols).map(([name,shape]) => `<symbol id="i-${name}" viewBox="0 0 24 24">${shape}</symbol>`).join('')}</svg>
  <a href="#ana" class="skip">${T('İçeriğe geç','Skip to content')}</a>
  ${home ? loader : masthead}
  ${dock}
  <main id="ana" tabindex="-1">${content}</main>
  ${footer}
  ${withGallery ? lightbox : ''}
</body>
</html>
`;
}

for (const name of Object.keys(routes)) {
  for (const [index, lang] of ['tr', 'en'].entries()) {
    const filename = routes[name][index];
    const html = render(name, lang);
    for (const root of ['.', 'dist']) {
      const target = path.join(root, filename);
      fs.mkdirSync(path.dirname(target), { recursive: true });
      fs.writeFileSync(target, html);
    }
  }
}

// Keep the public shortcut tied to the current call rather than a specific year.
const callTarget = `../${escape(routes.call[0])}`;
const callRedirect = `<!doctype html>
<html lang="tr">
<head>
  <meta charset="utf-8">
  <meta http-equiv="refresh" content="0; url=${callTarget}">
  <link rel="canonical" href="${callTarget}">
  <title>Bildiri Çağrısı · Philposium</title>
</head>
<body><a href="${callTarget}">Bildiri çağrısına git</a></body>
</html>
`;
for (const root of ['.', 'dist']) {
  const directory = path.join(root, 'cfa');
  fs.mkdirSync(directory, { recursive: true });
  fs.writeFileSync(path.join(directory, 'index.html'), callRedirect);
}

// Keep bookmarks to the former sample articles pointed at their replacement.
for (const folder of ['blog', 'en/blog']) {
  for (const slug of ['duran-saat', 'kusur-ve-sonuc', 'bir-imge-neye-taniklik-eder']) {
    const title = folder === 'blog' ? 'Seçmeler' : 'Selections';
    const lang = folder === 'blog' ? 'tr' : 'en';
    const html = `<!doctype html><html lang="${lang}"><meta charset="utf-8"><meta http-equiv="refresh" content="0; url=../blog.html"><title>${title} · Philposium</title><a href="../blog.html">${title}</a></html>
`;
    for (const root of ['.', 'dist']) {
      fs.mkdirSync(path.join(root, folder), { recursive: true });
      fs.writeFileSync(path.join(root, folder, `${slug}.html`), html);
    }
  }
}
