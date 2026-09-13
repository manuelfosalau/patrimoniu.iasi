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
  urlCsvPublicat: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQSKqUDCGNUYY3a-IqaDPlTs_tggzl-vpS8bvcAicVLaIwwoL2n9zDwkXCdQFhYmbtL_46ROHzKRKf_/pubhtml?gid=0&single=true',

  // Alternativ, dacă nu publici foaia: ID-ul foii, dintre /d/ și /edit
  idFoaie: '',
  numeFila: 'date',

  // Fișier local, folosit când niciuna din variantele de mai sus nu e completată
  csvLocal: 'date_exemplu.csv',

  // Localități excluse. Comparația ignoră diacriticele și majusculele.
  excludeUAT: ['Iasi'],

  centru: [47.22, 27.15],
  zoom: 9,

  // Anul folosit când coloana perioada conține doar zi și lună
  anEvenimente: 2026,

  // Cheie CARTO, opțională. Fără ea, fundalurile CARTO nu apar în listă.
  cheieCarto: '',

  // Contururi opționale. Fișierele absente sunt ignorate în liniște.
  poligoane: [
    { eticheta: 'Situri SCI',            fisier: 'date/sci.geojson',   culoare: '#5F7F55' },
    { eticheta: 'Situri SPA',            fisier: 'date/spa.geojson',   culoare: '#4A7186' },
    { eticheta: 'Arii de interes local', fisier: 'date/local.geojson', culoare: '#8A7A3E' }
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
  { cheie:'patrimoniu natural',   eticheta:'Patrimoniu natural',   culoare:'#5F7F55' },
  { cheie:'patrimoniu material',  eticheta:'Patrimoniu material',  culoare:'#A85A3E' },
  { cheie:'patrimoniu imaterial', eticheta:'Patrimoniu imaterial', culoare:'#B58A29' },
  { cheie:'evenimente',           eticheta:'Evenimente',           culoare:'#6E4A63' }
];
const CULOARE_IMPLICITA = '#5B7C99';

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
  return gasit ? gasit.culoare : CULOARE_IMPLICITA;
}

function etichetaCategorie(cheie){
  const gasit = CATEGORII.find(c => fara(c.cheie) === fara(cheie));
  return gasit ? gasit.eticheta : (cheie || 'Neîncadrate');
}


/* ==========================================================================
   PERIOADE
   Acceptă 10.05-18.05, 10.05.2026-18.05.2026, 15.08, cu sau fără spații,
   cu cratimă obișnuită sau linie de dialog.
   ========================================================================== */

function parsePerioada(text, an){
  if (!text) return null;
  an = an || CONFIG.anEvenimente;

  const bucati = text.toString().trim().split(/\s*[-–—]\s*/);
  const capete = bucati.map(b => {
    const m = b.trim().match(/^(\d{1,2})[.\/](\d{1,2})(?:[.\/](\d{2,4}))?$/);
    if (!m) return null;
    let anul = m[3] ? parseInt(m[3], 10) : an;
    if (anul < 100) anul += 2000;
    const zi = parseInt(m[1], 10), luna = parseInt(m[2], 10);
    if (luna < 1 || luna > 12 || zi < 1 || zi > 31) return null;
    return new Date(anul, luna - 1, zi);
  });

  if (!capete[0]) return null;
  const inceput = capete[0];
  let sfarsit = capete.length > 1 && capete[1] ? capete[1] : new Date(inceput);

  // 28.12-03.01 înseamnă că sfârșitul e în anul următor
  if (sfarsit < inceput) sfarsit.setFullYear(sfarsit.getFullYear() + 1);

  return { inceput, sfarsit };
}

function formateazaPerioada(p){
  if (!p) return '';
  const zi = d => `${d.getDate()} ${LUNI[d.getMonth()]}`;
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
  const excluse = CONFIG.excludeUAT.map(fara);
  const randuri = [];
  let faraCoordonate = 0;

  brut.forEach(intrare => {
    const r = {};
    Object.keys(intrare).forEach(k => { r[k.trim()] = (intrare[k] || '').toString().trim(); });

    if (fara(r[COL.activ]) === 'nu') return;
    if (excluse.includes(fara(r[COL.uat]))) return;

    const lat = numar(r[COL.lat]);
    const lon = numar(r[COL.lon]);
    if (!isFinite(lat) || !isFinite(lon) || (lat === 0 && lon === 0)){ faraCoordonate++; return; }

    r._lat = lat;
    r._lon = lon;
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
  if (location.protocol === 'file:'){
    return 'Pagina rulează direct de pe disc (<code>file://</code>), iar browserul blochează ' +
           'cererile către Google. Pornește un server local: <code>python3 -m http.server</code> ' +
           'în acest folder, apoi deschide <code>localhost:8000</code>.';
  }
  return `Datele nu au putut fi citite (${esc(err.message)}). Deschide linkul din ` +
         '<code>urlCsvPublicat</code> într-o filă nouă: dacă nu vezi text CSV, ' +
         'linkul e greșit sau publicarea pe web a fost oprită.';
}
