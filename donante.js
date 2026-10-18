// ===== Utilidades =====
const $ = id => document.getElementById(id);
const el = (t, c, x) => { const e = document.createElement(t); if (c) e.className = c; if (x !== undefined) e.textContent = x; return e; };

// ===== Catálogo de módulos y tipos de artículo (sepáralos con |) =====
const catalogo = {
  'Ropa': 'Camiseta|Camisa|Blusa|Top|Sudadera|Jersey|Chaqueta|Abrigo|Chaleco|Cazadora|Pantalón|Vaqueros|Shorts|Falda|Vestido|Mono|Peto|Mallas|Pijama|Ropa interior|Traje de baño|Calcetines',
  'Calzado': 'Zapatillas deportivas|Zapatos de vestir / Formales|Botas|Botines|Sandalias / Chanclas|Bailarinas / Manoletinas|Mocasines|Calzado infantil / Bebé|Zapatillas de estar por casa|Botas de agua / Trabajo',
  'Útiles escolares': 'Cuadernos / Libretas|Lápices / Portaminas|Bolígrafos / Plumas|Colores / Rotuladores|Marcadores|Reglas / Escuadras / Transportador|Estuches / Cartucheras|Mochilas / Correajes|Tijeras|Pegamento|Sacapuntas|Gomas de borrar|Calculadoras',
  'Artículos para bebé': 'Pañales|Toallitas húmedas|Biberones|Chupetes|Baberos|Cunas / Cunas de viaje|Cochecitos / Sillas de paseo|Porteadores / Mochilas portabebés|Bañeras / Artículos de baño infantil|Mantas / Sacos de dormir|Mordedores / Sonajeros',
  'Productos de higiene personal': 'Jabón de cuerpo / Gel de ducha|Champú / Acondicionador|Pasta de dientes / Cepillo dental|Desodorante|Crema hidratante / Corporal|Cuidado facial|Productos de afeitado / Depilación|Higiene femenina|Cortaúñas / Limas|Peines / Cepillos para cabello',
  'Productos de limpieza': 'Detergente para ropa|Suavizante|Lavavajillas / Detergente para platos|Limpiahogares / Multiusos|Desinfectante / Lejía / Cloro|Limpiacristales|Estropajos / Esponjas / Bayetas|Escobas / Fregonas / Mopas|Bolsas de basura|Quitaagrasas / Desengrasante',
  'Alimentos': 'Arroz / Legumbres|Pasta|Aceite / Vinagre / Condimentos|Enlatados / Conservas|Harinas / Cereales|Leche / Lácteos|Galletas / Snacks|Azúcar / Sal / Café|Bebidas / Zumos|Comida no perecedera',
  'Juguetes': 'Muñecos / Figuras de acción|Juegos de mesa / Puzles / Rompecabezas|Peluches|Bloques de construcción|Vehículos / Coches / Trenes|Juguetes educativos / Didácticos|Manualidades / Plastilina|Pelotas / Artículos deportivos infantiles|Disfraces|Instrumentos musicales de juguete',
  'Otros': 'Cobijas / Cobertores|Libros|Utensilios de cocina'
};
const OTRO = 'Otro (escribir)';
const cats = Object.keys(catalogo);
const meses = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

// ===== Centros de acopio (cámbialos por los reales o tráelos de la base de datos) =====
const centros = [
  { id: 'c1', nombre: '[Centro de acopio 1]', dir: '[Dirección]', horario: '[Horario de recepción]', tel: '[Teléfono]', necesita: ['[Artículo urgente]', '[Artículo 2]'] },
  { id: 'c2', nombre: '[Centro de acopio 2]', dir: '[Dirección]', horario: '[Horario de recepción]', tel: '[Teléfono]', necesita: ['[Artículo 1]', '[Artículo 2]'] },
  { id: 'c3', nombre: '[Centro de acopio 3]', dir: '[Dirección]', horario: '[Horario de recepción]', tel: '[Teléfono]', necesita: ['[Artículo 1]', '[Artículo 2]'] }
];

// ===== Datos en memoria: aquí se conectará la base de datos =====
const items = [], entregas = [];
let editando = null, nid = 1;
const semana = d => Math.floor(d / 6048e5);
const fmt = d => new Date(d + 'T00:00').toLocaleDateString('es-MX', { day: 'numeric', month: 'long' });

// ===== Ventanas y pestañas =====
document.querySelectorAll('[data-dlg]').forEach(b => b.onclick = () => $(b.dataset.dlg).showModal());
document.querySelectorAll('dialog').forEach(d => d.addEventListener('click', e => { if (e.target === d || e.target.hasAttribute('data-cerrar')) d.close(); }));
document.querySelectorAll('#d-reco form, #d-error form').forEach(f => f.onsubmit = e => { e.preventDefault(); f.reset(); f.closest('dialog').close(); });
const tabs = document.querySelectorAll('[data-tab]');
tabs.forEach(t => t.onclick = () => {
  tabs.forEach(x => x.classList.toggle('activo', x === t));
  document.querySelectorAll('.panel').forEach(p => p.hidden = p.id !== t.dataset.tab);
});
function gracias() { const g = $('gracias'); g.hidden = false; setTimeout(() => g.hidden = true, 3000); }

// ===== Formulario de artículo (agregar / editar) =====
function llenarTipos(cat) {
  const t = $('a-tipo'); t.replaceChildren();
  catalogo[cat].split('|').concat(OTRO).forEach(x => t.append(new Option(x)));
}
function ajustar() {
  $('w-otro').hidden = $('a-tipo').value !== OTRO;
  $('a-otro').required = !$('w-otro').hidden;
  $('w-cad').hidden = $('a-cat').value !== 'Alimentos';
}
cats.forEach(c => $('a-cat').append(new Option(c)));
llenarTipos(cats[0]); ajustar();
$('a-cat').onchange = () => { llenarTipos($('a-cat').value); ajustar(); };
$('a-tipo').onchange = ajustar;
$('d-art').addEventListener('close', () => {
  editando = null; $('f-art').reset(); $('t-art').textContent = 'Agregar artículo';
  llenarTipos($('a-cat').value); ajustar();
});
$('f-art').onsubmit = e => {
  e.preventDefault();
  const tipo = $('a-tipo').value;
  const d = {
    cat: $('a-cat').value, tipo, nom: tipo === OTRO ? $('a-otro').value.trim() : tipo,
    cant: $('a-cant').value, cond: $('a-cond').value,
    cad: $('w-cad').hidden ? '' : $('a-cad').value, nota: $('a-nota').value.trim()
  };
  if (editando) Object.assign(editando, d); else items.push({ ...d, estado: 'Pendiente', alta: Date.now(), ent: null });
  $('d-art').close(); render();
};

// ===== Ver información, editar, eliminar =====
function ver(i) {
  const f = $('ver-cuerpo'); f.replaceChildren();
  [['Artículo', i.nom], ['Módulo', i.cat], ['Cantidad', i.cant], ['Condición', i.cond], ['Estado', i.estado],
   ['Centro de acopio', i.ent ? i.ent.centro.nombre : 'Aún sin donar'],
   i.cad && ['Caducidad', new Date(i.cad + 'T00:00').toLocaleDateString('es-MX')],
   ['Agregado', new Date(i.alta).toLocaleDateString('es-MX')], i.nota && ['Notas', i.nota]]
    .filter(Boolean).forEach(([k, v]) => { const r = el('p', 'dato'); r.append(el('strong', '', k + ': '), document.createTextNode(v)); f.append(r); });
  $('ver-edit').onclick = () => { $('d-ver').close(); editar(i); };
  $('ver-del').onclick = () => { $('d-ver').close(); eliminar(i); };
  $('d-ver').showModal();
}
function editar(i) {
  editando = i; $('t-art').textContent = 'Editar artículo';
  $('a-cat').value = i.cat; llenarTipos(i.cat); $('a-tipo').value = i.tipo;
  $('a-otro').value = i.tipo === OTRO ? i.nom : '';
  $('a-cant').value = i.cant; $('a-cond').value = i.cond; $('a-cad').value = i.cad; $('a-nota').value = i.nota;
  ajustar(); $('d-art').showModal();
}
function eliminar(i) {
  if (i.ent) { alert('Este artículo está en una donación. Cancela primero la entrega en "Tus donaciones".'); return; }
  if (confirm('¿Eliminar "' + i.nom + '" de tu inventario?')) { items.splice(items.indexOf(i), 1); render(); }
}

// ===== Donar: centro + artículos + fecha y hora =====
centros.forEach(c => $('d-centro').append(new Option(c.nombre, c.id)));
function infoCentro() {
  const c = centros.find(x => x.id === $('d-centro').value);
  $('d-info').textContent = c ? 'Horario: ' + c.horario + ' · ' + c.dir : '';
}
$('d-centro').onchange = infoCentro;
function abrirDonar(cid) {
  const libres = items.filter(i => !i.ent && i.estado === 'Pendiente');
  const l = $('donar-lista'); l.replaceChildren();
  libres.forEach(i => {
    const lb = el('label', 'check'), c = document.createElement('input');
    c.type = 'checkbox'; c.value = items.indexOf(i);
    lb.append(c, document.createTextNode(i.nom + ' × ' + i.cant + ' (' + i.cat + ')')); l.append(lb);
  });
  $('donar-vacio').hidden = libres.length > 0;
  $('donar-ok').hidden = !libres.length;
  if (cid) $('d-centro').value = cid;
  infoCentro(); $('d-donar').showModal();
}
$('b-donar').onclick = () => abrirDonar();
$('d-fecha').min = new Date().toISOString().slice(0, 10);
$('f-donar').onsubmit = e => {
  e.preventDefault();
  const sel = [...$('donar-lista').querySelectorAll('input:checked')].map(c => items[c.value]);
  if (!sel.length) { alert('Selecciona al menos un artículo.'); return; }
  const en = { id: nid++, centro: centros.find(c => c.id === $('d-centro').value), fecha: $('d-fecha').value, hora: $('d-hora').value, nota: $('d-nota').value.trim(), items: sel };
  sel.forEach(i => i.ent = en); entregas.push(en);
  e.target.reset(); $('d-donar').close(); render();
  document.querySelector('[data-tab="p-don"]').click();
};

// ===== SOLO PARA PRUEBAS: el centro de acopio cambiará el estado desde su panel =====
// En la consola del navegador: centroActualiza(0, 'Listo para entregar')  o  centroActualiza(0, 'Entregado')
window.centroActualiza = (n, estado) => {
  const i = items[n]; if (!i) return;
  i.estado = estado;
  if (estado === 'Entregado') { i.fecha = Date.now(); gracias(); }
  render();
};

// ===== Tarjetas de centros (se dibujan una vez) =====
centros.forEach(c => {
  const a = el('article', 'tarjeta'); a.append(el('h3', '', c.nombre));
  a.append(el('p', '', 'Dirección: ' + c.dir), el('p', '', 'Horario: ' + c.horario), el('p', '', 'Teléfono: ' + c.tel));
  a.append(el('h4', '', 'Lo que necesitamos ahora'));
  const ul = el('ul', 'necesita');
  c.necesita.forEach(n => { const li = el('li'); li.append(el('span', '', n), el('b', '', 'Se necesita')); ul.append(li); });
  const b = el('button', 'btn', 'Donar aquí'); b.onclick = () => abrirDonar(c.id);
  a.append(ul, b); $('centros-lista').append(a);
});

const badge = e => el('span', 'badge' + (e === 'Entregado' ? ' ok' : e === 'Listo para entregar' ? ' listo' : ''), e);

// ===== Dibujar todo =====
function render() {
  const anio = new Date().getFullYear();
  const entregados = items.filter(i => i.estado === 'Entregado');
  const activos = items.filter(i => i.estado !== 'Entregado');
  const listos = activos.filter(i => i.estado === 'Listo para entregar');

  // Inventario por módulos (el estado solo se muestra: lo cambia el centro)
  const q = $('buscar').value.trim().toLowerCase(), cont = $('inv-lista');
  cont.replaceChildren();
  cats.forEach(c => {
    const f = activos.filter(i => i.cat === c && (i.nom + ' ' + i.cat).toLowerCase().includes(q));
    if (!f.length) return;
    const m = el('article', 'tarjeta modulo'); m.append(el('h3', '', c));
    f.forEach(i => {
      const r = el('div', 'art'), n = el('span', 'art-nom', i.nom + ' × ' + i.cant);
      const sm = el('small', '', i.ent ? 'Entrega en ' + i.ent.centro.nombre + ' · ' + fmt(i.ent.fecha) : 'Aún sin donar');
      const b = el('div', 'acciones');
      [['Ver', () => ver(i)], ['Editar', () => editar(i)], ['Eliminar', () => eliminar(i)]].forEach(([t, fn]) => {
        const x = el('button', '', t); x.onclick = fn; b.append(x);
      });
      r.append(n, badge(i.estado), b, sm); m.append(r);
    });
    cont.append(m);
  });
  $('inv-vacio').hidden = activos.length > 0;

  // Tus donaciones (entregas por centro)
  const dl = $('don-lista'); dl.replaceChildren();
  entregas.sort((a, b) => a.fecha.localeCompare(b.fecha)).forEach(en => {
    const t = el('article', 'tarjeta entrega');
    t.append(el('h3', '', en.centro.nombre), el('p', 'meta', fmt(en.fecha) + ' · ' + en.hora + ' · ' + en.centro.dir));
    en.items.forEach(i => { const r = el('div', 'art'); r.append(el('span', '', i.nom + ' × ' + i.cant), badge(i.estado)); t.append(r); });
    if (en.nota) t.append(el('p', 'meta', 'Nota: ' + en.nota));
    if (en.items.every(i => i.estado === 'Pendiente')) {
      const x = el('button', 'btn claro', 'Cancelar entrega');
      x.onclick = () => { if (confirm('¿Cancelar esta entrega?')) { en.items.forEach(i => i.ent = null); entregas.splice(entregas.indexOf(en), 1); render(); } };
      t.append(x);
    }
    dl.append(t);
  });
  $('don-vacio').hidden = entregas.length > 0;

  // Resumen y recordatorio
  const delAnio = entregados.filter(i => new Date(i.fecha).getFullYear() === anio);
  const prox = entregas.filter(en => en.items.some(i => i.estado !== 'Entregado'));
  $('s-don').textContent = delAnio.reduce((t, i) => t + Number(i.cant), 0);
  $('s-pen').textContent = activos.reduce((t, i) => t + Number(i.cant), 0);
  $('s-cita').textContent = prox.length ? fmt(prox[0].fecha) : '—';
  const av = $('aviso');
  av.hidden = !listos.length;
  av.textContent = listos.length ? 'El centro marcó ' + listos.length + ' artículo(s) como listos para entregar. Llévalos en la fecha acordada.' : '';

  // Racha (semanas seguidas con al menos una entrega recibida)
  const sem = new Set(entregados.map(i => semana(i.fecha)));
  let w = semana(Date.now()); if (!sem.has(w)) w--;
  let racha = 0; while (sem.has(w)) { racha++; w--; }
  $('racha-n').textContent = racha;
  document.querySelectorAll('.dias i').forEach((d, k) => d.style.background = k < racha ? 'var(--azul-500)' : '');

  // Logros
  const logros = [
    ['Primera donación', entregados.length >= 1], ['5 artículos donados', entregados.length >= 5],
    ['Racha de 4 semanas', racha >= 4], ['Primera entrega programada', entregas.length >= 1]
  ];
  const lg = $('logros'); lg.replaceChildren();
  logros.forEach(([t, ok]) => lg.append(el('span', 'logro' + (ok ? ' on' : ''), (ok ? '★ ' : '☆ ') + t)));

  // Tabla anual
  $('anual').replaceChildren(...meses.map((m, k) => {
    const tr = el('tr'), n = delAnio.filter(i => new Date(i.fecha).getMonth() === k).reduce((t, i) => t + Number(i.cant), 0);
    tr.append(el('td', '', m), el('td', '', n)); return tr;
  }));
}

$('buscar').oninput = render;
$('anio').textContent = new Date().getFullYear();
render();