// Core functionality: menu is loaded from menu.json (fallback to embedded MENU)
const WHATSAPP_PHONE = '5521981327706'; // number provided by user
const MENU_KEY = 'acai_menu_v1';
const ORDERS_KEY = 'acai_orders_v1';

const DEFAULT_MENU = {
  "sizes":[
    {"id":"s300","name":"300ml","price":8.00},
    {"id":"s400","name":"400ml","price":10.00},
    {"id":"s500","name":"500ml","price":13.00},
    {"id":"s700","name":"700ml","price":17.00},
    {"id":"s1l","name":"1 Litro","price":24.00}
  ],
  "flavors":[ "Banana","Morango","Maracujá","Natural","Cupuaçu" ],
  "sauces":[ "Chocolate","Morango","Uva","Caramelo","Maracujá","Kiwi","Graviola","Amora","Tutti Frutti","Menta","Banana Caramelada" ],
  "freeIngredients":[ "Leite em Pó","Paçoca","Amendoim","Granola","Chocoboll","Sucrilhos","Flocos de Arroz","Jujuba","Aveia","M&M","Ovomaltine","Cookies","Boll","Granulado" ],
  "premium":[
    {"id":"p60","name":"Nutella","price":7.00},
    {"id":"p61","name":"Creme de Avelã","price":5.00},
    {"id":"p62","name":"Creme Galak","price":5.00},
    {"id":"p63","name":"Creme de Amendoim","price":5.00},
    {"id":"p64","name":"Leite Condensado","price":2.00},
    {"id":"p65","name":"Calda Fini","price":2.00},
    {"id":"p66","name":"Fruta Morango","price":3.00},
    {"id":"p67","name":"Chantininho","price":3.00}
  ]
};

let MENU = JSON.parse(localStorage.getItem(MENU_KEY) || 'null') || DEFAULT_MENU;

// helper
function fmtBRL(v){ return 'R$ ' + v.toFixed(2).replace('.',','); }

// renderers
function el(container, html){ container.insertAdjacentHTML('beforeend', html); }

function renderOptions(){
  const flavors = document.getElementById('flavors');
  const sizes = document.getElementById('sizes');
  const sauces = document.getElementById('sauces');
  const freeIng = document.getElementById('freeIngredients');
  const premium = document.getElementById('premium');
  flavors.innerHTML=''; sizes.innerHTML=''; sauces.innerHTML=''; freeIng.innerHTML=''; premium.innerHTML='';

  MENU.flavors.forEach((f,i)=> el(flavors, `<div class="option" data-type="flavor" data-value="${f}">${f}</div>`));
  MENU.sizes.forEach(s=> el(sizes, `<div class="option" data-type="size" data-id="${s.id}" data-value="${s.name}" data-price="${s.price}">${s.name} — ${fmtBRL(s.price)}</div>`));
  MENU.sauces.forEach(s=> el(sauces, `<div class="option" data-type="sauce" data-value="${s}">${s}</div>`));
  MENU.freeIngredients.forEach(f=> el(freeIng, `<div class="option" data-type="free" data-value="${f}">${f}</div>`));
  MENU.premium.forEach(p=> el(premium, `<div class="option" data-type="premium" data-id="${p.id}" data-price="${p.price}">${p.name} — ${fmtBRL(p.price)}</div>`));

  attachOptionListeners();
}

let selection = {
  flavor: null,
  size: null,
  sauce: null,
  free: [],
  premium: []
};

function attachOptionListeners(){
  document.querySelectorAll('.option').forEach(elm=>{
    elm.onclick = ()=>{
      const type = elm.dataset.type;
      const value = elm.dataset.value;
      if(type==='flavor'){
        document.querySelectorAll('[data-type="flavor"]').forEach(n=>n.classList.remove('selected'));
        elm.classList.add('selected');
        selection.flavor = value;
      } else if(type==='size'){
        document.querySelectorAll('[data-type="size"]').forEach(n=>n.classList.remove('selected'));
        elm.classList.add('selected');
        selection.size = { id: elm.dataset.id, name: elm.dataset.value, price: parseFloat(elm.dataset.price) };
      } else if(type==='sauce'){
        document.querySelectorAll('[data-type="sauce"]').forEach(n=>n.classList.remove('selected'));
        elm.classList.add('selected');
        selection.sauce = value;
      } else if(type==='free'){
        // toggle with limit 6
        const val = value;
        const idx = selection.free.indexOf(val);
        if(idx>-1){
          selection.free.splice(idx,1); elm.classList.remove('selected');
        } else {
          if(selection.free.length>=6){ alert('Máximo de 6 ingredientes grátis'); return; }
          selection.free.push(val); elm.classList.add('selected');
        }
        document.getElementById('freeCounter').textContent = `Selecionados: ${selection.free.length} / 6`;
      } else if(type==='premium'){
        const id = elm.dataset.id;
        const price = parseFloat(elm.dataset.price);
        // toggle premium
        const idx = selection.premium.findIndex(x=>x.id===id);
        if(idx>-1){ selection.premium.splice(idx,1); elm.classList.remove('selected'); }
        else { selection.premium.push({id:id,name:elm.textContent.split(' — ')[0].trim(),price}); elm.classList.add('selected'); }
      }
      updateSummary();
    };
  });
}

function updateSummary(){
  const s = [];
  if(selection.flavor) s.push('Sabor: ' + selection.flavor);
  if(selection.size) s.push('Tamanho: ' + selection.size.name);
  if(selection.sauce) s.push('Calda: ' + selection.sauce);
  if(selection.free.length) s.push('Ingredientes: ' + selection.free.join(', '));
  if(selection.premium.length) s.push('Adicionais: ' + selection.premium.map(p=>p.name).join(', '));
  document.getElementById('summaryText').textContent = s.length? s.join(' | ') : 'Nenhuma seleção.';
  const total = calcTotal();
  document.getElementById('totalPrice').textContent = fmtBRL(total);
}

function calcTotal(){
  let t = 0;
  if(selection.size) t += selection.size.price;
  selection.premium.forEach(p=> t += p.price);
  return t;
}

function buildWhatsAppMessage(){
  if(!selection.size || !selection.flavor){ alert('Escolha pelo menos o sabor e o tamanho do açaí.'); return null; }
  const name = document.getElementById('customerName').value || '';
  const address = document.getElementById('customerAddress').value || '';
  const lines = ['*Pedido Açaí Point*'];
  lines.push(`Sabor: ${selection.flavor}`);
  lines.push(`Tamanho: ${selection.size.name} - ${fmtBRL(selection.size.price)}`);
  if(selection.sauce) lines.push(`Calda: ${selection.sauce}`);
  if(selection.free.length) lines.push(`Ingredientes (grátis): ${selection.free.join(', ')}`);
  if(selection.premium.length) lines.push(`Adicionais: ${selection.premium.map(p=>p.name+' ('+fmtBRL(p.price)+')').join(', ')}`);
  lines.push(`Total: ${fmtBRL(calcTotal())}`);
  if(name) lines.push(`Nome: ${name}`);
  if(address) lines.push(`Endereço: ${address}`);
  lines.push('Observações:');
  return encodeURIComponent(lines.join('\\n'));
}

function sendToWhatsApp(){
  const msg = buildWhatsAppMessage();
  if(!msg) return;
  // register order locally
  const orders = JSON.parse(localStorage.getItem(ORDERS_KEY) || '[]');
  const order = {
    id: Date.now(),
    timestamp: new Date().toISOString(),
    flavor: selection.flavor,
    size: selection.size,
    sauce: selection.sauce,
    free: selection.free,
    premium: selection.premium,
    total: calcTotal(),
    name: document.getElementById('customerName').value || '',
    address: document.getElementById('customerAddress').value || ''
  };
  orders.push(order);
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
  const url = `https://wa.me/${WHATSAPP_PHONE}?text=${msg}`;
  window.open(url,'_blank');
}

// admin quick open
document.getElementById('openAdmin').addEventListener('click', ()=>{
  window.open('admin.html','_blank');
});
document.getElementById('startOrder').addEventListener('click', ()=>{
  document.getElementById('builder').scrollIntoView({behavior:'smooth'});
});

document.getElementById('sendWhatsapp').addEventListener('click', sendToWhatsApp);

window.addEventListener('load', ()=>{
  renderOptions();
  document.getElementById('year').textContent = new Date().getFullYear();
  updateSummary();
});