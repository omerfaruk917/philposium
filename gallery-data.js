(() => {
  const artworks = [
    [251787, "Filozof Khrysippos’un Mermer Portresi", "Marble Portrait Head of the Philosopher Chrysippos"],
    [436535, "Servili Buğday Tarlası", "Wheat Field with Cypresses", "Vincent van Gogh"],
    [337725, "Yuvarlak Kule", "The Round Tower", "Giovanni Battista Piranesi"],
    [45434, "Kanagawa Açıklarında Büyük Dalga", "Under the Wave off Kanagawa", "Katsushika Hokusai"],
    [247265, "Attika Amforası", "Attic Terracotta Amphora"],
    [436121, "Çiçek Vazosunun Yanında Oturan Kadın", "A Woman Seated beside a Vase of Flowers", "Edgar Degas"],
    [336228, "Melencolia I", "Melencolia I", "Albrecht Dürer"],
    [251460, "Oturan Filozofun Mermer Heykelciği", "Marble Statuette of a Seated Philosopher"],
    [813076, "Yeni Almagest’in Ön Resmi", "Frontispiece from The New Almagest", "Francesco Curti"],
    [436524, "Ayçiçekleri", "Sunflowers", "Vincent van Gogh"],
    [253592, "İmparator Caracalla’nın Mermer Portresi", "Marble Portrait of the Emperor Caracalla"],
    [436105, "Sokrates’in Ölümü", "The Death of Socrates", "Jacques Louis David"],
    [362671, "Çıkıntılı Platformdaki Mahkûmlar", "Prisoners on a Projecting Platform", "Giovanni Battista Piranesi"],
    [437394, "Homeros Büstüyle Aristoteles", "Aristotle with a Bust of Homer", "Rembrandt"],
    [356589, "Sphaera Mundi", "Sphaera Mundi", "Johannes de Sacrobosco"],
    [435906, "Pastoral Manzara, Roma Kırsalı", "Pastoral Landscape: The Roman Campagna", "Claude Lorrain"],
    [369807, "Pencere Önünde Otoportre", "Self-Portrait Etching at a Window", "Rembrandt"],
    [251475, "Eros’un Mermer Gövdesi", "Marble Torso of Eros"],
    [338473, "Aklın Uykusu Canavarlar Üretir", "The Sleep of Reason Produces Monsters", "Francisco de Goya"],
    [436532, "Hasır Şapkalı Otoportre", "Self-Portrait with a Straw Hat", "Vincent van Gogh"],
    [256609, "Siyah Figürlü Amfora", "Black-Figure Neck-Amphora"],
    [436283, "Nişte Meryem ve Çocuk", "Virgin and Child in a Niche"],
    [251493, "Yunan Generalinin Mermer Portresi", "Marble Head of a Greek General"],
  ];

  window.philGallery = artworks.map(([id, tr, en, artist = ""]) => ({
    src: `assets/gallery/met-${id}.webp`,
    thumb: `assets/gallery/met-${id}-thumb.webp`,
    title: { tr, en },
    artist,
    source: `https://www.metmuseum.org/art/collection/search/${id}`,
  }));
})();
