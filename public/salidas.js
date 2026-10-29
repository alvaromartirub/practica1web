// Acordeón de salidas profesionales.
//
// El HTML se entrega con todos los paneles abiertos (aria-expanded="true"), así que
// sin JavaScript la página sigue siendo legible. Este script los cierra al cargar y
// permite abrirlos y cerrarlos con el botón de cada título.

const botones = document.querySelectorAll('.acordeon__boton');
const botonTodas = document.querySelector('#alternar-todas');

// Abre o cierra un panel según el valor de "abrir" (true / false).
function fijarEstado(boton, abrir) {
  const panel = document.getElementById(boton.getAttribute('aria-controls'));
  boton.setAttribute('aria-expanded', String(abrir));
  panel.classList.toggle('acordeon__panel--cerrado', !abrir);
}

// ¿Está abierto este botón?
function estaAbierto(boton) {
  return boton.getAttribute('aria-expanded') === 'true';
}

// Actualiza el texto del botón "Expandir todas / Contraer todas".
function actualizarBotonTodas() {
  const todasAbiertas = Array.from(botones).every(estaAbierto);
  botonTodas.textContent = todasAbiertas ? 'Contraer todas' : 'Expandir todas';
}

// Al cargar: cerrar todos los paneles.
botones.forEach((boton) => {
  fijarEstado(boton, false);

  boton.addEventListener('click', () => {
    fijarEstado(boton, !estaAbierto(boton));
    actualizarBotonTodas();
  });
});

// El botón "Expandir todas" solo tiene sentido con JavaScript, por eso empieza oculto en el HTML.
botonTodas.hidden = false;
botonTodas.addEventListener('click', () => {
  const abrir = !Array.from(botones).every(estaAbierto);
  botones.forEach((boton) => fijarEstado(boton, abrir));
  actualizarBotonTodas();
});

actualizarBotonTodas();
