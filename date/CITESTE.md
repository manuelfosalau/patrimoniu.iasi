# Folderul `date/`

Aici stau straturile de suprafețe, în format **GeoJSON**, proiecția **EPSG:4326**
(WGS 84, grade zecimale). Fișierele lipsă sunt ignorate, deci poți adăuga
straturile pe rând, pe măsură ce le pregătești.

Numele așteptate de `config.js`:

| fișier                  | strat                    |
|-------------------------|--------------------------|
| `uat-iasi.geojson`      | limita municipiului Iași |
| `rezervatii.geojson`    | rezervații naturale      |
| `sci.geojson`           | situri SCI               |
| `spa.geojson`           | situri SPA               |
| `arii-locale.geojson`   | arii de interes local    |

Numele sunt scrise cu litere mici și cratime. GitHub Pages face diferența
între majuscule și minuscule: `UAT_IS.json` și `uat-iasi.geojson` sunt
fișiere diferite.

## Export din QGIS

1. Clic dreapta pe strat > `Export` > `Save Features As`
2. Format: **GeoJSON**
3. CRS: **EPSG:4326 – WGS 84**
4. La `Layer Options`, pune `COORDINATE_PRECISION` pe **6**
5. Salvează cu numele din tabelul de mai sus

Pasul 4 contează: implicit QGIS scrie 15 zecimale, adică o precizie de
ordinul nanometrilor, care nu înseamnă nimic și poate tripla dimensiunea
fișierului.

## Simplificare

Dacă fișierul depășește circa 1 MB, simplifică geometriile înainte de export:
`Vector > Geometry Tools > Simplify`, toleranță în jur de 0,0002 grade
(aproximativ 20 m). Pentru limite administrative și arii protejate afișate
la nivel de județ, diferența nu se vede, dar timpul de încărcare scade mult.

## Denumirea entităților

Popup-ul caută numele în primul câmp găsit dintre:
`nume`, `denumire`, `name`, `SITENAME`, `SITE_NAME`, `NUME`, `DENUMIRE`, `Name`.

Dacă atributele tale folosesc alt nume de câmp, redenumește-l în tabelul de
atribute înainte de export, sau spune-mi și adaug câmpul în listă.
