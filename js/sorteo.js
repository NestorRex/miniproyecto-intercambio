let evento;

window.onload = function () {

    evento = JSON.parse(localStorage.getItem("evento"));

    if (!evento) {
        alert("No hay evento guardado");
        return;
    }

    document.getElementById("org").textContent = evento.organizador;
    document.getElementById("nombreEvento").textContent = evento.nombreEvento;
    document.getElementById("tipoEvento").textContent = evento.tipoEvento;
    document.getElementById("fechaEvento").textContent = evento.fecha;
    document.getElementById("presupuestoEvento").textContent = evento.presupuesto;

    mostrarParticipantes();
    mostrarExclusiones();

}

function mostrarParticipantes() {

    let lista = document.getElementById("listaParticipantes");

    lista.innerHTML = "";

    evento.participantes.forEach(p => {

        let li = document.createElement("li");

        li.className = "list-group-item";

        li.textContent = p;

        lista.appendChild(li);

    });

}

function mostrarExclusiones() {

    let lista = document.getElementById("listaExclusiones");

    lista.innerHTML = "";

    evento.exclusiones.forEach(e => {

        let li = document.createElement("li");

        li.className = "list-group-item";

        li.textContent = e.de + " no puede regalar a " + e.para;

        lista.appendChild(li);

    });

}

function hacerSorteo() {

    let participantes = [...evento.participantes];

    let copia = [...participantes];

    let resultados = [];

    for (let persona of participantes) {

        let posibles = copia.filter(p => {

            if (p === persona) return false;

            let prohibido = evento.exclusiones.some(e => e.de === persona && e.para === p);

            return !prohibido;

        });

        let elegido = posibles[Math.floor(Math.random() * posibles.length)];

        resultados.push({
            de: persona,
            para: elegido
        });

        copia.splice(copia.indexOf(elegido), 1);

    }

    mostrarResultados(resultados);

}

function mostrarResultados(resultados) {

    let lista = document.getElementById("resultadoSorteo");

    lista.innerHTML = "";

    resultados.forEach(r => {

        let li = document.createElement("li");

        li.className = "list-group-item";

        li.textContent = r.de + " → " + r.para;

        lista.appendChild(li);

    });

}