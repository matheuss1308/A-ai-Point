// App entry: loads data/menu.json and data/promo.json, renders stories, menu and builder
const WHATSAPP_PHONE = '5521981327706';

async function loadJSON(path){
  const r = await fetch(path);
  if(!r.ok) throw new Error('Erro carregando '+path);
  return await r.json();
}

async function initApp(){
  const [promos, menu] = await Promise.all([ loadJSON('data/promo.json'), loadJSON('data/menu.json') ]);
  renderStories(promos);
  renderMenu(menu);
  setupActions(menu, promos);
  document.getElementById('year')?.remove(); // safety
}

function renderStories(promos){
  const container = document.getElementById('stories');
  const dots = document.getElementById('storyDots');
  container.innerHTML = ''; dots.innerHTML = '';
  promos.forEach((p, idx)=>{
    const wrap = document.createElement('div');
    wrap.className = 'story';
    const card = document.createElement('div'); card.className='story-card p-6 bg-white rounded-xl w-full';
    const img = document.createElement('img'); img.src = p.img || 'assets/banner.png';
    const meta = document.createElement('div'); meta.className='story-meta';
    meta.innerHTML = `<h3 class="text-2xl font-bold">${p.title}</h3><p class="mt-2">${p.subtitle || ''}</p><div class="mt-4 font-bold">R$ ${p.price.toFixed(2).replace('.',',')}</div>`;
    const btn = document.createElement('button'); btn.className='mt-4 bg-yellow-400 text-black px-4 py-2 rounded'; btn.textContent='+ Adicionar';
    btn.onclick = ()=> applyPromo(idx);
    meta.appendChild(btn);
    card.appendChild(img); card.appendChild(meta);
    wrap.appendChild(card);
    container.appendChild(wrap);
    const dot = document.createElement('div'); dot.className='dot'; dot.onclick = ()=> showStory(idx);
    dots.appendChild(dot);
  });
  showStory(0);
  let current = 0;
  setInterval(()=> showStory((current+1) % promos.length), 5000);
  function showStory(i){
    const slides = Array.from(container.children);
    slides.forEach((s,idx)=> s.style.display = (idx===i)?'block':'none');
    Array.from(dots.children).forEach((d,idx)=> d.className = idx===i ? 'dot active' : 'dot');
    current = i;
  }
}

function renderMenu(menu){
  // flavors
  const fcont = document.getElementById('flavors');
  menu.flavors.forEach(f=>{
    const btn = document.createElement('button'); btn.className='option px-3 py-2 bg-white rounded shadow';
    btn.textContent = f; btn.onclick = ()=> { selection.flavor = f; updateUI(); };
    fcont.appendChild(btn);
  });
  // sizes
  const scont = document.getElementById('sizes');
  menu.sizes.forEach(s=>{
    const btn = document.createElement('button'); btn.className='option px-3 py-2 bg-white rounded shadow';
    btn.textContent = `${s.name} — R$ ${s.price.toFixed(2).replace('.',',')}`; btn.onclick = ()=> { selection.size = s; updateUI(); };
    scont.appendChild(btn);
  });
  // sauces
  const sc = document.getElementById('sauces');
  menu.sauces.forEach(s=>{
    const btn = document.createElement('button'); btn.className='option px-3 py-2 bg-white rounded shadow';
    btn.textContent = s; btn.onclick = ()=> { selection.sauce = s; updateUI(); };
    sc.appendChild(btn);
  });
  // free ingredients
  const fi = document.getElementById('freeIngredients');
  menu.freeIngredients.forEach(i=>{
    const btn = document.createElement('button'); btn.className='option px-3 py-2 bg-white rounded shadow';
    btn.textContent = i; btn.onclick = ()=> toggleFree(i, btn);
    fi.appendChild(btn);
  });
  // premium
  const pm = document.getElementById('premium');
  menu.premium.forEach(p=>{
    const btn = document.createElement('button'); btn.className='option px-3 py-2 bg-white rounded shadow';
    btn.textContent = `${p.name} — R$ ${p.price.toFixed(2).replace('.',',')}`; btn.onclick = ()=> togglePremium(p, btn);
    pm.appendChild(btn);
  });
}

let selection = { flavor:null, size:null, sauce:null, free:[], premium:[] };

function toggleFree(val, btn){
  const i = selection.free.indexOf(val);
  if(i>-1){ selection.free.splice(i,1); btn.classList.remove('ring-2'); }
  else {
    if(selection.free.length>=6){ alert('Máx 6 ingredientes grátis'); return; }
    selection.free.push(val); btn.classList.add('ring-2');
  }
  document.getElementById('freeCounter').textContent = `Selecionados: ${selection.free.length} / 6`;
  updateUI();
}
function togglePremium(p, btn){
  const i = selection.premium.findIndex(x=>x.id===p.id);
  if(i>-1){ selection.premium.splice(i,1); btn.classList.remove('ring-2'); }
  else { selection.premium.push(p); btn.classList.add('ring-2'); }
  updateUI();
}

function updateUI(){
  const parts = [];
  if(selection.flavor) parts.push('Sabor: '+selection.flavor);
  if(selection.size) parts.push('Tamanho: '+selection.size.name);
  if(selection.sauce) parts.push('Calda: '+selection.sauce);
  if(selection.free.length) parts.push('Ingredientes: '+selection.free.join(', '));
  if(selection.premium.length) parts.push('Adicionais: '+selection.premium.map(x=>x.name).join(', '));
  document.getElementById('summaryText').textContent = parts.length? parts.join(' | ') : 'Nenhuma seleção.';
  document.getElementById('totalPrice').textContent = 'R$ ' + calcTotal().toFixed(2).replace('.',',');
}

function calcTotal(){
  let t = 0;
  if(selection.size) t += selection.size.price;
  selection.premium.forEach(p => t += p.price);
  return t;
}

function applyPromo(idx){
  loadJSON('data/promo.json').then(promos=>{
    const p = promos[idx];
    // preselect some defaults (first flavor / first size)
    loadJSON('data/menu.json').then(menu=>{
      selection.size = menu.sizes[0];
      selection.flavor = menu.flavors[0];
      selection.free = [];
      selection.premium = [];
      updateUI();
      window.scrollTo({ top: document.getElementById('builder').offsetTop, behavior:'smooth' });
      alert('Promoção aplicada. Ajuste e finalize o pedido.');
    });
  });
}

document.getElementById('sendWhatsapp')?.addEventListener('click', ()=>{
  if(!selection.flavor || !selection.size){ alert('Escolha sabor e tamanho'); return; }
  const lines = ['*Pedido Açaí Point*','Sabor: '+selection.flavor,'Tamanho: '+selection.size.name+' — R$'+selection.size.price.toFixed(2).replace('.',',')];
  if(selection.sauce) lines.push('Calda: '+selection.sauce);
  if(selection.free.length) lines.push('Ingredientes: '+selection.free.join(', '));
  if(selection.premium.length) lines.push('Adicionais: '+selection.premium.map(x=>x.name+' (R$'+x.price.toFixed(2)+')').join(', '));
  lines.push('Total: R$'+calcTotal().toFixed(2).replace('.',','));
  const msg = encodeURIComponent(lines.join('\n'));
  window.open('https://wa.me/'+WHATSAPP_PHONE+'?text='+msg, '_blank');
  // save locally
  const orders = JSON.parse(localStorage.getItem('acai_orders_v1') || '[]');
  orders.push({ id: Date.now(), timestamp: new Date().toISOString(), selection, total: calcTotal() });
  localStorage.setItem('acai_orders_v1', JSON.stringify(orders));
  alert('Pedido enviado e registrado localmente.');
});

function setupActions(menu, promos){
  // nothing else for now - placeholder
}

// init
initApp().catch(e=>console.error('Init error', e));

