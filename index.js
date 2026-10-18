// ===== Menú móvil =====
const menuBtn = document.querySelector('.menu-btn');
const menu = document.getElementById('menu');
menuBtn.addEventListener('click', () => {
  const abierto = menu.classList.toggle('abierto');
  menuBtn.setAttribute('aria-expanded', abierto);
});
menu.addEventListener('click', e => {
  if (e.target.tagName === 'A') { menu.classList.remove('abierto'); menuBtn.setAttribute('aria-expanded', 'false'); }
});

// ===== Modal de inicio de sesión =====
const login = document.getElementById('login');
document.querySelectorAll('[data-abrir-login]').forEach(b => b.addEventListener('click', () => login.showModal()));
document.querySelectorAll('[data-cerrar-login]').forEach(b => b.addEventListener('click', () => login.close()));
login.addEventListener('click', e => { if (e.target === login) login.close(); });

// ===== Registro de donante =====
const registro = document.getElementById('registro');
document.getElementById('abrir-registro').addEventListener('click', e => { e.preventDefault(); login.close(); registro.showModal(); });
document.querySelectorAll('[data-cerrar-registro]').forEach(b => b.addEventListener('click', () => registro.close()));
registro.addEventListener('click', e => { if (e.target === registro) registro.close(); });
const p1 = document.getElementById('r-pass'), p2 = document.getElementById('r-pass2');
const validar = () => p2.setCustomValidity(p1.value === p2.value ? '' : 'Las contraseñas no coinciden');
p1.addEventListener('input', validar); p2.addEventListener('input', validar);