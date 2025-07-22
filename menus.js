function abrirPanel() {
    document.getElementById('panel').style.display = 'block';
}
function cerrarPanel() {
    document.getElementById('panel').style.display = 'none';
}

function abrirMenuCapturas() {
    document.getElementById('menu-capturas').style.display = 'flex';
}
function cerrarMenuCapturas() {
    document.getElementById('menu-capturas').style.display = 'none';
}

function abrirMenuRamales() {
    document.getElementById('menu-ramales').style.display = 'flex';
}
function cerrarMenuRamales() {
    document.getElementById('menu-ramales').style.display = 'none';
}

// Función para abrir el menú de internos
function abrirMenuInternos() {
    if (!ramalSeleccionado) {
        alert("Seleccione un ramal primero.");
        return;
    }
    document.getElementById('menu-internos').style.display = 'flex';
}
// Función para cerrar el menú de internos
function cerrarMenuInternos() {
    document.getElementById('menu-internos').style.display = 'none';
}

// Función para seleccionar un ramal
function seleccionarRamal(ramal) {
    ramalSeleccionado = ramal;
    document.getElementById('boton-ramal').textContent = `Ramal: ${ramal}`;
    cerrarMenuRamales();
}

// Función para seleccionar un interno
function seleccionarInterno(interno) {
    internoSeleccionado = interno;
    document.getElementById('boton-interno').textContent = `Interno: ${interno}`;
    cerrarMenuInternos();
}

// Función para abrir el menú de cargar vuelta
function abrirMenuCargarVuelta() {
    if (!ramalSeleccionado || !internoSeleccionado) {
        alert("Seleccione ramal e interno primero.");
        return;
    }
    document.getElementById('menu-cargar-vuelta').style.display = 'flex';
}

// Función para cerrar el menú de cargar vuelta
function cerrarMenuCargarVuelta() {
    document.getElementById('menu-cargar-vuelta').style.display = 'none';
}

// Función para cargar una vuelta
function cargarVuelta() {
    const ida = document.getElementById('ida-cargar').value.trim();
    const vuelta = document.getElementById('vuelta-cargar').value.trim();
    if (!ida || !vuelta) {
        alert("Complete los horarios de ida y vuelta.");
        return;
    }
    vueltas.push({ ida, vuelta, invalidada: false });
    alert(`Vuelta cargada: Ida ${ida} - Vuelta ${vuelta}`);
    document.getElementById('ida-cargar').value = "";
    document.getElementById('vuelta-cargar').value = "";
    cerrarMenuCargarVuelta();
    actualizarBotonVueltas();
}

// Función para invalidar la última vuelta cargada
function invalidarVuelta() {
    if (vueltas.length === 0) {
        alert("No hay vueltas para invalidar.");
        return;
    }
    vueltas[vueltas.length - 1].invalidada = true;
    alert("Última vuelta invalidada.");
    cerrarMenuCargarVuelta();
}

// Función para abrir el menú de vueltas cargadas
function abrirMenuVueltasCargadas() {
    const lista = document.getElementById('vueltas-lista');
    if (vueltas.length === 0) {
        lista.innerHTML = "<div class='texto-rojo'>No hay vueltas cargadas.</div>";
    } else {
        lista.innerHTML = "";
        vueltas.forEach((v, i) => {
            const estadoTexto = v.invalidada ? '<em>(Invalidada)</em>' : '';
            lista.innerHTML += `<div class="burbuja">
                <strong>Vuelta ${i + 1}:</strong> Ida: ${v.ida} | Vuelta: ${v.vuelta} ${estadoTexto}
            </div>`;
        });
    }
    document.getElementById('menu-vueltas-cargadas').style.display = 'flex';
}
// Función para cerrar el menú de vueltas cargadas
function cerrarMenuVueltasCargadas() {
    document.getElementById('menu-vueltas-cargadas').style.display = 'none';
}
