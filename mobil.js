/* ==========================================================================
   Panoul de filtre pe telefon
   Pe ecran lat nu face nimic: butoanele sunt ascunse de foaia de stil.
   ========================================================================== */

(function(){
  const bara = document.getElementById('bara');
  const deschide = document.getElementById('buton-filtre');
  const inchide = document.getElementById('inchide-filtre');
  if (!bara || !deschide) return;

  // numărul de rezultate, citit din subsolul fiecărei pagini
  const numar = document.querySelector('#subsol strong');

  function actualizeazaEtichete(){
    if (!numar || !inchide) return;
    const n = numar.textContent.trim();
    inchide.textContent = n ? `Vezi rezultatele (${n})` : 'Vezi rezultatele';
  }

  function seteaza(deschis){
    bara.classList.toggle('deschis', deschis);
    document.body.classList.toggle('panou-deschis', deschis);
    deschide.setAttribute('aria-expanded', deschis);
    deschide.querySelector('.text').textContent = deschis ? 'Închide' : 'Filtre';
    if (deschis){ bara.scrollTop = 0; actualizeazaEtichete(); }
    // harta își recalculează dimensiunea când panoul iese din flux sau revine
    window.dispatchEvent(new Event('resize'));
  }

  deschide.addEventListener('click', () => seteaza(!bara.classList.contains('deschis')));
  if (inchide) inchide.addEventListener('click', () => seteaza(false));

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && bara.classList.contains('deschis')) seteaza(false);
  });

  // dacă ecranul se lărgește (rotire, fereastră mărită), închidem panoul
  const ingust = window.matchMedia('(max-width:860px)');
  ingust.addEventListener('change', e => { if (!e.matches) seteaza(false); });

  // eticheta butonului urmărește numărul de rezultate în timp ce filtrezi
  if (numar) new MutationObserver(actualizeazaEtichete)
               .observe(numar, { childList:true, characterData:true, subtree:true });
})();
