// Admin functionality - uses same MENU_KEY and ORDERS_KEY as front-end
const MENU_KEY = 'acai_menu_v1';
const ORDERS_KEY = 'acai_orders_v1';
const menu = JSON.parse(localStorage.getItem(MENU_KEY) || 'null') || (function(){ alert('Menu não encontrado - carregando padrão.'); return null; })();

function saveMenu(m){ localStorage.setItem(MENU_KEY, JSON.stringify(m)); renderMenuEditor(); }

function renderMenuEditor(){
  const el = document.getElementById('menuEditor');
  el.innerHTML = '';
  if(!menu){ el.innerHTML = '<p>Menu vazio.</p>'; return; }
  // sizes
  el.insertAdjacentHTML('beforeend','<h3>Tamanhos</h3>');
  menu.sizes.forEach((s,idx)=>{
    const div = document.createElement('div'); div.className='menu-item';
    div.innerHTML = `<input data-role="name" value="${s.name}" /> <input data-role="price" value="${s.price}" /> <button data-action="save" data-idx="${idx}">Salvar</button> <button data-action="delSize" data-idx="${idx}">Excluir</button>`;
    el.appendChild(div);
  });
  // premium
  el.insertAdjacentHTML('beforeend','<h3>Premium</h3>');
  menu.premium.forEach((p,idx)=>{
    const div = document.createElement('div'); div.className='menu-item';
    div.innerHTML = `<input data-role="pname" value="${p.name}" /> <input data-role="pprice" value="${p.price}" /> <button data-action="saveP" data-idx="${idx}">Salvar</button> <button data-action="delP" data-idx="${idx}">Excluir</button>`;
    el.appendChild(div);
  });

  // attach events
  el.querySelectorAll('button').forEach(b=>{
    b.onclick = (ev)=>{
      const act = b.dataset.action;
      const idx = parseInt(b.dataset.idx);
      if(act==='save'){
        const inputs = el.querySelectorAll('.menu-item')[idx].querySelectorAll('input');
        menu.sizes[idx].name = inputs[0].value;
        menu.sizes[idx].price = parseFloat(inputs[1].value) || 0;
        saveMenu(menu);
      } else if(act==='delSize'){
        if(confirm('Excluir tamanho?')) menu.sizes.splice(idx,1), saveMenu(menu);
      } else if(act==='saveP'){
        const pindex = idx + menu.sizes.length; // not exact; instead query premium items nodes
        const premNodes = Array.from(el.querySelectorAll('h3')).findIndex(h=>h.textContent.includes('Premium'));
        // simpler: find premium inputs by selecting where data-role p*
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

document.getElementById('addSize').addEventListener('click', ()=>{
  const name = prompt('Nome do tamanho (ex: 300ml):'); const price = parseFloat(prompt('Preço (ex: 8.00):')) || 0;
  menu.sizes.push({id:'s'+Date.now(), name, price}); saveMenu(menu);
});
document.getElementById('addPremium').addEventListener('click', ()=>{
  const name = prompt('Nome do complemento premium:'); const price = parseFloat(prompt('Preço:')) || 0;
  menu.premium.push({id:'p'+Date.now(), name, price}); saveMenu(menu);
});

function renderOrders(){
  const el = document.getElementById('ordersList'); el.innerHTML='';
  const orders = JSON.parse(localStorage.getItem(ORDERS_KEY) || '[]');
  if(orders.length===0){ el.innerHTML='<p>Sem pedidos ainda.</p>'; return; }
  orders.slice().reverse().forEach(o=>{
    const d = new Date(o.timestamp);
    const div = document.createElement('div'); div.className='order';
    div.innerHTML = `<div><strong>${d.toLocaleString()}</strong> — ${o.size.name} ${o.flavor} — ${o.total.toFixed(2)}</div><div>Itens: ${ (o.free||[]).join(', ') } ${ (o.premium||[]).map(p=>p.name).join(', ') }</div><div>Nome: ${o.name} End: ${o.address}</div>`;
    el.appendChild(div);
  });
}

document.getElementById('closeDay').addEventListener('click', ()=>{
  const orders = JSON.parse(localStorage.getItem(ORDERS_KEY) || '[]');
  const today = new Date().toISOString().slice(0,10);
  // sum today
  let total = 0; let count=0;
  orders.forEach(o=>{ if(o.timestamp.slice(0,10)===today){ total+=o.total; count++; } });
  document.getElementById('dayTotal').textContent = `Pedidos hoje: ${count} — Total: R$ ${total.toFixed(2)}`;
  // For chart: aggregate last 7 days totals
  renderChart();
});

function renderChart(){
  const orders = JSON.parse(localStorage.getItem(ORDERS_KEY) || '[]');
  const days = {};
  for(let i=6;i>=0;i--){
    const d = new Date(); d.setDate(d.getDate()-i); const key = d.toISOString().slice(0,10); days[key]=0;
  }
  orders.forEach(o=>{ const k=o.timestamp.slice(0,10); if(k in days) days[k]+=o.total; });
  const labels = Object.keys(days);
  const data = Object.values(days);
  const ctx = document.getElementById('salesChart').getContext('2d');
  if(window._chart) window._chart.destroy();
  window._chart = new Chart(ctx, { type:'line', data:{ labels, datasets:[{ label:'Vendas (R$)', data }] }, options:{} });
}

window.addEventListener('load', ()=>{
  if(!localStorage.getItem(MENU_KEY)) alert('Nenhum menu salvo localmente — verifique o site principal.');
  renderMenuEditor(); renderOrders(); renderChart();
});