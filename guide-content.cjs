'use strict';

// Adapted from the user-provided Akademik Metin Yazım Kılavuzu (two pages).
// English is a translation of the Turkish guide; examples retain their original titles.
const sections = [
  ['Akademik Metin Nedir?', 'What Is Academic Writing?',
    'Bilimsel yöntemle üretilmiş ve amacı bilgi üretmek, bir problemi çözmek veya mevcut bilgiyi eleştirel biçimde değerlendirmek olan kanıta dayalı yazılı çalışmadır.',
    'Academic writing is evidence-based written work produced through scholarly methods, with the aim of generating knowledge, solving a problem or critically evaluating existing knowledge.',
    [
      ['Amaçlı: Bir sorunu ortaya koymak veya bir problemi çözmek amacıyla yazılır.', 'Purpose: It is written to identify an issue or solve a problem.'],
      ['Nesnellik: Ortaya konulan iddialar yazarın öznel yargılarından olabildiğince arındırılmış olmalıdır.', 'Objectivity: Claims should be as free as possible from the author’s subjective judgements.'],
      ['Tutarlılık: Metindeki argümanlar, sunulan kanıtlar ve verilen referanslar bir bütünlük içerisinde olmalıdır.', 'Coherence: The arguments, evidence and references should form a coherent whole.'],
      ['Doğrulanabilirlik: Yazarın iddiaları için verdiği referanslar doğrulanabilir olmalıdır.', 'Verifiability: The references supporting the author’s claims must be verifiable.'],
      ['Özgünlük: Metin, ele aldığı probleme ilişkin bağımsız ve eleştirel bir değerlendirme sunmalı; mevcut görüşleri yalnızca aktarmakla yetinmeyip bunlar arasında anlamlı ilişkiler kurabilmelidir.', 'Originality: The text should offer an independent, critical assessment of the problem it addresses. It should go beyond reporting existing views and establish meaningful connections between them.'],
    ]
  ],
  ['Konu Seçimi ve Problem Tanımlama', 'Choosing a Topic and Defining a Research Problem', '', '', [
    ['Seçilen konu ile ilişkili erişilebilir kaynak bulunmalıdır.', 'Accessible sources relevant to the chosen topic should be available.'],
    ['Seçilen konular daraltılmalıdır. Örneğin, “Antik Yunan’da mit ve felsefe ilişkisi” gibi bir başlık yerine “Homer’in metinlerinde felsefi düşüncenin izleri” gibi bir başlık seçilmelidir.', 'Topics should be narrowed down. For example, choose a title such as “Traces of Philosophical Thought in Homer’s Texts” rather than “The Relationship between Myth and Philosophy in Ancient Greece”.'],
    ['Araştırma sorusu açık ve tek cümleyle yazılmalıdır.', 'State the research question clearly in a single sentence.'],
    ['Konunun alana katkısı düşünülmelidir: Neden önemli? Hangi probleme çözüm olanağı sağlıyor?', 'Consider the topic’s contribution to the field: Why does it matter? What problem might it help resolve?'],
    ['Başlık ve içerik uyumu kesinlikle gözden geçirilmelidir. Başlığın, metnin yönünü ve problematik yapısını yansıtması gerekir.', 'Check that the title matches the content. It should reflect the direction of the text and the problem it examines.'],
  ]],
  ['Kaynak Taraması ve Referanslar', 'Literature Search and References', '', '', [
    ['Araştırmanın konusu ve yöntemi gerektiriyorsa birincil kaynaklara doğrudan başvurulmalı, ikincil literatür eleştirel biçimde değerlendirilmelidir.', 'Consult primary sources directly where the research topic and method require it, and critically evaluate the secondary literature.'],
    ['İkincil kaynaklar için akademik makaleler ve bir filozof veya o filozofun bir eseri üzerine yazılan inceleme metinleri kullanılabilir.', 'Secondary sources may include scholarly articles and studies of a philosopher or one of their works.'],
    ['Birincil kaynak örneği: Aristoteles, Metafizik; Platon, Şölen.', 'Examples of primary sources: Aristotle, Metaphysics; Plato, Symposium.'],
    ['İkincil kaynak örneği: Hasan Hüseyin Kargın, Platon’un Mutluluk Anlayışı, 2024.', 'Example of a secondary source: Hasan Hüseyin Kargın, Platon’un Mutluluk Anlayışı [Plato’s Conception of Happiness], 2024.'],
    ['Kaynak için Google Scholar, PhilPapers, JSTOR ve DergiPark gibi siteler kullanılabilir.', 'Sources can be found through platforms such as Google Scholar, PhilPapers, JSTOR and DergiPark.'],
    ['Anahtar kelimeler belirlenip Türkçe ve İngilizce olarak aratılır.', 'Identify keywords and search for them in both Turkish and English.'],
    ['Okunan metinlerden not alınabilir: yazar, yıl, ana fikir, sayfa numarası.', 'Take notes on the texts you read, recording the author, year, main idea and page number.'],
    ['Metinde kullanılan her türlü alıntı için alıntı yapılan kişiye veya kaynağa atıf bulunması gerekir.', 'Every quotation used in the text must acknowledge the person or source quoted.'],
  ]],
  ['Akademik Metnin Bölümleri', 'Sections of an Academic Text', '', '', [
    ['Başlık: Kısa, açık ve içeriği yansıtan bir başlık tercih edilmelidir.', 'Title: Choose a concise, clear title that reflects the content.'],
    ['Özet: Amaç, yöntem, bulgu ve sonuç 300–500 kelimede ifade edilmelidir. Anahtar kelimeler: 3–5 adet olmalıdır.', 'Abstract: State the purpose, method, findings and conclusion in 300–500 words. Include 3–5 keywords.'],
    ['Giriş: Araştırma problemi, temel tez, çalışmanın önemi ve argümanın genel yönü.', 'Introduction: Present the research problem, central thesis, significance of the study and overall direction of the argument.'],
    ['Gelişme: Kavramsal analiz, metinsel inceleme, argümanların geliştirilmesi, alternatif yorumların ve itirazların değerlendirilmesi.', 'Main body: Provide conceptual analysis, textual examination, development of arguments and an assessment of alternative interpretations and objections.'],
    ['Sonuç: Temel argümanların ulaştığı sonuçlar ve araştırma sorusuna verilen yanıt.', 'Conclusion: Set out the conclusions reached through the main arguments and the answer to the research question.'],
    ['Kaynakça: Metinde atıf yapılan tüm kaynakları listeler.', 'References: List all sources cited in the text.'],
  ]],
  ['Yazım Dili ve Üslup', 'Language and Style', '', '', [
    ['Akademik metinlerde açık, anlaşılır ve ölçülü bir dil kullanılmalıdır. Birinci veya üçüncü şahıs anlatımı, disiplinin yazım geleneklerine ve metnin niteliğine göre tercih edilebilir. Gereksiz edilgen anlatımdan kaçınılmalıdır.', 'Use clear, accessible and measured language. First- or third-person narration may be appropriate depending on the discipline’s writing conventions and the nature of the text. Avoid unnecessary use of the passive voice.'],
    ['Abartılı, duygusal ve kesin hükümlü ifadelerden kaçınılmalıdır (“kesinlikle”, “herkes biliyor ki”).', 'Avoid exaggerated, emotive or categorical statements, such as “definitely” or “everyone knows that”.'],
    ['Günlük konuşma dili ve argo kullanılmamalıdır.', 'Avoid colloquial language and slang.'],
    ['Kısaltmalar ilk kullanımda açıklanmalıdır.', 'Define abbreviations at their first occurrence.'],
    ['Terimler tutarlı kullanılmalı ve aynı kavram için farklı sözcükler seçilmemelidir.', 'Use terminology consistently; do not use different terms for the same concept.'],
    ['Paragraflar ve bölümler arasında bağlantı cümleleri kullanılmalıdır (“buna rağmen”, “dolayısıyla”, “bu sebeple” vb.).', 'Use transitions to connect paragraphs and sections, such as “nevertheless”, “therefore” and “for this reason”.'],
  ]],
  ['Atıf ve Alıntı', 'Citations and Quotations', '', '', [
    ['Başka birinin fikri mutlaka kaynağıyla belirtilmelidir.', 'Always acknowledge the source of another person’s idea.'],
    ['Tek bir atıf stili baştan sona kullanılır (APA, MLA, Chicago, IEEE vb.). Kurum veya derginin istediği stil öğrenilmelidir.', 'Use a single citation style throughout, such as APA, MLA, Chicago or IEEE. Check which style the institution or journal requires.'],
    ['Doğrudan alıntılar tırnak içinde ve sayfa numarasıyla verilir.', 'Place direct quotations in quotation marks and include the page number.'],
    ['Kişi kendi cümleleri ile özetleme (paraphrase) yapabilir, ama yine de kaynak gösterilmelidir.', 'You may paraphrase in your own words, but you must still cite the source.'],
    ['Metindeki her atıf kaynakçada, kaynakçadaki her kaynak da metinde yer almalıdır.', 'Every source cited in the text must appear in the reference list, and every entry in the reference list must be cited in the text.'],
  ]],
  ['Etik ve İntihal', 'Ethics and Plagiarism', '', '', [
    ['İntihal, kaynak göstermeden başkasının metnini veya fikrini kullanmaktır.', 'Plagiarism is the use of another person’s text or ideas without acknowledging the source.'],
    ['Veri uydurmak veya değiştirmek bilimsel etiğe aykırıdır.', 'Fabricating or falsifying data violates research ethics.'],
    ['İnsan katılımcıların yer aldığı araştırmalarda, araştırmanın niteliğine ve ilgili mevzuata göre gerekli etik kurul onayları alınmalı ve bilgilendirilmiş onam ilkelerine uyulmalıdır.', 'For research involving human participants, obtain the ethics committee approvals required by the nature of the research and applicable regulations, and follow the principles of informed consent.'],
    ['Yapay zekâ gibi araçların kullanımı kurumun kurallarına göre belirtilmelidir.', 'Disclose the use of tools such as artificial intelligence in accordance with the institution’s rules.'],
  ]],
  ['Gözden Geçirme ve Son Kontrol', 'Revision and Final Checks', '', '', [
    ['Taslağın bir süre bekletilip yeniden okunması faydalı olabilir.', 'It can be helpful to set the draft aside for a while before rereading it.'],
    ['Metnin mantıksal akışı kontrol edilmelidir: Soru, yöntem, bulgu ve sonuç birbiriyle uyumlu mu?', 'Check the logical progression of the text: Are the question, method, findings and conclusion consistent with one another?'],
    ['Yazım, noktalama ve biçim hataları varsa düzeltilmelidir.', 'Correct any spelling, punctuation and formatting errors.'],
    ['Tablo, şekil ve numaralandırmalar kontrol edilmelidir.', 'Check tables, figures and numbering.'],
    ['Sayfa düzeni, yazı tipi ve kenar boşlukları kılavuza uygun mu?', 'Do the page layout, font and margins comply with the guidelines?'],
    ['Mümkünse bir arkadaş veya danışmana okutulabilir.', 'If possible, ask a peer or supervisor to read the text.'],
  ]],
];

const escape = value => value.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function renderGuide(lang) {
  const index = lang === 'en' ? 1 : 0;
  return `<p>${index ? 'Marmara University, Department of Philosophy' : 'Marmara Üniversitesi Felsefe Bölümü'} · Philposium '27</p>` + sections.map((section, n) => `<section id="guide-${n + 1}"><h2>${escape(section[index])}</h2>${section[index + 2] ? `<p>${escape(section[index + 2])}</p>` : ''}<ul>${section[4].map(item => `<li>${escape(item[index])}</li>`).join('')}</ul></section>`).join('');
}
module.exports = { renderGuide };
