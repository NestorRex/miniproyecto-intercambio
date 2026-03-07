let participantes = [];
let exclusiones = [];

function agregarParticipante() {

    let nombre = document.getElementById("nuevoParticipante").value;

    if (nombre.trim() === "") {
        alert("Escribe un nombre");
        return;
    }

    participantes.push(nombre);

    mostrarParticipantes();

    document.getElementById("nuevoParticipante").value = "";

}

function mostrarParticipantes() {

    let lista = document.getElementById("listaParticipantes");

    lista.innerHTML = "";

    participantes.forEach((p, index) => {

        let li = document.createElement("li");

        li.className = "list-group-item d-flex justify-content-between";

        li.draggable = true;

        li.textContent = p;

        li.addEventListener("dragstart", (e) => {
            e.dataTransfer.setData("text", p);
        });

        li.addEventListener("dragover", (e) => {
            e.preventDefault();
        });

        li.addEventListener("drop", (e) => {

            let origen = e.dataTransfer.getData("text");

            let destino = p;

            if (origen !== destino) {

                exclusiones.push({
                    de: origen,
                    para: destino
                });

                mostrarExclusiones();

            }

        });

        let btn = document.createElement("button");

        btn.className = "btn btn-danger btn-sm";

        btn.textContent = "X";

        btn.onclick = () => {
            eliminarParticipante(index);
        };

        li.appendChild(btn);

        lista.appendChild(li);

    });

}

function eliminarParticipante(index) {

    participantes.splice(index, 1);

    mostrarParticipantes();

}

function mostrarExclusiones() {

    let lista = document.getElementById("listaExclusiones");

    lista.innerHTML = "";

    exclusiones.forEach(e => {

        let li = document.createElement("li");

        li.className = "list-group-item";

        li.textContent = e.de + " no puede regalar a " + e.para;

        lista.appendChild(li);

    });

}

function guardarEvento() {

    let evento = {

        organizador: document.getElementById("organizador").value,

        participa: document.getElementById("participa").checked,

        nombreEvento: document.getElementById("nombreEvento").value,

        tipoEvento: document.getElementById("tipoEvento").value,

        fecha: document.getElementById("fechaEvento").value,

        presupuesto: document.getElementById("presupuestoEvento").value,

        participantes: participantes,

        exclusiones: exclusiones

    };

    localStorage.setItem("evento", JSON.stringify(evento));

    alert("Evento guardado");

}