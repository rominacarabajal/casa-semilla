async function loadConfig(){
  try{
    const res = await fetch('site.config.json', {cache:'no-store'});
    return await res.json();
  }catch(e){
    return null;
  }
}
function fmt(n){ return new Intl.NumberFormat('en-US',{maximumFractionDigits:0}).format(n); }
function money(n){ return '$' + fmt(n); }

function calc(){
  const rate = Number(document.getElementById('rate').value || 0);
  const occ = Number(document.getElementById('occ').value || 0);
  const cost = Number(document.getElementById('cost').value || 0);
  const inv = Number(document.getElementById('inv').value || 0);
  const nights = 30 * (occ/100);
  const gross = rate * nights;
  const net = Math.max(0, gross - cost);
  const year = net * 12;
  const paybackMonths = net>0 ? (inv / net) : Infinity;

  document.getElementById('occVal').textContent = String(occ);
  document.getElementById('gross').textContent = money(Math.round(gross));
  document.getElementById('net').textContent = money(Math.round(net));
  document.getElementById('year').textContent = money(Math.round(year));
  document.getElementById('payback').textContent = (paybackMonths!==Infinity) ? (Math.round(paybackMonths) + ' meses') : '—';

  return {rate, occ, cost, inv, gross, net, year, paybackMonths};
}

function setHref(el, href){ if(el && href){ el.setAttribute('href', href); } }

window.addEventListener('DOMContentLoaded', async () => {
  const cfg = await loadConfig();

  // bind text
  if(cfg){
    document.querySelectorAll('[data-bind]').forEach(el=>{
      const key = el.getAttribute('data-bind');
      const parts = key.split('.');
      let v = cfg;
      for(const p of parts){ v = v?.[p]; }
      if(v !== undefined && v !== null){ el.textContent = String(v); }
    });

    // links
    const wa = cfg.brand?.whatsapp_link || ('https://wa.me/' + (cfg.brand?.whatsapp||'').replace(/\D/g,''));
    const mp = cfg.brand?.mp_link;
    setHref(document.getElementById('btnWhats'), wa);
    setHref(document.getElementById('btnWhats2'), wa);
    setHref(document.getElementById('btnWhats3'), wa);
    setHref(document.getElementById('footWhats'), wa);
    setHref(document.getElementById('floatWhats'), wa);
    setHref(document.getElementById('btnBuy'), mp);
    setHref(document.getElementById('btnBuy2'), mp);

    // download key
    const accessKey = (cfg.delivery?.access_key || '').trim();
    const downloadFile = cfg.delivery?.download_file || 'casa-semilla-proyecto.zip';
    const btnDownload = document.getElementById('btnDownload');
    if(btnDownload){ btnDownload.setAttribute('href', downloadFile); }

    document.getElementById('btnUnlock').addEventListener('click', ()=>{
      const val = (document.getElementById('key').value || '').trim();
      const msg = document.getElementById('keyMsg');
      if(val && accessKey && val === accessKey){
        btnDownload.style.display = 'inline-flex';
        msg.textContent = 'Acceso concedido. Ya podés descargar.';
        msg.style.color = '#a7f3d0';
      }else{
        btnDownload.style.display = 'none';
        msg.textContent = 'Clave incorrecta. Revisá el mensaje de WhatsApp.';
        msg.style.color = '#fca5a5';
      }
    });

    // whatsapp share from calculator
    const shareBtn = document.getElementById('btnShare');
    function updateShare(){
      const r = calc();
      const txt = `Simulación Airbnb Casa Semilla:%0A- Tarifa: USD ${r.rate}/noche%0A- Ocupación: ${r.occ}%0A- Ingresos/mes: ${Math.round(r.gross)}%0A- Neto/mes: ${Math.round(r.net)}%0A- Neto/año: ${Math.round(r.year)}%0A- Inversión: ${r.inv}%0A- Recupero: ${r.paybackMonths!==Infinity ? Math.round(r.paybackMonths)+' meses' : '—'}`;
      shareBtn.href = wa + '?text=' + txt;
    }
    ['rate','occ','cost','inv'].forEach(id=>{
      document.getElementById(id).addEventListener('input', ()=>{ calc(); updateShare(); });
    });
    calc(); updateShare();
  }else{
    // still run calculator
    ['rate','occ','cost','inv'].forEach(id=>{
      document.getElementById(id).addEventListener('input', calc);
    });
    calc();
  }

  document.getElementById('yearNow').textContent = String(new Date().getFullYear());
});
