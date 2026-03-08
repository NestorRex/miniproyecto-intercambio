// ============================================================
// GiftSwap – sorteo.js
// ============================================================

let evento;

window.onload = function () {
  // Lee SIEMPRE de localStorage
  evento = JSON.parse(localStorage.getItem('evento'));

  if (!evento) {
    alert('No hay evento guardado. Crea uno primero.');
    window.location.href = 'evento.html';
    return;
  }

  // Subtítulo
  document.getElementById('subtituloSorteo').textContent =
    evento.nombreEvento + ' · ' + formatearFecha(evento.fecha);

  document.getElementById('infoNombre').textContent = evento.nombreEvento;
  document.getElementById('infoParticipantes').textContent = evento.participantes.length;

  const nExcl = evento.exclusiones ? evento.exclusiones.length : 0;
  document.getElementById('infoExclusiones').textContent =
    nExcl > 0 ? `${nExcl} exclusión${nExcl > 1 ? 'es' : ''} activa${nExcl > 1 ? 's' : ''}` : 'Sin exclusiones';
};

// ── Iniciar sorteo con animación ────────────────────────────
function iniciarSorteo() {
  document.getElementById('panelInicio').classList.add('d-none');
  document.getElementById('panelAnimacion').classList.remove('d-none');

  const emojis = ['🎁','🎀','🎊','🎉','✨','🎄','🎲','⭐'];
  let t = 0;
  const rueda = document.getElementById('ruedaSorteo');

  const intervalo = setInterval(() => {
    rueda.textContent = emojis[t % emojis.length];
    rueda.style.transform = `rotate(${t * 45}deg) scale(${1 + Math.sin(t * 0.5) * 0.2})`;
    t++;
  }, 100);

  // Ejecutar sorteo después de la animación
  setTimeout(() => {
    clearInterval(intervalo);
    const resultados = hacerSorteo();

    if (!resultados) {
      document.getElementById('panelAnimacion').classList.add('d-none');
      document.getElementById('panelInicio').classList.remove('d-none');
      alert('No fue posible realizar el sorteo con las exclusiones actuales. Intenta reducir las exclusiones.');
      return;
    }

    document.getElementById('panelAnimacion').classList.add('d-none');
    mostrarResultados(resultados);
  }, 2200);
}

// ── Algoritmo con backtracking (garantiza solución válida) ──
function hacerSorteo() {
  const participantes = [...evento.participantes];
  const exclusiones   = evento.exclusiones || [];

  // Intentar hasta 200 veces con Fisher-Yates + validación
  for (let intento = 0; intento < 200; intento++) {
    const resultado = intentarSorteo(participantes, exclusiones);
    if (resultado) return resultado;
  }

  // Si fallan todos los intentos aleatorios, backtracking exacto
  return backtracking(participantes, exclusiones, [], new Array(participantes.length).fill(false));
}

function intentarSorteo(participantes, exclusiones) {
  const receptores = [...participantes];
  // Mezclar Fisher-Yates
  for (let i = receptores.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [receptores[i], receptores[j]] = [receptores[j], receptores[i]];
  }

  const resultados = [];
  for (let i = 0; i < participantes.length; i++) {
    const dador    = participantes[i];
    const receptor = receptores[i];
    // No puede darse a sí mismo
    if (dador === receptor) return null;
    // No puede violar exclusiones
    const prohibido = exclusiones.some(e => e.de === dador && e.para === receptor);
    if (prohibido) return null;
    resultados.push({ de: dador, para: receptor });
  }
  return resultados;
}

function backtracking(participantes, exclusiones, asignados, usados) {
  const i = asignados.length;
  if (i === participantes.length) return asignados;

  const dador = participantes[i];
  // Crear orden aleatorio de candidatos
  const orden = participantes
    .map((_, idx) => idx)
    .filter(idx => !usados[idx])
    .sort(() => Math.random() - 0.5);

  for (const idx of orden) {
    const receptor = participantes[idx];
    if (receptor === dador) continue;
    const prohibido = exclusiones.some(e => e.de === dador && e.para === receptor);
    if (prohibido) continue;

    usados[idx] = true;
    asignados.push({ de: dador, para: receptor });

    const res = backtracking(participantes, exclusiones, asignados, usados);
    if (res) return res;

    asignados.pop();
    usados[idx] = false;
  }
  return null;
}

// ── Mostrar resultados con reveal uno a uno ─────────────────
function mostrarResultados(resultados) {
  const contenedor = document.getElementById('resultadoSorteo');
  contenedor.innerHTML = '';

  document.getElementById('panelResultados').classList.remove('d-none');

  resultados.forEach((r, i) => {
    const col = document.createElement('div');
    col.className = 'col-12 col-sm-6';

    const card = document.createElement('div');
    card.className = 'resultado-card resultado-oculto';
    card.innerHTML = `
      <div class="resultado-dador">${r.de}</div>
      <div class="resultado-flecha">🎁</div>
      <div class="resultado-receptor">${r.para}</div>
    `;

    col.appendChild(card);
    contenedor.appendChild(col);

    // Reveal escalonado
    setTimeout(() => {
      card.classList.remove('resultado-oculto');
      card.classList.add('resultado-visible');
    }, 300 + i * 250);
  });
}

function repetirSorteo() {
  document.getElementById('panelResultados').classList.add('d-none');
  document.getElementById('resultadoSorteo').innerHTML = '';
  document.getElementById('panelInicio').classList.remove('d-none');
}

function formatearFecha(f) {
  if (!f) return '';
  const [y, m, d] = f.split('-');
  const meses = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
  return `${d} ${meses[parseInt(m) - 1]} ${y}`;
}
