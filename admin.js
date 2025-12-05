// Admin logic: login -> renders editors -> saves to localStorage
const MENU_KEY = 'acai_menu_v3';
const ORDERS_KEY = 'acai_orders_v3';
const PROMOS_KEY = 'acai_promotions_v3';

// Attempt to load menu from localStorage, fallback to default in script.js
let menu = JSON.parse(localStorage.getItem(MENU_KEY) || 'null') || null;

function saveMenu(m){ localStorage.setItem(MENU_KEY, JSON.stringify(m)); renderMenuEditor(); }

function renderMenuEditor(){
  const el = document.getElementById('menuEditor');
  el.innerHTML = '';
  if(!menu){
    menu = JSON.parse(localStorage.getItem(MENU_KEY) || 'null') || (function(){ menu = window.MENU || null; if(!menu) menu = {sizes:[], premium:[]}; return menu; })();
  }
  // sizes
  const sizesHeader = document.createElement('h3'); sizesHeader.textContent='Tamanhos';
  el.appendChild(sizesHeader);
  (menu.sizes||[]).forEach((s,idx)=>{
    const div = document.createElement('div'); div.className='menu-item';
    div.innerHTML = `<input data-role="name" value="${s.name}" /> <input data-role="price" value="${s.price}" /> <button data-action="save" data-idx="${idx}">Salvar</button> <button data-action="delSize" data-idx="${idx}">Excluir</button>`;
    el.appendChild(div);
  });

  // premium
  const premHeader = document.createElement('h3'); premHeader.textContent='Premium';
  el.appendChild(premHeader);
  (menu.premium||[]).forEach((p,idx)=>{
    const div = document.createElement('div'); div.className='menu-item';
    div.innerHTML = `<input data-role="pname" value="${p.name}" /> <input data-role="pprice" value="${p.price}" /> <button data-action="saveP" data-idx="${idx}">Salvar</button> <button data-action="delP" data-idx="${idx}">Excluir</button>`;
    el.appendChild(div);
  });

  // attach events
  el.querySelectorAll('button').forEach(b=>{
    b.onclick = ()=>{
      const act = b.dataset.action; const idx = parseInt(b.dataset.idx);
      if(act==='save'){
        const inputs = el.querySelectorAll('.menu-item')[idx].querySelectorAll('input');
        menu.sizes[idx].name = inputs[0].value;
        menu.sizes[idx].price = parseFloat(inputs[1].value) || 0;
        saveMenu(menu);
      } else if(act==='delSize'){
        if(confirm('Excluir tamanho?')) menu.sizes.splice(idx,1), saveMenu(menu);
      } else if(act==='saveP'){
        const premiumDivs = Array.from(el.querySelectorAll('.menu-item')).slice(menu.sizes.length);
        const inputs = premiumDivs[idx].querySelectorAll('input');
        menu.premium[idx].name = inputs[0].value;
        menu.premium[idx].price = parseFloat(inputs[1].value) || 0;
        saveMenu(menu);
      } else if(act==='delP'){
        menu.premium.splice(idx,1); saveMenu(menu);
      }
    };
  });
}

// Promotions editor
function renderPromotionsEditor(){
  const el = document.getElementById('promosEditor');
  el.innerHTML='';
  const promos = JSON.parse(localStorage.getItem(PROMOS_KEY) || '[]');
  promos.forEach((p,idx)=>{
    const div = document.createElement('div'); div.className='menu-item';
    div.innerHTML = `<input data-role="ptitle" value="${p.title}" /> <input data-role="psub" value="${p.subtitle||''}" /> <input data-role="pprice" value="${p.price}" /> <button data-action="savePromo" data-idx="${idx}">Salvar</button> <button data-action="delPromo" data-idx="${idx}">Excluir</button> <button data-action="uploadImg" data-idx="${idx}">Enviar Imagem</button>`;
    el.appendChild(div);
  });
  const addBtn = document.createElement('button'); addBtn.textContent='Adicionar promoção'; addBtn.className='btn';
  addBtn.onclick = ()=>{
    promos.push({id:'pr'+Date.now(), title:'Nova Promo', subtitle:'', price:0, img:null, duration:5000});
    localStorage.setItem(PROMOS_KEY, JSON.stringify(promos)); renderPromotionsEditor();
  };
  el.appendChild(addBtn);

  el.querySelectorAll('button').forEach(b=>{
    b.onclick = (ev)=>{
      const act = b.dataset.action; const idx = parseInt(b.dataset.idx);
      const promos = JSON.parse(localStorage.getItem(PROMOS_KEY) || '[]');
      if(act==='savePromo'){
        const nodes = b.parentElement.querySelectorAll('input');
        promos[idx].title = nodes[0].value;
        promos[idx].subtitle = nodes[1].value;
        promos[idx].price = parseFloat(nodes[2].value)||0;
        localStorage.setItem(PROMOS_KEY, JSON.stringify(promos)); alert('Promoção salva.');
      } else if(act==='delPromo'){
        if(confirm('Excluir promoção?')){ promos.splice(idx,1); localStorage.setItem(PROMOS_KEY, JSON.stringify(promos)); renderPromotionsEditor(); }
      } else if(act==='uploadImg'){
        const inp = document.createElement('input'); inp.type='file'; inp.accept='image/*';
        inp.onchange = (e)=>{
          const file = e.target.files[0];
          const reader = new FileReader();
          reader.onload = ()=>{
            promos[idx].img = reader.result;
            localStorage.setItem(PROMOS_KEY, JSON.stringify(promos)); alert('Imagem salva na promoção.');
          };
          reader.readAsDataURL(file);
        };
        inp.click();
      }
    };
  });
}

// Orders & chart
function renderOrders(){
  const el = document.getElementById('ordersList');
  el.innerHTML='';
  const orders = JSON.parse(localStorage.getItem(ORDERS_KEY) || '[]');
  if(orders.length===0){ el.innerHTML='<p>Sem pedidos ainda.</p>'; return; }
  orders.slice().reverse().forEach(o=>{
    const d = new Date(o.timestamp);
    const div = document.createElement('div'); div.className='order';
    div.innerHTML = `<div><strong>${d.toLocaleString()}</strong> — ${o.size.name} ${o.flavor} — R$ ${o.total.toFixed(2)}</div><div>Itens: ${(o.free||[]).join(', ')} ${ (o.premium||[]).map(p=>p.name).join(', ') }</div><div>Nome: ${o.name || '-' } End: ${o.address || '-'}</div>`;
    el.appendChild(div);
  });
}

document.getElementById('addSize')?.addEventListener('click', ()=>{
  const name = prompt('Nome do tamanho (ex: 300ml):'); const price = parseFloat(prompt('Preço (ex: 8.00):')) || 0;
  menu.sizes.push({id:'s'+Date.now(), name, price}); saveMenu(menu);
});
document.getElementById('addPremium')?.addEventListener('click', ()=>{
  const name = prompt('Nome do complemento premium:'); const price = parseFloat(prompt('Preço:')) || 0;
  menu.premium.push({id:'p'+Date.now(), name, price}); saveMenu(menu);
});

// Close day and chart
document.getElementById('closeDay')?.addEventListener('click', ()=>{
  const orders = JSON.parse(localStorage.getItem(ORDERS_KEY) || '[]');
  const today = new Date().toISOString().slice(0,10);
  let total = 0, count=0;
  orders.forEach(o=>{ if(o.timestamp.slice(0,10)===today){ total+=o.total; count++; } });
  document.getElementById('dayTotal').textContent = `Pedidos hoje: ${count} — Total: R$ ${total.toFixed(2)}`;
  renderChart();
});

function renderChart(){
  const orders = JSON.parse(localStorage.getItem(ORDERS_KEY) || '[]');
  const days = {};
  for(let i=6;i>=0;i--){ const d=new Date(); d.setDate(d.getDate()-i); days[d.toISOString().slice(0,10)]=0; }
  orders.forEach(o=>{ const k=o.timestamp.slice(0,10); if(k in days) days[k]+=o.total; });
  const labels = Object.keys(days); const data = Object.values(days);
  const ctx = document.getElementById('salesChart').getContext('2d');
  if(window._chart) window._chart.destroy();
  window._chart = new Chart(ctx, { type:'line', data:{ labels, datasets:[{ label:'Vendas (R$)', data }] }, options:{} });
}

// Login handler: uses /api/login
document.getElementById('loginForm')?.addEventListener('submit', async (e)=>{
  e.preventDefault();
  const login = document.getElementById('login').value;
  const password = document.getElementById('password').value;
  try{
    const res = await fetch('/api/login', {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({login, password})});
    const json = await res.json();
    if(json.success){
      document.getElementById('loginPanel').style.display='none';
      document.getElementById('adminArea').style.display='block';
      // load menu if not set
      menu = JSON.parse(localStorage.getItem(MENU_KEY) || 'null') || (window.MENU || null);
      renderMenuEditor();
      renderPromotionsEditor();
      renderOrders();
      renderChart();
    } else alert('Credenciais inválidas');
  }catch(e){ alert('Erro ao verificar credenciais.'); }
});
