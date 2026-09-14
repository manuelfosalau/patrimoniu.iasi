/* ==========================================================================
   CONFIGURARE COMUNĂ
   Acest fișier e folosit de toate paginile. Modifici o singură dată, aici.
   ========================================================================== */

const CONFIG = {

  // Adresa publică a sitului. Folosită în etichetele canonical și Open Graph.
  // Schimb-o dacă redenumești depozitul sau treci pe domeniu propriu.
  baza: 'https://manuelfosalau.github.io/patrimoniu.iasi/',

  // Linkul CSV publicat din Google Sheets.
  // Fișier > Distribuie > Publică pe web > fila „date” > format .csv
  urlCsvPublicat: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQSKqUDCGNUYY3a-IqaDPlTs_tggzl-vpS8bvcAicVLaIwwoL2n9zDwkXCdQFhYmbtL_46ROHzKRKf_/pub?gid=0&single=true&output=csv',

  // Alternativ, dacă nu publici foaia: ID-ul foii, dintre /d/ și /edit
  idFoaie: '',
  numeFila: 'date',

  // Fișier local, folosit când niciuna din variantele de mai sus nu e completată
  csvLocal: 'date_exemplu.csv',

  // UAT tratat separat: punctele lui nu apar la deschidere, în locul lor se
  // desenează conturul unității. Clic pe contur intră în el și afișează punctele.
  uatSeparat: 'Iasi',

  // Conturul acelui UAT. Dacă fișierul lipsește, se desenează o formă
  // aproximativă, calculată din punctele aflate în interior.
  conturUAT: 'date/uat-iasi.geojson',

  // Localități etichetate pe hartă de la bun început
  orase: [
    { nume:'Iași',          lat:47.1585, lon:27.6014 },
    { nume:'Pașcani',       lat:47.2500, lon:26.7167 },
    { nume:'Hârlău',        lat:47.4306, lon:26.9028 },
    { nume:'Târgu Frumos',  lat:47.2103, lon:27.0033 },
    { nume:'Podu Iloaiei',  lat:47.2181, lon:27.2617 }
  ],

  centru: [47.22, 27.15],
  zoom: 9,

  // Cât de mult se apropie harta când intri în municipiu, peste încadrarea
  // strictă a conturului. 0 înseamnă exact conturul, 1 e un nivel mai aproape.
  zoomInUAT: 1.5,

  // De la ce nivel de zoom apar denumirile lângă puncte
  zoomEtichete: 12,

  // Anul folosit când coloana perioada conține doar zi și lună
  anEvenimente: 2026,

  // Cheie CARTO, opțională. Fără ea, fundalurile CARTO nu apar în listă.
  cheieCarto: '',

  // Straturi de suprafețe. Fișierele absente sunt ignorate în liniște, deci
  // poți lăsa aici intrări pentru care încă nu ai datele.
  // `categorie` spune sub ce categorie apare comutatorul în panoul lateral.
  poligoane: [
    { eticheta: 'Rezervații naturale',   fisier: 'date/rezervatii.geojson',
      culoare: '#2C6E49', categorie: 'patrimoniu natural' },
    { eticheta: 'Situri SCI',            fisier: 'date/sci.geojson',
      culoare: '#3E8C63', categorie: 'patrimoniu natural' },
    { eticheta: 'Situri SPA',            fisier: 'date/spa.geojson',
      culoare: '#1D6F7A', categorie: 'patrimoniu natural' },
    { eticheta: 'Arii de interes local', fisier: 'date/arii-locale.geojson',
      culoare: '#6E8C2C', categorie: 'patrimoniu natural' }
  ]
};

// Numele coloanelor din foaia de calcul. Schimbă doar partea din dreapta.
const COL = {
  categorie:    'categorie',
  subcategorie: 'subcategorie',
  denumire:     'denumire',
  uat:          'UAT',
  lat:          'lat',
  lon:          'lon',
  descriere:    'descriere_scurt',
  detalii:      'descriere_lung',
  perioada:     'perioada',          // ex. 10.05-18.05 sau 15.08
  program:      'program_contact',
  web:          'web',
  foto:         'foto_url',
  sursa:        'sursa',
  activ:        'activ'
};

// Categoriile și culorile lor. Ordinea de aici e ordinea din interfață.
const CATEGORII = [
  { cheie:'patrimoniu natural',   eticheta:'Patrimoniu natural',   culoare:'#2F9E4F' },
  { cheie:'patrimoniu material',  eticheta:'Patrimoniu material',  culoare:'#8A1C32' },
  { cheie:'tezaur uman viu',      eticheta:'Tezaur uman viu',      culoare:'#C9A227' },
  { cheie:'gastronomie',          eticheta:'Gastronomie',          culoare:'#0F8C8C' },
  { cheie:'patrimoniu imaterial', eticheta:'Patrimoniu imaterial', culoare:'#B08344' },
  { cheie:'evenimente',           eticheta:'Evenimente',           culoare:'#1F6FB2' }
];

// Categoriile care nu apar mai sus primesc o culoare stabilă din această listă,
// ca să nu ajungă două categorii noi cu aceeași nuanță.
const CULORI_REZERVA = ['#7A4FA3','#A0522D','#4C5FAF','#B03A7E','#6E8C2C','#C2571A'];
const CULOARE_IMPLICITA = CULORI_REZERVA[0];

function culoareStabila(text, paleta){
  let suma = 0;
  const t = fara(text);
  for (let i = 0; i < t.length; i++) suma = (suma * 31 + t.charCodeAt(i)) % 100000;
  return paleta[suma % paleta.length];
}

/* ==========================================================================
   FESTIVALURI
   Tabel separat, cu structură proprie. Fiecare foaie se publică individual
   (Fișier > Distribuie > Publică pe web, se alege foaia, format .csv)
   și produce un link cu alt gid. Le pui pe amândouă aici.
   ========================================================================== */

const FESTIVALURI = {

  surse: [
    { eticheta: 'Oraș',  url: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vR2m0ob7kRyIJ5fmf5hqKHYnie_Yd9Pn1NE9gGKitelBxfQQVxA74ndZ31_q0ulpVn16dbsxdZtWr7N/pub?gid=322332200&single=true&output=csv' },
    { eticheta: 'Județ', url: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vR2m0ob7kRyIJ5fmf5hqKHYnie_Yd9Pn1NE9gGKitelBxfQQVxA74ndZ31_q0ulpVn16dbsxdZtWr7N/pub?gid=0&single=true&output=csv' }
  ],

  // Numele coloanelor din acel tabel. Schimbă doar partea din dreapta.
  coloane: {
    denumire:     'Nume festival',
    perioada:     'Perioada aproximativă',
    participanti: 'Număr aproximativ de participanți',
    categorie:    'Categoria',
    organizator:  'Organizator',
    link:         'Link',
    activ:        'activ'        // coloană adăugată de tine: NU ascunde rândul
  },

  // Cuvintele-cheie sunt folosite ca să recunoască scrierea din tabel
  // chiar dacă diferă diacriticele, „și” față de „&”, sau ordinea.
  // Ordinea contează: se folosește prima potrivire. „Folclor și tradiție”
  // stă înaintea categoriei de gastronomie, ca să nu se încurce pe „tradiți”.
  categorii: [
    { eticheta:'Cultură & industrii creative',             culoare:'#C62828', chei:['cultura','creativ'] },
    { eticheta:'MICE, business & knowledge',               culoare:'#E2681C', chei:['mice','business','knowledge'] },
    { eticheta:'Muzică & entertainment',                   culoare:'#2F9E4F', chei:['muzica','entertainment'] },
    { eticheta:'Folclor și tradiție',                      culoare:'#1F6FB2', chei:['folclor'] },
    { eticheta:'Microfestivaluri comunitare',              culoare:'#7A4FA3', chei:['microfestival','comunitar'] },
    { eticheta:'Tradiții & spiritualitate și gastronomie', culoare:'#D9A400', chei:['spiritualitate','gastronomie','traditi'] }
  ],

  // Categoriile nerecunoscute primesc o culoare din această listă, în loc de gri.
  // Aceeași denumire primește mereu aceeași culoare.
  rezerva: ['#0F8C8C','#A0522D','#4C5FAF','#B03A7E','#6E8C2C','#8A6BBF']
};

function potrivesteCategorie(text){
  const t = fara(text);
  if (!t) return { eticheta:'Neîncadrate', culoare:CULOARE_IMPLICITA };

  const gasit = FESTIVALURI.categorii.find(c => c.chei.some(k => t.includes(k)));
  if (gasit) return gasit;

  // categorie necunoscută: îi dăm o culoare stabilă, derivată din denumire
  return { eticheta: text.toString().trim(),
           culoare: culoareStabila(t, FESTIVALURI.rezerva) };
}

// Aceeași culoare, foarte diluată, pentru fundalul unui card
function tenta(hex, alfa){
  return /^#[0-9a-f]{6}$/i.test(hex) ? hex + (alfa || '14') : 'transparent';
}

// Evenimente fără dată fixă, a căror coloană de perioadă exprimă o frecvență.
// Ele nu aparțin unei luni anume și primesc o secțiune proprie.
const CUVINTE_RECURENTA = [
  'zilnic','saptamanal','bisaptamanal','bilunar','lunar','trimestrial',
  'semestrial','permanent','recurent','periodic','sezonier','continuu',
  'in fiecare','la fiecare','ori de cate ori','weekend','pe tot parcursul'
];

function esteRecurent(perioada, categorie){
  const t = fara(perioada) + ' ' + fara(categorie);
  return CUVINTE_RECURENTA.some(k => t.includes(k));
}

const LUNI = ['ianuarie','februarie','martie','aprilie','mai','iunie',
              'iulie','august','septembrie','octombrie','noiembrie','decembrie'];
const LUNI_SCURT = ['ian','feb','mar','apr','mai','iun','iul','aug','sep','oct','nov','dec'];


/* ==========================================================================
   UTILITARE
   ========================================================================== */

// Elimină diacriticele, ca să putem compara „Iași” cu „Iasi”
function fara(text){
  return (text || '').toString()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/ș|ş/gi,'s').replace(/ț|ţ/gi,'t')
    .trim().toLowerCase();
}

// Google Sheets cu locale românesc scrie 47,2417 în loc de 47.2417
function numar(valoare){
  if (valoare === undefined || valoare === null) return NaN;
  return parseFloat(valoare.toString().trim().replace(',', '.'));
}

function esc(text){
  return (text || '').toString()
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

const cmp = new Intl.Collator('ro').compare;

function culoareCategorie(cheie){
  const gasit = CATEGORII.find(c => fara(c.cheie) === fara(cheie));
  return gasit ? gasit.culoare : culoareStabila(cheie, CULORI_REZERVA);
}

function etichetaCategorie(cheie){
  const gasit = CATEGORII.find(c => fara(c.cheie) === fara(cheie));
  return gasit ? gasit.eticheta : (cheie || 'Neîncadrate');
}


/* ==========================================================================
   PERIOADE
   Acceptă 10.05-18.05, 15.08, 10.05.2026-18.05.2026, dar și forme scrise
   în cuvinte: „10-18 mai”, „28 decembrie - 3 ianuarie”, „mai-iunie”, „iulie”.
   Perioadele exprimate doar prin lună sunt marcate ca aproximative.
   ========================================================================== */

function indexLuna(cuvant){
  const c = fara(cuvant);
  if (!c) return -1;
  let i = LUNI.findIndex(l => fara(l) === c);
  if (i >= 0) return i;
  i = LUNI_SCURT.findIndex(l => fara(l) === c);
  if (i >= 0) return i;
  // prefixe: „ianuar”, „febr”, „sept”
  i = LUNI.findIndex(l => fara(l).startsWith(c) && c.length >= 3);
  return i;
}

function ultimaZi(an, luna){ return new Date(an, luna + 1, 0).getDate(); }

function parsePerioada(text, an){
  if (!text) return null;
  an = an || CONFIG.anEvenimente;

  const brut = text.toString().trim();
  if (!brut) return null;
  const t = fara(brut).replace(/\s+/g, ' ');

  const rezultat = (zi1, luna1, zi2, luna2, aproximativ, an1, an2) => {
    if (luna1 < 0 || luna2 < 0) return null;
    const inceput = new Date(an1 || an, luna1, zi1);
    const sfarsit = new Date(an2 || an1 || an, luna2, zi2);
    if (sfarsit < inceput) sfarsit.setFullYear(sfarsit.getFullYear() + 1);
    return { inceput, sfarsit, aproximativ: !!aproximativ, brut };
  };

  let m;

  // 10.05-18.05 sau 10.05.2026-18.05.2026 sau 15.08
  const bucati = brut.split(/\s*[-–—]\s*/);
  const numeric = /^(\d{1,2})[.\/](\d{1,2})(?:[.\/](\d{2,4}))?$/;
  if (numeric.test(bucati[0].trim())){
    const capete = bucati.map(b => {
      const g = b.trim().match(numeric);
      if (!g) return null;
      let anul = g[3] ? parseInt(g[3], 10) : an;
      if (anul < 100) anul += 2000;
      const zi = parseInt(g[1], 10), luna = parseInt(g[2], 10) - 1;
      if (luna < 0 || luna > 11 || zi < 1 || zi > 31) return null;
      return { zi, luna, anul };
    });
    if (capete[0]){
      const a = capete[0];
      const b = (capete.length > 1 && capete[1]) ? capete[1] : a;
      return rezultat(a.zi, a.luna, b.zi, b.luna, false, a.anul, b.anul);
    }
  }

  // 28 decembrie - 3 ianuarie
  m = t.match(/^(\d{1,2})\s+([a-z]+)\s*[-–—]\s*(\d{1,2})\s+([a-z]+)/);
  if (m) return rezultat(+m[1], indexLuna(m[2]), +m[3], indexLuna(m[4]), false);

  // 10-18 mai
  m = t.match(/^(\d{1,2})\s*[-–—]\s*(\d{1,2})\s+([a-z]+)/);
  if (m){
    const luna = indexLuna(m[3]);
    return rezultat(+m[1], luna, +m[2], luna, false);
  }

  // 15 august
  m = t.match(/^(\d{1,2})\s+([a-z]+)/);
  if (m){
    const luna = indexLuna(m[2]);
    if (luna >= 0) return rezultat(+m[1], luna, +m[1], luna, false);
  }

  // mai - iunie
  m = t.match(/^([a-z]+)\s*[-–—]\s*([a-z]+)/);
  if (m){
    const l1 = indexLuna(m[1]), l2 = indexLuna(m[2]);
    if (l1 >= 0 && l2 >= 0) return rezultat(1, l1, ultimaZi(an, l2), l2, true);
  }

  // o singură lună, oriunde în text: „sfârșitul lunii mai”, „iulie 2026”
  const cuvinte = t.split(/[^a-z]+/).filter(Boolean);
  for (const cuvant of cuvinte){
    const luna = indexLuna(cuvant);
    if (luna >= 0) return rezultat(1, luna, ultimaZi(an, luna), luna, true);
  }

  return null;
}

function formateazaPerioada(p){
  if (!p) return '';
  const zi = d => `${d.getDate()} ${LUNI[d.getMonth()]}`;
  if (p.aproximativ){
    if (p.inceput.getMonth() === p.sfarsit.getMonth()) return LUNI[p.inceput.getMonth()];
    return `${LUNI[p.inceput.getMonth()]} – ${LUNI[p.sfarsit.getMonth()]}`;
  }
  if (p.inceput.getTime() === p.sfarsit.getTime()) return zi(p.inceput);
  if (p.inceput.getMonth() === p.sfarsit.getMonth())
    return `${p.inceput.getDate()}–${p.sfarsit.getDate()} ${LUNI[p.sfarsit.getMonth()]}`;
  return `${zi(p.inceput)} – ${zi(p.sfarsit)}`;
}

// Lunile atinse de o perioadă, ca listă de indici 0-11
function luniAtinse(p){
  if (!p) return [];
  const luni = [];
  const cursor = new Date(p.inceput.getFullYear(), p.inceput.getMonth(), 1);
  while (cursor <= p.sfarsit){
    luni.push(cursor.getMonth());
    cursor.setMonth(cursor.getMonth() + 1);
  }
  return [...new Set(luni)];
}


/* ==========================================================================
   DATE DEMONSTRATIVE
   Folosite doar când nu se poate citi niciun CSV, de exemplu când deschizi
   pagina direct de pe disc.
   ========================================================================== */

const DATE_DEMO = `id,categorie,subcategorie,denumire,UAT,lat,lon,descriere_scurt,descriere_lung,perioada,program_contact,web,foto_url,sursa,activ
1,patrimoniu material,Monumente clasa A,Palatul Sturdza de la Miclăușeni,Butea,47.0714,26.9908,Castel neogotic ridicat între 1880 și 1904,,,Vizite zilnice 9-17,,,LMI 2015,DA
2,patrimoniu material,Monumente clasa A,Palatul Cuza,Ruginoasa,47.2417,26.8300,Reședința domnitorului Alexandru Ioan Cuza,,,,,,LMI 2015,DA
3,patrimoniu material,Monumente clasa A,Mănăstirea Dobrovăț,Dobrovăț,46.9553,27.5158,Ctitorie a lui Ștefan cel Mare din 1503,,,,,,LMI 2015,DA
4,patrimoniu material,Monumente clasa A,Biserica Sfântul Gheorghe,Hârlău,47.4306,26.9028,Ctitorie a lui Ștefan cel Mare din 1492,,,,,,LMI 2015,DA
5,patrimoniu material,Muzee și colecții,Muzeul Viei și Vinului,Hârlău,47.4290,26.9050,Colecție dedicată viticulturii din podgoria Cotnari,,,,,,CJ Iași,DA
6,patrimoniu material,Muzee și colecții,Colecția de artă veche,Hârlău,47.4290,26.9050,Exemplu de colecție aflată în aceeași clădire,,,,,,Exemplu,DA
7,patrimoniu material,Muzee și colecții,Colecția etnografică,Hârlău,47.4290,26.9050,Al treilea punct la aceleași coordonate,,,,,,Exemplu,DA
8,patrimoniu material,Conace și case boierești,Conacul Cantacuzino-Pașcanu,Pașcani,47.2500,26.7167,Ansamblu boieresc din secolul XVII,,,,,,LMI 2015,DA
9,patrimoniu natural,Arii de interes local,Fânețele seculare Valea lui David,Lețcani,47.1800,27.4700,Rezervație botanică cu specii de stepă,,,,,,ANANP,DA
10,patrimoniu natural,Arii de interes local,Dealul Repedea,Bârnova,47.0783,27.5808,Rezervație paleontologică,,,,,,ANANP,DA
11,patrimoniu natural,Situri SCI,Pădurea Bârnova-Repedea,Bârnova,47.0575,27.5522,Sit de importanță comunitară cu păduri de foioase,,,,,,Natura 2000,DA
12,patrimoniu imaterial,Gastronomie locală,Podgoria Cotnari,Cotnari,47.3644,26.8639,Zonă viticolă cu denumire de origine controlată,,,,,,MADR,DA
13,patrimoniu imaterial,Producători locali,Crama Bucium,Bucium,47.1200,27.6100,Producător de vin din podgoria Iași,,,,,,Exemplu,DA
14,patrimoniu imaterial,Meșteșuguri,Atelier de olărit,Șipote,47.3400,27.1800,Ceramică tradițională lucrată manual,,,,,,Exemplu,DA
15,evenimente,Festivaluri,Bătălia de la Ruginoasa,Ruginoasa,47.2417,26.8300,Obicei de Anul Nou cu participare largă,,31.12,,,,Exemplu,DA
16,evenimente,Festivaluri,Sărbătoarea vinului,Cotnari,47.3644,26.8639,Eveniment anual de toamnă în podgorie,,12.09-14.09,,,,Exemplu,DA
17,evenimente,Festivaluri,Zilele comunei Bârnova,Bârnova,47.0575,27.5522,Manifestare locală cu program cultural,,10.05-18.05,,,,Exemplu,DA
18,evenimente,Festivaluri,Festivalul mărului,Hârlău,47.4306,26.9028,Târg de toamnă cu producători locali,,03.10-05.10,,,,Exemplu,DA
19,patrimoniu material,Monumente clasa A,Mănăstirea Hadâmbu,Mogoșești,46.9925,27.4375,Mănăstire fortificată din 1659,,,,,,LMI 2015,DA`;


/* ==========================================================================
   ÎNCĂRCAREA DATELOR
   ========================================================================== */

function faraCache(url){
  return url + (url.includes('?') ? '&' : '?') + '_=' + Date.now();
}

async function incarcaDate(){
  let text = null, sursa = '';

  if (CONFIG.urlCsvPublicat){
    const raspuns = await fetch(faraCache(CONFIG.urlCsvPublicat));
    if (!raspuns.ok) throw new Error('HTTP ' + raspuns.status);
    text = await raspuns.text();
    sursa = 'Google Sheets';
  } else if (CONFIG.idFoaie){
    const url = `https://docs.google.com/spreadsheets/d/${CONFIG.idFoaie}/gviz/tq` +
                `?tqx=out:csv&sheet=${encodeURIComponent(CONFIG.numeFila)}&_=${Date.now()}`;
    const raspuns = await fetch(url);
    if (!raspuns.ok) throw new Error('HTTP ' + raspuns.status);
    text = await raspuns.text();
    sursa = 'Google Sheets';
  } else {
    try {
      const raspuns = await fetch(CONFIG.csvLocal);
      if (!raspuns.ok) throw new Error('HTTP ' + raspuns.status);
      text = await raspuns.text();
      sursa = CONFIG.csvLocal;
    } catch (err){
      text = DATE_DEMO;
      sursa = 'date demonstrative';
    }
  }

  const brut = Papa.parse(text.trim(), { header:true, skipEmptyLines:true }).data;
  const uatSeparat = fara(CONFIG.uatSeparat);
  const randuri = [];
  let faraCoordonate = 0;

  brut.forEach(intrare => {
    const r = {};
    Object.keys(intrare).forEach(k => { r[k.trim()] = (intrare[k] || '').toString().trim(); });

    if (fara(r[COL.activ]) === 'nu') return;

    const lat = numar(r[COL.lat]);
    const lon = numar(r[COL.lon]);
    if (!isFinite(lat) || !isFinite(lon) || (lat === 0 && lon === 0)){ faraCoordonate++; return; }

    r._lat = lat;
    r._lon = lon;
    r._separat = uatSeparat && fara(r[COL.uat]) === uatSeparat;
    r._categorie = r[COL.categorie] || 'Neîncadrate';
    r._subcategorie = r[COL.subcategorie] || 'Fără subcategorie';
    r._cheie = fara(r._categorie) + '||' + fara(r._subcategorie);
    r._coord = lat.toFixed(5) + ',' + lon.toFixed(5);
    r._perioada = parsePerioada(r[COL.perioada]);
    r._text = fara(`${r[COL.denumire]} ${r[COL.uat]} ${r[COL.descriere]}`);

    randuri.push(r);
  });

  return { randuri, sursa, faraCoordonate };
}

function eroareIncarcare(err){
  // Eroare de cod, nu de date: de obicei un config.js vechi, servit din cache
  if (err instanceof ReferenceError || err instanceof TypeError){
    return `Eroare în cod: <code>${esc(err.message)}</code>. Cel mai probabil browserul ` +
           'folosește o versiune veche a fișierului <code>config.js</code>. ' +
           'Golește memoria cache și reîncarcă pagina.';
  }
  if (location.protocol === 'file:'){
    return 'Pagina rulează direct de pe disc (<code>file://</code>), iar browserul blochează ' +
           'cererile către Google. Pornește un server local: <code>python3 -m http.server</code> ' +
           'în acest folder, apoi deschide <code>localhost:8000</code>.';
  }
  return `Datele nu au putut fi citite (${esc(err.message)}). Deschide linkul din ` +
         '<code>urlCsvPublicat</code> într-o filă nouă: dacă nu vezi text CSV, ' +
         'linkul e greșit sau publicarea pe web a fost oprită.';
}


/* ==========================================================================
   ÎNCĂRCAREA FESTIVALURILOR
   Citește toate foile configurate în FESTIVALURI.surse și le unește.
   Rândurile fără perioadă lizibilă nu sunt aruncate: ajung într-o secțiune
   separată, ca să vezi ce mai e de completat.
   ========================================================================== */

const FESTIVALURI_DEMO = `Nr.crt.,Nume festival,Perioada aproximativă,Număr aproximativ de participanți,Categoria,Organizator,Link,activ
1,Festivalul de muzică veche,10-18 mai,4000,Cultură & industrii creative,Primăria comunei,https://exemplu.ro,DA
2,Zilele recoltei,12.09-14.09,9000,Tradiții & spiritualitate și gastronomie,Consiliul local,,DA
3,Serile de jazz,iulie,2500,Muzică & entertainment,Asociația culturală,https://exemplu.ro,DA
4,Forumul turismului regional,03.10-05.10,600,"MICE, business & knowledge",Consiliul Județean Iași,,DA
5,Târgul meșteșugarilor,28 decembrie - 3 ianuarie,3000,Tradiții & spiritualitate și gastronomie,Muzeul etnografic,,DA
6,Festival fără dată stabilită,de anunțat,,Muzică & entertainment,Organizator local,,DA
7,Târgul de weekend al producătorilor,săptămânal,800,Tradiții & spiritualitate și gastronomie,Asociația producătorilor,,DA
8,Seri de lectură publică,lunar,150,Cultură & industrii creative,Biblioteca județeană,https://exemplu.ro,DA`;

async function incarcaFestivaluri(){
  const surse = FESTIVALURI.surse.filter(s => s.url);
  const C = FESTIVALURI.coloane;
  let bucati = [];
  let sursa = '';

  if (surse.length){
    for (const s of surse){
      const raspuns = await fetch(faraCache(s.url));
      if (!raspuns.ok) throw new Error(`${s.eticheta}: HTTP ${raspuns.status}`);
      bucati.push({ eticheta: s.eticheta, text: await raspuns.text() });
    }
    sursa = 'Google Sheets';
  } else {
    bucati = [{ eticheta: 'Demo', text: FESTIVALURI_DEMO }];
    sursa = 'date demonstrative';
  }

  const festivaluri = [];

  bucati.forEach(bucata => {
    const brut = Papa.parse(bucata.text.trim(), { header:true, skipEmptyLines:true }).data;

    brut.forEach(intrare => {
      const r = {};
      Object.keys(intrare).forEach(k => { r[k.trim()] = (intrare[k] || '').toString().trim(); });

      const denumire = r[C.denumire];
      if (!denumire) return;
      if (fara(r[C.activ]) === 'nu') return;

      const cat = potrivesteCategorie(r[C.categorie]);
      const recurent = esteRecurent(r[C.perioada], r[C.categorie]);

      festivaluri.push({
        denumire,
        zona:         bucata.eticheta,
        recurent,
        perioadaText: r[C.perioada] || '',
        perioada:     recurent ? null : parsePerioada(r[C.perioada]),
        participanti: r[C.participanti] || '',
        categorie:    cat.eticheta,
        culoare:      cat.culoare,
        organizator:  r[C.organizator] || '',
        link:         r[C.link] || '',
        _text:        fara(`${denumire} ${r[C.organizator]} ${r[C.categorie]}`)
      });
    });
  });

  return { festivaluri, sursa };
}


/* ==========================================================================
   CONTUR APROXIMATIV
   Folosit doar cât timp lipsește fișierul real al UAT-ului: construiește
   o înfășurătoare convexă în jurul punctelor din acea unitate și o lărgește
   puțin, ca să nu treacă exact prin marcatori.
   ========================================================================== */

function infasuratoareConvexa(puncte){
  if (puncte.length < 3) return null;
  const p = puncte.slice().sort((a,b) => a[0] - b[0] || a[1] - b[1]);
  const cruce = (o,a,b) => (a[0]-o[0])*(b[1]-o[1]) - (a[1]-o[1])*(b[0]-o[0]);

  const jos = [];
  for (const pct of p){
    while (jos.length >= 2 && cruce(jos[jos.length-2], jos[jos.length-1], pct) <= 0) jos.pop();
    jos.push(pct);
  }
  const sus = [];
  for (let i = p.length - 1; i >= 0; i--){
    const pct = p[i];
    while (sus.length >= 2 && cruce(sus[sus.length-2], sus[sus.length-1], pct) <= 0) sus.pop();
    sus.push(pct);
  }
  jos.pop(); sus.pop();
  return jos.concat(sus);
}

function conturAproximativ(randuri){
  const puncte = randuri.map(r => [r._lon, r._lat]);
  if (!puncte.length) return null;

  const cx = puncte.reduce((s,p) => s + p[0], 0) / puncte.length;
  const cy = puncte.reduce((s,p) => s + p[1], 0) / puncte.length;

  let inel = infasuratoareConvexa(puncte);

  if (!inel){
    // prea puține puncte pentru o înfășurătoare: desenăm un cerc în jurul lor
    const raza = 0.045;
    inel = [];
    for (let i = 0; i < 32; i++){
      const a = (i / 32) * Math.PI * 2;
      inel.push([cx + Math.cos(a) * raza * 1.45, cy + Math.sin(a) * raza]);
    }
  } else {
    // lărgim ușor, împingând vârfurile dinspre centru
    inel = inel.map(([x,y]) => [cx + (x - cx) * 1.22 + 0.004 * Math.sign(x - cx),
                                cy + (y - cy) * 1.22 + 0.003 * Math.sign(y - cy)]);
  }

  inel.push(inel[0]);
  return {
    type:'Feature',
    properties:{ aproximativ:true },
    geometry:{ type:'Polygon', coordinates:[inel] }
  };
}
