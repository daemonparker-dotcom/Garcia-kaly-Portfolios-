// tz-clock.js — Web Component Horloge multi‑fuseaux
const tpl = document.createElement('template');
tpl.innerHTML = `
  <style>
    :host{display:inline-block;font-family:Inter,system-ui,Segoe UI,Roboto,Arial;color:var(--tc-color,#0b1220)}
    .card{background:var(--card-bg,linear-gradient(180deg,#0f1724,#07101a));color:var(--card-color,#eaf2ff);padding:12px;border-radius:10px;min-width:160px;box-sizing:border-box;display:flex;flex-direction:column;gap:8px;align-items:flex-start}
    .top{display:flex;align-items:center;justify-content:space-between;width:100%}
    .title{font-weight:700;font-size:0.95rem}
    .time{font-family: 'Space Mono', monospace; font-size:1.3rem; font-weight:700}
    .sub{font-size:.78rem;color:rgba(255,255,255,0.65)}
    .controls{display:flex;gap:6px}
    button{background:transparent;border:1px solid rgba(255,255,255,0.06);color:inherit;padding:.28rem .5rem;border-radius:8px;cursor:pointer;font-size:.82rem}
    select{background:transparent;border:1px solid rgba(255,255,255,0.06);color:inherit;padding:.28rem .45rem;border-radius:8px}
    :host([compact]) .card{padding:8px}
  </style>
  <div class="card" part="card" role="region" aria-live="polite">
    <div class="top">
      <div class="title" part="title">Horloge</div>
      <div class="controls">
        <select part="tz-select" aria-label="Fuseau" id="tzSelect"></select>
      </div>
    </div>
    <div>
      <div class="time" id="time" part="time">--:--:--</div>
      <div class="sub" id="date" part="date">—</div>
    </div>
  </div>
`;

class TZClock extends HTMLElement {
  static get observedAttributes(){ return ['timezone','format','show-seconds','compact']; }

  constructor(){
    super();
    this._tz = this.getAttribute('timezone') || 'local';
    this._format = this.getAttribute('format') || '24';
    this._showSeconds = this.hasAttribute('show-seconds');
    this._interval = null;
    this.attachShadow({mode:'open'});
    this.shadowRoot.appendChild(tpl.content.cloneNode(true));
    this.$time = this.shadowRoot.getElementById('time');
    this.$date = this.shadowRoot.getElementById('date');
    this.$tzSelect = this.shadowRoot.getElementById('tzSelect');

    // common useful zones; you can expand
    this._commonZones = ['local','UTC','Europe/Paris','America/New_York','Africa/Brazzaville','Asia/Tokyo','Europe/London','Australia/Sydney'];
  }

  connectedCallback(){
    this._renderSelect();
    this.$tzSelect.value = this._tz;
    this.$tzSelect.addEventListener('change', e => {
      this.timezone = e.target.value;
      this.dispatchEvent(new CustomEvent('tz-change',{detail:{timezone:this.timezone}}));
    });
    this.start();
  }

  disconnectedCallback(){
    this.stop();
    this.$tzSelect.removeEventListener('change', ()=>{});
  }

  attributeChangedCallback(name, oldV, newV){
    if(oldV === newV) return;
    if(name === 'timezone'){ this._tz = newV || 'local'; this._apply(); }
    if(name === 'format'){ this._format = newV || '24'; this._apply(); }
    if(name === 'show-seconds'){ this._showSeconds = this.hasAttribute('show-seconds'); this._apply(); }
    if(name === 'compact'){ /* styling via attribute: host([compact]) */ }
  }

  // properties
  get timezone(){ return this._tz; }
  set timezone(v){ this.setAttribute('timezone', v); }

  get format(){ return this._format; }
  set format(v){ this.setAttribute('format', v); }

  get showSeconds(){ return this._showSeconds; }
  set showSeconds(v){ if(!!v) this.setAttribute('show-seconds',''); else this.removeAttribute('show-seconds'); }

  // internal
  _renderSelect(){
    this.$tzSelect.innerHTML = '';
    this._commonZones.forEach(z=>{
      const opt = document.createElement('option');
      opt.value = z;
      opt.textContent = (z === 'local') ? 'Heure locale' : z.replace('_',' ').split('/').slice(-1)[0];
      this.$tzSelect.appendChild(opt);
    });
    // allow user to add custom zone via prompt (simple)
    const opt = document.createElement('option');
    opt.value = '__custom__';
    opt.textContent = 'Autre...';
    this.$tzSelect.appendChild(opt);
    this.$tzSelect.addEventListener('change', (e)=> {
      if(e.target.value === '__custom__'){
        const val = prompt('Entrez une zone IANA (ex: Europe/Paris) :');
        if(val){
          try {
            // simple validation attempt
            new Intl.DateTimeFormat(undefined,{timeZone:val});
            const o = document.createElement('option'); o.value = val; o.textContent = val; this.$tzSelect.insertBefore(o, opt);
            this.$tzSelect.value = val;
            this.timezone = val;
          } catch(err){
            alert('Zone inconnue. Utilisez une zone IANA valide (ex: Europe/Paris).');
            this.$tzSelect.value = this._tz;
          }
        } else {
          this.$tzSelect.value = this._tz;
        }
      }
    });
  }

  _tzToUse(){
    return this._tz === 'local' ? undefined : this._tz;
  }

  _formatTime(now){
    const opts = {
      hour: '2-digit', minute: '2-digit',
      second: this._showSeconds ? '2-digit' : undefined,
      hour12: this._format === '12',
      timeZone: this._tzToUse()
    };
    return new Intl.DateTimeFormat(undefined, opts).format(now);
  }
  _formatDate(now){
    const opts = { year:'numeric', month:'short', day:'2-digit', timeZone: this._tzToUse() };
    return new Intl.DateTimeFormat(undefined, opts).format(now);
  }

  _apply(){
    // reflect select if present
    if(this.$tzSelect) {
      // ensure option exists
      const exist = Array.from(this.$tzSelect.options).some(o => o.value === this._tz);
      if(!exist){
        const o = document.createElement('option'); o.value = this._tz; o.textContent = this._tz; this.$tzSelect.insertBefore(o, this.$tzSelect.lastElementChild);
      }
      this.$tzSelect.value = this._tz;
    }
    this._tick(); // immediate refresh
  }

  _tick(){
    const now = new Date();
    try {
      this.$time.textContent = this._formatTime(now);
      this.$date.textContent = this._formatDate(now);
    } catch(e){
      this.$time.textContent = '--:--';
      this.$date.textContent = 'Fuseau invalide';
    }
  }

  start(){
    this.stop();
    this._apply();
    this._interval = setInterval(()=>this._tick(), 1000);
  }

  stop(){
    if(this._interval) { clearInterval(this._interval); this._interval = null; }
  }
}

customElements.define('tz-clock', TZClock);
