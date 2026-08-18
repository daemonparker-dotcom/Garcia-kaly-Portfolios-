// Lightweight interactions: nav toggle, reveal on scroll, project modal
document.addEventListener('DOMContentLoaded', ()=>{
  // year
  const y = document.getElementById('year'); if(y) y.textContent = new Date().getFullYear();

  // nav toggle
  const btn = document.querySelector('.nav-toggle');
  const menu = document.getElementById('navlist');
  if(btn && menu){
    btn.addEventListener('click', ()=>{
      const open = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!open));
      menu.classList.toggle('open');
    });
  }

  // reveal on scroll
  const obs = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{ if(e.isIntersecting) e.target.classList.add('on'); });
  }, {threshold:0.12});
  document.querySelectorAll('.rv').forEach(n=>obs.observe(n));

  // project modal
  const pjModal = document.getElementById('pjModal');
  const pjContent = document.getElementById('pjContent');
  const pjClose = document.getElementById('pjClose');
  document.querySelectorAll('.pj-btn').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const id = btn.getAttribute('data-pj');
      openProject(id);
    });
  });
  function openProject(id){
    const html = projectHtml(id);
    pjContent.innerHTML = html;
    pjModal.setAttribute('aria-hidden','false');
  }
  pjClose && pjClose.addEventListener('click', ()=> pjModal.setAttribute('aria-hidden','true'));

  function projectHtml(id){
    if(id==='1') return `<h3>Budget Excel</h3><p>Outil de suivi financier personnel — TCD, KPI, indicateurs et export PDF.</p>`;
    if(id==='2') return `<h3>Dashboard Congo Négoce SARL</h3><p>Tableau de bord consolidé 3 exercices, ratios, alertes trésorerie.</p>`;
    if(id==='3') return `<h3>Simulation Comptable</h3><p>Bilan simplifié, écritures d'inventaire et compte de résultat.</p>`;
    return `<h3>Projet</h3><p>Détails à venir</p>`;
  }

});
