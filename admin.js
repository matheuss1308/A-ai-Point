// Admin JS: login via /api/login, editors stored in localStorage
document.getElementById('doLogin')?.addEventListener('click', async ()=>{
  const login = document.getElementById('login').value;
  const password = document.getElementById('password').value;
  try{
    const res = await fetch('/api/login', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ login, password }) });
    const j = await res.json();
    if(j.success){
      document.getElementById('loginPanel').style.display = 'none';
      document.getElementById('adminArea').style.display = 'block';
      renderPromosEditor();
      renderMenuEditor();
      renderOrders();
    } else alert('Credenciais inválidas');
  } catch(e){ alert('Erro de conexão'); }
});

const PROMO_KEY = 'acai_promotions_v1';
const MENU_KEY = 'acai_menu_v1';
const ORDERS_KEY = 'acai_orders_v1';

function renderPromosEditor(){
  const el = document.getElementById('promosEditor'); el.innerHTML = '';
  const promos = JSON.parse(localStorage.getItem(PROMO_KEY) || '[]');
  promos.forEach((p,idx)=>{
    const row = document.createElement('div'); row.className='flex gap-2 items-center mb-2';
    row.innerHTML = `<input data-idx="${idx}" data-role="ptitle" value="${p.title}" class="border p-1 rounded"/> <input data-role="psub" value="${p.subtitle||''}" class="border p-1 rounded"/> <input data-role="pprice" value="${p.price}" class="border p-1 rounded"/> <button data-action="savePromo" data-idx="${idx}" class="bg-green-500 text-white px-2 py-1 rounded">Salvar</button> <button data-action="delPromo" data-idx="${idx}" class="bg-red-500 text-white px-2 py-1 rounded">Excluir</button> <button data-action="uploadImg" data-idx="${idx}" class="bg-blue-500 text-white px-2 py-1 rounded">Enviar Imagem</button>`;
    el.appendChild(row);
  });
  const btn = document.getElementById('addPromo');
  btn.onclick = ()=>{ const promos = JSON.parse(localStorage.getItem(PROMO_KEY) || '[]'); promos.push({ id:'p'+Date.now(), title:'Nova Promo', subtitle:'', price:0, img:null, duration:5000 }); localStorage.setItem(PROMO_KEY, JSON.stringify(promos)); renderPromosEditor(); };
  // attach event handlers for inner buttons
  el.querySelectorAll('button').forEach(b=> b.addEventListener('click',(ev)=>{
    const act = b.dataset.action; const idx = parseInt(b.dataset.idx);
    const promos = JSON.parse(localStorage.getItem(PROMO_KEY) || '[]');
    if(act==='savePromo'){ const inputs = b.parentElement.querySelectorAll('input'); promos[idx].title = inputs[0].value; promos[idx].subtitle = inputs[1].value; promos[idx].price = parseFloat(inputs[2].value) || 0; localStorage.setItem(PROMO_KEY, JSON.stringify(promos)); alert('Promo salva'); }
    if(act==='delPromo'){ if(confirm('Excluir?')){ promos.splice(idx,1); localStorage.setItem(PROMO_KEY, JSON.stringify(promos)); renderPromosEditor(); } }
    if(act==='uploadImg'){ const inp = document.createElement('input'); inp.type='file'; inp.accept='image/*'; inp.onchange = (e)=>{ const f = e.target.files[0]; const r = new FileReader(); r.onload = ()=>{ promos[idx].img = r.result; localStorage.setItem(PROMO_KEY, JSON.stringify(promos)); alert('Imagem salva localmente no admin.'); }; r.readAsDataURL(f); }; inp.click(); }
  }));
}

function renderMenuEditor(){
  const el = document.getElementById('menuEditor'); el.innerHTML = '';
  const menu = JSON.parse(localStorage.getItem(MENU_KEY) || JSON.stringify({sizes:[],flavors:[],sauces:[],freeIngredients:[],premium:[]}));
  (menu.sizes||[]).forEach((s, idx)=>{
    const row = document.createElement('div'); row.className='flex gap-2 items-center mb-2';
    row.innerHTML = `<input data-idx="${idx}" data-role="sname" value="${s.name}" class="border p-1 rounded"/> <input data-role="sprice" value="${s.price}" class="border p-1 rounded"/> <button data-action="delSize" data-idx="${idx}" class="bg-red-500 text-white px-2 py-1 rounded">Excluir</button> <button data-action="saveSize" data-idx="${idx}" class="bg-green-500 text-white px-2 py-1 rounded">Salvar</button>`;
    el.appendChild(row);
  });
  document.getElementById('addSize').onclick = ()=>{
    const menu = JSON.parse(localStorage.getItem(MENU_KEY) || JSON.stringify({sizes:[],flavors:[],sauces:[],freeIngredients:[],premium:[]})); 
    menu.sizes.push({ id:'s'+Date.now(), name:'Novo', price:0 }); 
    localStorage.setItem(MENU_KEY, JSON.stringify(menu)); renderMenuEditor();
  };
  // attach inner handlers
  el.querySelectorAll('button').forEach(b=> b.addEventListener('click', ()=>{
    const act = b.dataset.action; const idx = parseInt(b.dataset.idx);
    const menu = JSON.parse(localStorage.getItem(MENU_KEY) || JSON.stringify({sizes:[],flavors:[],sauces:[],freeIngredients:[],premium:[]})); 
    if(act==='delSize'){ if(confirm('Excluir esse tamanho?')){ menu.sizes.splice(idx,1); localStorage.setItem(MENU_KEY, JSON.stringify(menu)); renderMenuEditor(); } }
    if(act==='saveSize'){ const inputs = b.parentElement.querySelectorAll('input'); menu.sizes[idx].name = inputs[0].value; menu.sizes[idx].price = parseFloat(inputs[1].value) || 0; localStorage.setItem(MENU_KEY, JSON.stringify(menu)); alert('Tamanho salvo'); }
  }));
}

function renderOrders(){
  const el = document.getElementById('ordersList'); el.innerHTML = '';
  const orders = JSON.parse(localStorage.getItem(ORDERS_KEY) || '[]');
  if(!orders.length) el.innerHTML = '<div>Sem pedidos</div>';
  orders.slice().reverse().forEach(o=>{
    const d = document.createElement('div'); d.className='border-b py-2'; d.innerHTML = `<div><strong>${new Date(o.timestamp).toLocaleString()}</strong> — R$ ${o.total.toFixed(2)}</div><div>${o.selection.size?o.selection.size.name:''} ${o.selection.flavor||''}</div>`;
    el.appendChild(d);
  });
}

document.getElementById('closeDay')?.addEventListener('click', ()=>{
  const orders = JSON.parse(localStorage.getItem(ORDERS_KEY) || '[]');
  const today = new Date().toISOString().slice(0,10);
  let total=0,count=0;
  orders.forEach(o=>{ if(o.timestamp.slice(0,10)===today){ total+=o.total; count++; }});
  document.getElementById('dayTotal').textContent = `Pedidos hoje: ${count} — Total: R$ ${total.toFixed(2)}`;
});
