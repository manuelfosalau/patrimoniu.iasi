#!/usr/bin/env python3
"""
Pregătește un strat exportat din ArcGIS pentru web.

Face trei lucruri:
  1. recunoaște și convertește Esri JSON (cu "rings") în GeoJSON adevărat
  2. verifică proiecția și avertizează dacă nu e în grade zecimale
  3. simplifică geometriile și rotunjește coordonatele

Utilizare:
    python simplifica_geojson.py rezervatii.json -o rezervatii.geojson
    python simplifica_geojson.py intrare.geojson -o iesire.geojson --toleranta 0.0003

Fără dependențe externe. Merge cu Python 3.8 sau mai nou.
"""

import argparse
import json
import os
import sys


# ---------------------------------------------------------------- Douglas-Peucker

def distanta_la_segment(p, a, b):
    """Distanța perpendiculară de la punctul p la segmentul ab."""
    (px, py), (ax, ay), (bx, by) = p[:2], a[:2], b[:2]
    dx, dy = bx - ax, by - ay
    if dx == 0 and dy == 0:
        return ((px - ax) ** 2 + (py - ay) ** 2) ** 0.5
    t = ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy)
    t = max(0.0, min(1.0, t))
    return ((px - (ax + t * dx)) ** 2 + (py - (ay + t * dy)) ** 2) ** 0.5


def simplifica(puncte, toleranta):
    """Douglas-Peucker iterativ, ca să nu depășim adâncimea de recursie."""
    if len(puncte) < 3:
        return puncte

    pastrat = [False] * len(puncte)
    pastrat[0] = pastrat[-1] = True
    stiva = [(0, len(puncte) - 1)]

    while stiva:
        inceput, sfarsit = stiva.pop()
        if sfarsit <= inceput + 1:
            continue
        maxim, indice = 0.0, inceput
        for i in range(inceput + 1, sfarsit):
            d = distanta_la_segment(puncte[i], puncte[inceput], puncte[sfarsit])
            if d > maxim:
                maxim, indice = d, i
        if maxim > toleranta:
            pastrat[indice] = True
            stiva.append((inceput, indice))
            stiva.append((indice, sfarsit))

    return [p for p, k in zip(puncte, pastrat) if k]


def simplifica_inel(inel, toleranta):
    """Un inel de poligon trebuie să rămână închis și cu minimum 4 vârfuri."""
    rezultat = simplifica(inel, toleranta)
    if len(rezultat) < 4:
        return inel
    if rezultat[0] != rezultat[-1]:
        rezultat.append(rezultat[0])
    return rezultat


def rotunjeste(punct, zecimale):
    return [round(float(punct[0]), zecimale), round(float(punct[1]), zecimale)]


def prelucreaza_geometrie(geom, toleranta, zecimale):
    if not geom:
        return None
    tip = geom.get('type')
    coord = geom.get('coordinates')

    def inel(r):
        return [rotunjeste(p, zecimale) for p in simplifica_inel(r, toleranta)]

    def linie(l):
        return [rotunjeste(p, zecimale) for p in simplifica(l, toleranta)]

    if tip == 'Polygon':
        geom['coordinates'] = [inel(r) for r in coord]
    elif tip == 'MultiPolygon':
        geom['coordinates'] = [[inel(r) for r in poly] for poly in coord]
    elif tip == 'LineString':
        geom['coordinates'] = linie(coord)
    elif tip == 'MultiLineString':
        geom['coordinates'] = [linie(l) for l in coord]
    elif tip == 'Point':
        geom['coordinates'] = rotunjeste(coord, zecimale)
    elif tip == 'MultiPoint':
        geom['coordinates'] = [rotunjeste(p, zecimale) for p in coord]
    return geom


# ---------------------------------------------------------------- Esri JSON

def esri_in_geojson(date):
    """ArcGIS exportă uneori JSON propriu, cu 'rings' sau 'paths' în loc de geometrie GeoJSON."""
    trasaturi = []
    for f in date.get('features', []):
        g = f.get('geometry') or {}
        atribute = f.get('attributes', f.get('properties', {}))

        if 'rings' in g:
            inele = g['rings']
            geom = {'type': 'Polygon', 'coordinates': inele} if len(inele) == 1 \
                else {'type': 'MultiPolygon', 'coordinates': [[r] for r in inele]}
        elif 'paths' in g:
            cai = g['paths']
            geom = {'type': 'LineString', 'coordinates': cai[0]} if len(cai) == 1 \
                else {'type': 'MultiLineString', 'coordinates': cai}
        elif 'x' in g and 'y' in g:
            geom = {'type': 'Point', 'coordinates': [g['x'], g['y']]}
        else:
            continue

        trasaturi.append({'type': 'Feature', 'geometry': geom, 'properties': atribute})

    return {'type': 'FeatureCollection', 'features': trasaturi}


def pare_esri(date):
    for f in date.get('features', [])[:1]:
        g = f.get('geometry') or {}
        if 'rings' in g or 'paths' in g:
            return True
    return False


# ---------------------------------------------------------------- inspecție

def prima_coordonata(geom):
    c = geom.get('coordinates')
    while isinstance(c, list) and c and isinstance(c[0], list):
        c = c[0]
    return c if isinstance(c, list) else None


def numara_varfuri(geom):
    def adanc(c):
        if not isinstance(c, list):
            return 0
        if c and not isinstance(c[0], list):
            return 1
        return sum(adanc(x) for x in c)
    return adanc(geom.get('coordinates'))


def main():
    p = argparse.ArgumentParser(description='Pregătește un strat pentru web')
    p.add_argument('intrare')
    p.add_argument('-o', '--iesire', default=None)
    p.add_argument('--toleranta', type=float, default=0.0002,
                   help='în grade; 0.0002 e aproximativ 20 m (implicit)')
    p.add_argument('--zecimale', type=int, default=6)
    a = p.parse_args()

    iesire = a.iesire or os.path.splitext(a.intrare)[0] + '.geojson'

    with open(a.intrare, encoding='utf-8') as f:
        date = json.load(f)

    marime_initiala = os.path.getsize(a.intrare)
    print(f'Intrare: {a.intrare}  ({marime_initiala/1048576:.2f} MB)')

    if pare_esri(date):
        print('Format recunoscut: Esri JSON. Se convertește în GeoJSON.')
        date = esri_in_geojson(date)
    elif date.get('type') != 'FeatureCollection':
        sys.exit('Fișierul nu e nici GeoJSON, nici Esri JSON recunoscut.')

    trasaturi = date.get('features', [])
    if not trasaturi:
        sys.exit('Fișierul nu conține nicio entitate.')

    print(f'Entități: {len(trasaturi)}')

    # verificarea proiecției
    exemplu = prima_coordonata(trasaturi[0].get('geometry') or {})
    if exemplu:
        x, y = exemplu[0], exemplu[1]
        print(f'Prima coordonată: {x}, {y}')
        if abs(x) > 180 or abs(y) > 90:
            sys.exit(
                '\nPROIECȚIE GREȘITĂ.\n'
                'Coordonatele nu sunt în grade zecimale, deci stratul nu se va vedea\n'
                'niciodată pe hartă. Reproiectează în ArcGIS pe WGS 1984 (EPSG:4326)\n'
                'înainte de export, apoi rulează din nou acest script.'
            )

    varfuri_inainte = sum(numara_varfuri(f.get('geometry') or {}) for f in trasaturi)

    for f in trasaturi:
        f['geometry'] = prelucreaza_geometrie(f.get('geometry'), a.toleranta, a.zecimale)

    varfuri_dupa = sum(numara_varfuri(f.get('geometry') or {}) for f in trasaturi)

    with open(iesire, 'w', encoding='utf-8') as f:
        json.dump(date, f, ensure_ascii=False, separators=(',', ':'))

    marime_finala = os.path.getsize(iesire)
    print(f'\nVârfuri: {varfuri_inainte:,} -> {varfuri_dupa:,} '
          f'({100 - varfuri_dupa*100//max(varfuri_inainte,1)}% eliminate)')
    print(f'Mărime:  {marime_initiala/1048576:.2f} MB -> {marime_finala/1048576:.2f} MB')
    print(f'Scris:   {iesire}')

    if marime_finala > 2 * 1048576:
        print('\nÎncă e mare. Încearcă --toleranta 0.0005 pentru o simplificare mai fermă.')


if __name__ == '__main__':
    main()
