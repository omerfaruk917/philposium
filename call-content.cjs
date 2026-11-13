function renderCall(T, title, roundLink, newsletter, resources = '') {
  const email = 'philposium@marmara.edu.tr';
  const marmara = T('Marmara Üniversitesi', 'Marmara University');
  const professor = 'Prof. Dr.';
  const associate = T('Doç. Dr.', 'Assoc. Prof.');
  const assistant = T('Dr. Öğr. Üyesi', 'Asst. Prof.');
  const research = T('Arş. Gör.', 'Res. Asst.');
  const advisory = [
    [assistant, 'Nurdane Şimşek Knoll'],
    [research, 'Bengisu Mete'],
    [research, 'Çağdaş Burak Karataş'],
  ];
  const scientific = [
    [assistant, 'Sümeyye Sel Odabaş', marmara, T('Başkan', 'Chair')],
    [professor, 'Emre Şan', T('İstanbul 29 Mayıs Üniversitesi', 'İstanbul 29 Mayıs University')],
    [professor, 'İshak Arslan', marmara],
    [professor, 'Mehmet Cüneyt Kaya', T('İstanbul Üniversitesi', 'İstanbul University')],
    [professor, 'Onur Kemal Bazarkaya', T('Marmara Üniversitesi, Alman Dili ve Edebiyatı Bölüm Başkanı', 'Marmara University, Head of the Department of German Language and Literature')],
    [associate, 'Erdal Yılmaz', marmara],
    [associate, 'Esra Kartal Soysal', T('Medeniyet Üniversitesi', 'Medeniyet University')],
    [associate, 'Göksel Yıkmış', marmara],
    [associate, 'Sinem Elkatip Hatipoğlu', marmara],
    [assistant, 'Abdullah Özkan', marmara],
    [assistant, 'Ali Sait Sadıkoğlu', marmara],
    [assistant, 'Fatma Karaismail', marmara],
    [assistant, 'Furkan Fidan', marmara],
    [assistant, 'Kadir Filiz', marmara],
    [assistant, 'Müge Kuyumcuoğlu Tütüncüoğlu', marmara],
    [research, 'Yusuf Bedir', marmara],
  ];
  const committeeList = members => `<ul class="committee-list">${members.map(([rank, name, affiliation, role]) =>
    `<li>${rank} ${name}${role ? ` <strong class="committee-role">${role}</strong>` : ''}${affiliation ? `<small>${affiliation}</small>` : ''}</li>`
  ).join('')}</ul>`;
  const dates = [
    [T('Çağrının ilanı', 'Call announcement'), '2026-11-13', T('13 Kasım 2026', '13 November 2026')],
    [T('Son başvuru', 'Submission deadline'), '2027-01-25', T('25 Ocak 2027', '25 January 2027')],
    [T('Kabul bildirimi', 'Notification of acceptance'), '2027-02-15', T('15 Şubat 2027', '15 February 2027')],
  ];
  const symposiumDates = `<time datetime="2027-04-20">20</time>–<time datetime="2027-04-21">${T('21 Nisan 2027', '21 April 2027')}</time>`;

  return `<article class="page layout call-page">
    <header class="page-heading call-heading">
      <p class="call-edition">Philposium \'27</p>
      <h1>${title}</h1>
      <p>${T('Marmara Üniversitesi Lisans Felsefe Sempozyumu', 'Marmara University Undergraduate Philosophy Symposium')}</p>
    </header>
    <div class="call-layout">
      <aside class="call-facts" aria-labelledby="call-calendar">
        <h2 id="call-calendar">${T('Takvim', 'Key dates')}</h2>
        <dl class="call-dates">
          ${dates.map(([label, date, display]) => `<div><dt>${label}</dt><dd><time datetime="${date}">${display}</time></dd></div>`).join('')}
          <div><dt>Philposium</dt><dd>${symposiumDates}</dd></div>
        </dl>
        <p class="call-venue">${T('Yüz yüze', 'In person')}<br>${T('Marmara Üniversitesi Göztepe Kampüsü, Fen-Edebiyat Fakültesi Konferans Salonu', 'Faculty of Arts and Sciences Conference Hall, Marmara University, Göztepe Campus')}</p>
        ${roundLink('#kaynaklar', T('Kaynaklar', 'Resources'))}
        ${roundLink('#basvuru', T('Başvuru bilgileri', 'How to submit'))}
      </aside>
      <div class="prose call-body">
        <p>${T('Marmara Üniversitesi Felsefe Bölümü, Philposium \'27 için lisans öğrencilerini araştırmalarını sunmaya ve tartışmaya davet ediyor. Sempozyum, felsefenin tüm alanlarına açık ve belirli bir temayla sınırlı değil. Açık bir felsefi soru, argüman veya analitik çözümleme ortaya koyan disiplinlerarası çalışmalar da değerlendirmeye alınır.', 'The Department of Philosophy at Marmara University invites undergraduate students to present and discuss their research at Philposium \'27. The symposium welcomes work in all areas of philosophy, with no set theme. Interdisciplinary work is welcome when it poses a clear philosophical question, advances a philosophical argument or offers critical analysis.')}</p>
        <section>
          <h2>${T('Kimler başvurabilir?', 'Who can apply?')}</h2>
          <p>${T('Türkiye’den ve yurt dışından tüm lisans öğrencileri başvurabilir. Sempozyum dilleri Türkçe ve İngilizcedir.', 'Undergraduate students in Türkiye and abroad are eligible to apply. The symposium will be held in Turkish and English.')}</p>
        </section>
        <section>
          <h2>${T('Bildiri özeti', 'Abstract requirements')}</h2>
          <ul>
            <li>${T('Özeti Türkçe veya İngilizce yazın. Uzunluğu <strong>300–500 kelime</strong> olmalı.', 'Write <strong>300–500 words</strong> in Turkish or English.')}</li>
            <li>${T('Çalışmanın içeriğini yansıtan bir başlık kullanın. Araştırma sorunuzu, temel tezinizi ve ana argümanlarınızı açıkça belirtin.', 'Use a title that reflects the content and clearly state your research question, main thesis and principal arguments.')}</li>
            <li>${T('Kör değerlendirme için ek dosyadan adınızı ve kimliğinizi açığa çıkarabilecek diğer bilgileri kaldırın.', 'For blind review, remove your name and any other identifying information from the attached file.')}</li>
            <li>${T('Başvuru için özet yeterlidir.', 'Only an abstract is required at the application stage.')}</li>
          </ul>
        </section>
        <section class="call-application" id="basvuru">
          <h2>${T('Başvuru ve iletişim', 'Application and contact')}</h2>
          <p>${T('E-postanızda bildiri başlığını, 3–5 anahtar kelimeyi, adınızı ve soyadınızı, üniversitenizi, bölümünüzü, sınıfınızı ve e-posta adresinizi belirtin. Anonim bildiri özetini dosya olarak ekleyin.', 'Include the paper title, 3–5 keywords, your full name, university, department, year of study and email address in your message. Attach the anonymised abstract as a file.')}</p>
          <p>${T('Başvuruları ve soruları bu adrese iletebilirsiniz.', 'Send submissions and questions to this address.')}</p>
          ${roundLink(`mailto:${email}`, email)}
        </section>
        <section>
          <h2>${T('Değerlendirme', 'Review')}</h2>
          <p>${T('Bilim Kurulu yalnızca anonim özetleri görür. Felsefi içerik, argümanların açıklığı ve tutarlılığı, özgünlük ve akademik yeterlilik değerlendirmede esas alınır.', 'The Scientific Committee receives only anonymised abstracts. It assesses philosophical content, clarity and coherence of argument, originality and academic competence.')}</p>
        </section>
        <section>
          <h2>${T('Sunum', 'Presentation')}</h2>
          <p>${T('Her bildiri için 15 dakika sunum ve ardından 10 dakika soru-cevap ve tartışma ayrılır.', 'Each paper is allotted 15 minutes for presentation, followed by 10 minutes for questions and discussion.')}</p>
        </section>
        <section>
          <h2>${T('Yayın imkânı', 'Publication opportunity')}</h2>
          <p>${T('Yazarların isteğine bağlı olarak, sempozyumda sunulan bildirilerin tam metinleri Marmara Üniversitesi Felsefe Bölümü öğrencilerinin çıkardığı <a href="https://www.ufukfelsefedergisi.com/hakkimizda">Ufuk Felsefe Dergisi</a>’nde yayımlanmak üzere değerlendirilebilir.', 'At the authors’ discretion, full versions of papers presented at the symposium may be considered for publication in <a href="https://www.ufukfelsefedergisi.com/hakkimizda">Ufuk Felsefe Dergisi</a>, a journal published by philosophy students at Marmara University.')}</p>
        </section>
        <section>
          <h2>${T('Kurullar', 'Committees')}</h2>
          <details class="call-committee"><summary>${T('Düzenleme Kurulu', 'Organising Committee')}</summary><p>${T('Philposium Öğrenci Düzenleme Ekibi', 'Philposium Student Organising Team')}</p></details>
          <details class="call-committee"><summary>${T('Danışma Kurulu', 'Advisory Committee')}</summary>${committeeList(advisory)}</details>
          <details class="call-committee"><summary>${T('Bilim Kurulu', 'Scientific Committee')}</summary>${committeeList(scientific)}</details>
        </section>
      </div>
    </div>
    <section id="kaynaklar" aria-labelledby="call-resources-title" style="scroll-margin-top: 6rem; margin-top: 4rem">
      <h2 id="call-resources-title">${T('Kaynaklar', 'Resources')}</h2>
      ${resources}
    </section>
  </article>
  <div class="layout call-newsletter">${newsletter}</div>`;
}

module.exports = { renderCall };
