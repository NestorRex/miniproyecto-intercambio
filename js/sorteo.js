let evento;

window.onload = function(){

evento = JSON.parse(localStorage.getItem("evento"));

if(!evento){

alert("No hay evento guardado");
return;

}

document.getElementById("org").textContent = evento.organizador;
document.getElementById("nombreEvento").textContent = evento.nombreEvento;
document.getElementById("fechaEvento").textContent = evento.fecha;
document.getElementById("presupuestoEvento").textContent = evento.presupuesto;

mostrarParticipantes();

}

function mostrarParticipantes(){

let lista = document.getElementById("listaParticipantes");

lista.innerHTML = "";

evento.participantes.forEach(p => {

let li = document.createElement("li");

li.className = "list-group-item";

li.textContent = p;

lista.appendChild(li);

});

}

function hacerSorteo(){

let participantes = [...evento.participantes];

let resultados = [];

let copia = [...participantes];

for(let i=0;i<participantes.length;i++){

let persona = participantes[i];

let posible;

do{

posible = copia[Math.floor(Math.random()*copia.length)];

}while(posible === persona);

resultados.push({
de: persona,
para: posible
});

copia.splice(copia.indexOf(posible),1);

}

mostrarResultados(resultados);

}

function mostrarResultados(resultados){

let lista = document.getElementById("resultadoSorteo");

lista.innerHTML = "";

resultados.forEach(r => {

let li = document.createElement("li");

li.className = "list-group-item";

li.textContent = r.de + " → " + r.para;

lista.appendChild(li);

});

}