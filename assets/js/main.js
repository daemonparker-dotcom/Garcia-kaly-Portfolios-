// accessible menu toggle + lazy image polyfill
document.addEventListener('DOMContentLoaded', ()=> {
  const btn = document.querySelector('.nav-toggle');
  const menu = document.getElementById('navlist');
  if(btn) btn.addEventListener('click', ()=>{
    const open = btn.getAttribute('aria-expanded') === 'true';
    btn.setAttribute('aria-expanded', String(!open));
    menu.classList.toggle('open');
  });
  // Add simple reveal on scroll (perf-friendly)
  const obs = new IntersectionObserver((entries)=>{
    entries.forEach(e=> { if(e.isIntersecting) e.target.classList.add('on'); });
  }, {threshold:.12});
  document.querySelectorAll('.rv').forEach(n=> obs.observe(n));
});
