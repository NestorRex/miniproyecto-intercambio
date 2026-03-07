let participantes = [];

function agregarParticipante(){

let nombre = document.getElementById("nuevoParticipante").value;

if(nombre.trim() === ""){
alert("Escribe un nombre");
return;
}

participantes.push(nombre);

mostrarParticipantes();

document.getElementById("nuevoParticipante").value = "";

}

function mostrarParticipantes(){

let lista = document.getElementById("listaParticipantes");

lista.innerHTML = "";

participantes.forEach((p, index) => {

let li = document.createElement("li");

li.className = "list-group-item d-flex justify-content-between";

li.innerHTML = `
${p}
<button class="btn btn-danger btn-sm" onclick="eliminarParticipante(${index})">X</button>
`;

lista.appendChild(li);

});

}

function eliminarParticipante(index){

participantes.splice(index,1);

mostrarParticipantes();

}

function guardarEvento(){

let evento = {

organizador: document.getElementById("organizador").value,

participa: document.getElementById("participa").checked,

nombreEvento: document.getElementById("nombreEvento").value,

fecha: document.getElementById("fechaEvento").value,

presupuesto: document.getElementById("presupuestoEvento").value,

participantes: participantes

};

localStorage.setItem("evento", JSON.stringify(evento));

alert("Evento guardado correctamente");

}