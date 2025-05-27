// Utilitário para geração de dados demo brasileiros para previews de templates

const ARTIST_NAMES = [
  "MC Trovão", "Lil Quebrada", "DJ Favela", "Mano Brasa", "MC Coragem", "Trap Lord BR", "Quebrada King", "Favela Boss",
  "Lil Baile", "MC Revolta", "DJ Resistência", "Mano Raiz", "MC Firmeza", "Trap Quebrada", "Lil Mandela", "DJ Zulu",
  "MC Ginga", "Lil Zona Leste", "DJ Perifa", "Mano Sampa", "MC Mandrake", "Trap do Morro", "Lil Brasil", "DJ Zona Sul",
  "MC Realidade", "Trap Favela", "Lil Funk", "DJ Subúrbio", "Mano Preto", "MC Respeito", "Trap Original", "Lil Beco",
  "DJ Batidão", "MC Vibe", "Trap do Gueto", "Lil Leste", "DJ Baile", "MC Rima", "Trap do Centro", "Lil Norte",
  "DJ Flow", "MC Verso", "Trap do Sul", "Lil Oeste", "DJ Beat", "MC Cultura", "Trap do Rap", "Lil Zona Norte"
];

const BIOS = [
  "Direto da quebrada, levando o som pra geral!",
  "Representando a favela com orgulho e atitude.",
  "Som que vem da periferia, resistência e cultura.",
  "Rima, batida e vivência. Tá ligado?",
  "Do gueto pro topo, sem esquecer as raízes.",
  "Trap nacional, flow pesado e muita história.",
  "Ouro, ostentação e humildade sempre.",
  "Nostalgia do rap BR, respeito aos clássicos.",
  "Arte de rua, grafite e poesia urbana.",
  "No corre pelo sonho, quebrada é inspiração."
];

const TRACKS = [
  { title: "Novo Som", cover: "novo-som" },
  { title: "Último Drop", cover: "ultimo-drop" },
  { title: "Da Quebrada", cover: "da-quebrada" },
  { title: "Trap Nacional", cover: "trap-nacional" },
  { title: "Favela Vive", cover: "favela-vive" },
  { title: "Resistência", cover: "resistencia" },
  { title: "Mandrake", cover: "mandrake" },
  { title: "Batidão", cover: "batidao" }
];

const SOCIALS = [
  { platform: "instagram", url: "https://instagram.com/" },
  { platform: "youtube", url: "https://youtube.com/" },
  { platform: "spotify", url: "https://open.spotify.com/" },
  { platform: "soundcloud", url: "https://soundcloud.com/" },
  { platform: "tiktok", url: "https://tiktok.com/" }
];

const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

export function generateDemoProfile(templateId) {
  const name = getRandom(ARTIST_NAMES);
  const bio = getRandom(BIOS);
  const username = name.toLowerCase().replace(/[^a-z0-9]/g, '_');
  // Avatar brasileiro do RandomUser.me (seed para "brasileiro")
  const gender = Math.random() < 0.5 ? 'men' : 'women';
  const number = Math.floor(Math.random() * 99) + 1;
  const avatar = `https://randomuser.me/api/portraits/${gender}/${number}.jpg`;

  // Capa de álbum via Unsplash, customizada por template
  const coverTerms = {
    quebrada: "street,brazil,urban,graffiti",
    minimal: "minimal,abstract,music,brazil",
    neon: "neon,favela,urban,night",
    graffiti: "graffiti,street,art,brazil",
    gold: "gold,luxury,music,brazil",
    retro: "vintage,music,retro,brazil"
  };
  const cover = `https://source.unsplash.com/300x300/?${coverTerms[templateId] || 'urban,music,brazil'}`;

  // Música demo
  const track = getRandom(TRACKS);
  const musicUrl = "https://www.youtube.com/watch?v=QDYfEBY9NM4"; // Pode variar depois

  // Links sociais demo
  const socials = SOCIALS.reduce((acc, s) => {
    acc[s.platform] = s.url + username;
    return acc;
  }, {});

  return {
    username: name,
    bio,
    avatar,
    cover,
    musicUrl,
    socials,
    trackTitle: track.title
  };
}

// Função utilitária para demo: retorna uma capa e música reais de rap/hip hop por template
export function getDemoAlbumAndTrack(templateId) {
  const demos = {
    quebrada: {
      albumCover: 'https://i.scdn.co/image/ab67616d0000b273b1e0e7e7e7e7e7e7e7e7e7e7', // Racionais MC's - Sobrevivendo no Inferno
      trackName: 'Diário de um Detento',
      artist: "Racionais MC's",
      spotifyUrl: 'https://open.spotify.com/track/2QZ7WLBE8h2y1Y5Fb8RYbH',
    },
    minimal: {
      albumCover: 'https://i.scdn.co/image/ab67616d0000b273e1e1e1e1e1e1e1e1e1e1e1e1', // Emicida - AmarElo
      trackName: 'AmarElo (feat. Majur e Pabllo Vittar)',
      artist: 'Emicida',
      spotifyUrl: 'https://open.spotify.com/track/2nLtzopw4rPReszdYBJU6h',
    },
    neon: {
      albumCover: 'https://i.scdn.co/image/ab67616d0000b273f2f2f2f2f2f2f2f2f2f2f2f2', // Travis Scott - ASTROWORLD
      trackName: 'SICKO MODE',
      artist: 'Travis Scott',
      spotifyUrl: 'https://open.spotify.com/track/2xLMifQCjDGFmkHkpNLD9h',
    },
    graffiti: {
      albumCover: 'https://i.scdn.co/image/ab67616d0000b273c3c3c3c3c3c3c3c3c3c3c3c3', // Sabotage - Rap é Compromisso
      trackName: 'Um Bom Lugar',
      artist: 'Sabotage',
      spotifyUrl: 'https://open.spotify.com/track/6Qyc6fS4DsZjB2mRW9DsQs',
    },
    gold: {
      albumCover: 'https://i.scdn.co/image/ab67616d0000b273d4d4d4d4d4d4d4d4d4d4d4d4', // Djonga - Ladrão
      trackName: 'Leal',
      artist: 'Djonga',
      spotifyUrl: 'https://open.spotify.com/track/1Qrg8KqiBpW07V7PNxwwwL',
    },
    retro: {
      albumCover: 'https://i.scdn.co/image/ab67616d0000b273a5a5a5a5a5a5a5a5a5a5a5a5', // Tupac - All Eyez On Me
      trackName: 'California Love',
      artist: '2Pac, Dr. Dre',
      spotifyUrl: 'https://open.spotify.com/track/5w9c2J52mkdntKOmRLeM2m',
    },
    builder: {
      albumCover: 'https://i.scdn.co/image/ab67616d0000b273b6b6b6b6b6b6b6b6b6b6b6b6', // Notorious B.I.G. - Ready to Die
      trackName: 'Juicy',
      artist: 'The Notorious B.I.G.',
      spotifyUrl: 'https://open.spotify.com/track/2TVxnKdb3tqe1nhQWwwZCO',
    },
  };
  return demos[templateId] || demos['quebrada'];
}
