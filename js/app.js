// ============================================================
// GiftSwap – app.js  (wizard multi-paso)
// ============================================================

let pasoActual = 1;
const TOTAL_PASOS = 6;

let participantes = [];
let exclusiones    = [];
let tipoSeleccionado      = '';
let fechaSeleccionada     = '';
let presupuestoSeleccionado = '';
let hayExclusiones = false;

// Índice para drag & drop de reordenamiento
let dragSrcIndex = null;

// ── Inicialización ──────────────────────────────────────────
window.onload = function () {
  renderProgress();
  mostrarPaso(1);
  generarFechasRapidas();
};

// ── Progreso ────────────────────────────────────────────────
function renderProgress() {
  const labels = ['Organizador','Participantes','Exclusiones','Evento','Fecha','Presupuesto'];
  const stepsEl = document.getElementById('progressSteps');
  stepsEl.innerHTML = '';
  labels.forEach((l, i) => {
    const dot = document.createElement('div');
    dot.className = 'prog-dot' + (i + 1 === pasoActual ? ' active' : '') + (i + 1 < pasoActual ? ' done' : '');
    dot.title = l;
    stepsEl.appendChild(dot);
  });
  const pct = ((pasoActual - 1) / (TOTAL_PASOS - 1)) * 100;
  document.getElementById('progressFill').style.width = pct + '%';
}

function mostrarPaso(n) {
  document.querySelectorAll('.wizard-step').forEach(s => s.classList.add('d-none'));
  document.getElementById('paso' + n).classList.remove('d-none');
  pasoActual = n;
  renderProgress();

  // Acciones al entrar a ciertos pasos
  if (n === 3) renderExclusionesPaso();
  if (n === 5) actualizarTitFecha();
}

function siguientePaso() {
  if (!validarPaso(pasoActual)) return;
  if (pasoActual < TOTAL_PASOS) mostrarPaso(pasoActual + 1);
}

function anteriorPaso() {
  if (pasoActual > 1) mostrarPaso(pasoActual - 1);
}

// ── Validaciones por paso ───────────────────────────────────
function validarPaso(n) {
  if (n === 1) {
    const org = document.getElementById('organizador').value.trim();
    if (!org) { alert('Escribe tu nombre como organizador'); return false; }
  }
  if (n === 2) {
    if (participantes.length < 2) {
      alert('Agrega al menos 2 participantes'); return false;
    }
  }
  if (n === 4) {
    if (!tipoSeleccionado) { alert('Selecciona el tipo de evento'); return false; }
    if (tipoSeleccionado === 'Otro') {
      const nom = document.getElementById('nombreEvento').value.trim();
      if (!nom) { alert('Escribe el nombre de la celebración'); return false; }
    }
  }
  if (n === 5) {
    if (!fechaSeleccionada) { alert('Selecciona una fecha'); return false; }
  }
  if (n === 6) {
    if (!presupuestoSeleccionado) { alert('Selecciona o ingresa un presupuesto'); return false; }
  }
  return true;
}

// ── PASO 1: Organizador con checkbox ───────────────────────
// El hook es en siguientePaso → cuando pasa del paso 1 al 2
// se agrega/quita el organizador de la lista
function sincronizarOrganizador() {
  const org = document.getElementById('organizador').value.trim();
  const participa = document.getElementById('participa').checked;

  // Quitar si ya estaba
  participantes = participantes.filter(p => p !== org);

  // Si participa, agregar al inicio
  if (participa && org) {
    participantes.unshift(org);
  }
}

// Override siguiente para paso 1
const _siguiente = siguientePaso;

// ── PASO 2: Participantes ───────────────────────────────────
function agregarParticipante() {
  const input = document.getElementById('nuevoParticipante');
  const nombre = input.value.trim();
  if (!nombre) { alert('Escribe un nombre'); return; }

  // Sincronizar organizador primero
  const org = document.getElementById('organizador').value.trim();
  const participa = document.getElementById('participa').checked;

  if (nombre === org && participa) {
    alert('El organizador ya está incluido automáticamente');
    input.value = '';
    return;
  }

  if (participantes.includes(nombre)) {
    alert('Ese nombre ya está en la lista');
    input.value = '';
    return;
  }

  participantes.push(nombre);
  renderParticipantes();
  input.value = '';
  input.focus();
}

function renderParticipantes() {
  // Sincronizar organizador
  const org = document.getElementById('organizador').value.trim();
  const participa = document.getElementById('participa').checked;
  if (participa && org && !participantes.includes(org)) {
    participantes.unshift(org);
  }
  if (!participa) {
    participantes = participantes.filter(p => p !== org);
  }

  const lista = document.getElementById('listaParticipantes');
  lista.innerHTML = '';

  participantes.forEach((p, i) => {
    const li = document.createElement('li');
    li.className = 'list-group-item d-flex justify-content-between align-items-center';
    li.draggable = true;
    li.dataset.index = i;

    li.innerHTML = `
      <span>
        <span class="drag-handle me-2">⠿</span>
        ${p}
      </span>
      <button class="btn btn-danger btn-sm" onclick="eliminarParticipante(${i})">✕</button>
    `;

    // Drag & Drop para reordenar
    li.addEventListener('dragstart', e => {
      dragSrcIndex = i;
      li.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', i);
    });
    li.addEventListener('dragend', () => li.classList.remove('dragging'));
    li.addEventListener('dragover', e => {
      e.preventDefault();
      li.classList.add('drag-over');
    });
    li.addEventListener('dragleave', () => li.classList.remove('drag-over'));
    li.addEventListener('drop', e => {
      e.preventDefault();
      li.classList.remove('drag-over');
      if (dragSrcIndex !== null && dragSrcIndex !== i) {
        const moved = participantes.splice(dragSrcIndex, 1)[0];
        participantes.splice(i, 0, moved);
        renderParticipantes();
      }
    });

    lista.appendChild(li);
  });
}

function eliminarParticipante(i) {
  const org = document.getElementById('organizador').value.trim();
  const participa = document.getElementById('participa').checked;
  if (participantes[i] === org && participa) {
    alert('El organizador participa; desmarca la casilla para quitarlo');
    return;
  }
  // Limpiar exclusiones que involucren a esta persona
  const nombre = participantes[i];
  exclusiones = exclusiones.filter(e => e.de !== nombre && e.para !== nombre);
  participantes.splice(i, 1);
  renderParticipantes();
}

// Zona de drop para lista vacía
function dragOverLista(e) { e.preventDefault(); }
function dropEnLista(e)    { e.preventDefault(); }

// ── PASO 3: Exclusiones ─────────────────────────────────────
function setExclusiones(valor) {
  hayExclusiones = valor;
  document.getElementById('btnNoExcl').classList.toggle('active', !valor);
  document.getElementById('btnSiExcl').classList.toggle('active', valor);
  document.getElementById('panelExclusiones').classList.toggle('d-none', !valor);
  if (valor) renderExclusionesPaso();
  else { exclusiones = []; renderResumenExcl(); }
}

function renderExclusionesPaso() {
  const cont = document.getElementById('exclParticipantes');
  cont.innerHTML = '';

  participantes.forEach(persona => {
    const posibles = participantes.filter(p => p !== persona);
    const div = document.createElement('div');
    div.className = 'excl-persona mb-3';
    div.innerHTML = `<div class="excl-nombre">${persona} <span class="text-muted fw-normal">no sortea a:</span></div>`;

    const checksDiv = document.createElement('div');
    checksDiv.className = 'row g-1 mt-1';

    posibles.forEach(otro => {
      const yaExcl = exclusiones.some(e => e.de === persona && e.para === otro);
      const col = document.createElement('div');
      col.className = 'col-6 col-md-4';
      col.innerHTML = `
        <div class="form-check excl-check">
          <input class="form-check-input" type="checkbox" id="excl_${persona}_${otro}"
            ${yaExcl ? 'checked' : ''}
            onchange="toggleExclusion('${persona}','${otro}',this.checked)">
          <label class="form-check-label" for="excl_${persona}_${otro}">${otro}</label>
        </div>
      `;
      checksDiv.appendChild(col);
    });

    div.appendChild(checksDiv);
    cont.appendChild(div);
  });

  renderResumenExcl();
}

function toggleExclusion(de, para, activo) {
  if (activo) {
    if (!exclusiones.some(e => e.de === de && e.para === para)) {
      exclusiones.push({ de, para });
    }
  } else {
    exclusiones = exclusiones.filter(e => !(e.de === de && e.para === para));
  }
  renderResumenExcl();
}

function renderResumenExcl() {
  const div = document.getElementById('resumenExclusiones');
  if (exclusiones.length === 0) { div.innerHTML = ''; return; }
  div.innerHTML = `<h6 class="text-muted mb-2">Exclusiones activas:</h6>` +
    exclusiones.map(e =>
      `<span class="badge-excl me-1 mb-1">${e.de} → no a ${e.para}</span>`
    ).join('');
}

// ── PASO 4: Tipo de evento ──────────────────────────────────
function selTipo(btn, tipo) {
  document.querySelectorAll('.btn-tipo').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  tipoSeleccionado = tipo;

  const divNombre = document.getElementById('nombrePersonalizado');
  if (tipo === 'Otro') {
    divNombre.classList.remove('d-none');
  } else {
    divNombre.classList.add('d-none');
    document.getElementById('nombreEvento').value = '';
  }
}

function actualizarTitFecha() {
  const nombre = tipoSeleccionado === 'Otro'
    ? (document.getElementById('nombreEvento').value || 'el evento')
    : tipoSeleccionado;
  document.getElementById('titFecha').textContent = `¿Cuándo se celebra ${nombre}?`;
}

// ── PASO 5: Fechas rápidas ──────────────────────────────────
function generarFechasRapidas() {
  const hoy = new Date();
  const contenedor = document.getElementById('fechasRapidas');
  contenedor.innerHTML = '';

  for (let i = 1; i <= 3; i++) {
    const d = new Date(hoy);
    d.setDate(hoy.getDate() + i * 7);
    const iso = d.toISOString().split('T')[0];
    const label = d.toLocaleDateString('es-MX', { weekday:'long', day:'numeric', month:'long' });

    const col = document.createElement('div');
    col.className = 'col-12 col-sm-4';
    col.innerHTML = `
      <button class="btn btn-fecha w-100" onclick="selFechaRapida(this,'${iso}')">
        ${label}
      </button>
    `;
    contenedor.appendChild(col);
  }
}

function selFechaRapida(btn, iso) {
  document.querySelectorAll('.btn-fecha').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  fechaSeleccionada = iso;
  document.getElementById('fechaEvento').value = iso;
}

function selFechaManual() {
  document.querySelectorAll('.btn-fecha').forEach(b => b.classList.remove('active'));
  fechaSeleccionada = document.getElementById('fechaEvento').value;
}

// ── PASO 6: Presupuesto ─────────────────────────────────────
function selPresupuesto(btn, val) {
  document.querySelectorAll('.btn-presupuesto').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  presupuestoSeleccionado = val;
  document.getElementById('otroPresupuestoDiv').classList.add('d-none');
}

function mostrarOtroPresupuesto(btn) {
  document.querySelectorAll('.btn-presupuesto').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('otroPresupuestoDiv').classList.remove('d-none');
  presupuestoSeleccionado = '';
}

// ── Guardar evento en localStorage ─────────────────────────
function guardarEvento() {
  if (!validarPaso(6)) return;

  // Obtener presupuesto personalizado si aplica
  const inputOtro = document.getElementById('presupuestoPersonalizado').value;
  const presupuesto = presupuestoSeleccionado || inputOtro;

  if (!presupuesto) { alert('Ingresa un presupuesto'); return; }

  // Nombre del evento
  const nombreEvento = tipoSeleccionado === 'Otro'
    ? document.getElementById('nombreEvento').value.trim()
    : tipoSeleccionado;

  const evento = {
    organizador:   document.getElementById('organizador').value.trim(),
    participa:     document.getElementById('participa').checked,
    nombreEvento:  nombreEvento,
    tipoEvento:    tipoSeleccionado,
    fecha:         fechaSeleccionada,
    presupuesto:   presupuesto,
    participantes: participantes,
    exclusiones:   exclusiones
  };

  localStorage.setItem('evento', JSON.stringify(evento));

  // Ir al resumen
  window.location.href = 'resumen.html';
}
