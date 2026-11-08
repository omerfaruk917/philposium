'use strict';

const ufuk = 'https://www.ufukfelsefedergisi.com';

const selections = [
  ['Filozofların Eli… Dokunsal Bir Felsefeye Giriş', 'Fethi el-Miskînî', 'nour-hasanato', 'Nour Hasanato'],
  ['Görünmezlik Perdesi', 'Azra H. Bostancı', 'grnmezlik-perdesi'],
  ['Dercartes’ın Metodik Şüphesine Yönelik Bir Eleştiri', 'Yusuf Al-Salihi', 'uofjv08tclvb2gknhumn2u6yw4p4nt'],
  ['Teknoloji, Sanat ve Varoluş: Prof. Dr. Emre Şan ile Söyleşi', 'Muhammed Abdullah Selvi & Ali Bera Çakır', 'teknoloji-sanat-ve-varolu-prof-dr-emre-an-ile-syleinbsp'],
  ['Objektivizm ve Anlamın Çokluğu Üzerine', 'Muhammed Abdullah Selvi', 'objektivizm-ve-anlamn-okluu-zerine'],
  ['Çevre Etiği Teorileri', 'Richard G. Botzler', 'muhammed-kbal-nce', 'M. İkbal İnce'],
  ['Ütopyasız Direniş: Foucault’nun Normatif Olmayan Siyasal Pratiği', 'Ru’Veyda B. Taşkıran', 'Blog%20Post%20Title%20One-3zaa9-zlxng-67tfc-37efp'],
  ['Ötekiyi Oynamak: Yunan Dramasında Tiyatro, Tiyatrallık ve Kadınlık', 'Eylül Sude Can', 'blog-post-title-two-t5my5-k4xmd-67jzh-s9czc'],
  ['Filozofların Dili Manipülatif mi?', 'Fazilet Ceren Efendioğlu', 'fazilet-ceren-efendiolu'],
].map(([title, author, slug, translator]) => ({ title, author, href: `${ufuk}/blog/${slug}`, translator }));

module.exports = { selections, ufuk, issue: 'https://online.fliphtml5.com/wdhba/yjqq/' };
