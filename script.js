let vueltas = [];
let ramalSeleccionado = "";
let internoSeleccionado = "";
let todasLasPlanillas = [];
const WEBHOOK_URL = enlaceCodificado();
const apifeedback = codificadoEnlace();
const apiMensajes = codificadoDeMensajes();

// Función para limpiar todos los campos
function limpiarCampos() {
    vueltas = [];
    ramalSeleccionado = "";
    document.getElementById('boton-ramal').textContent = "Indicar Ramal";
    internoSeleccionado = "";
    document.getElementById('boton-interno').textContent = "Indicar Interno";
    document.getElementById('planillas').value = "";
    document.getElementById('resumen-vueltas').innerHTML = ""; // Limpia el resumen del panel privado
}
// Función para establecer la hora actual en un campo de input
function horaActual(id) {
    const ahora = new Date();
    const horas = ahora.getHours().toString().padStart(2, '0');
    const minutos = ahora.getMinutes().toString().padStart(2, '0');
    document.getElementById(id).value = `${horas}:${minutos}`;
}
// Función para ver el resumen de todas las planillas (con clave)
function verResumenVueltas() {
    if (!todasLasPlanillas || todasLasPlanillas.length === 0) {
        // Intentar cargar desde localStorage si no hay nada
        const planillasGuardadas = localStorage.getItem('todasLasPlanillas');
        if (planillasGuardadas) {
            todasLasPlanillas = JSON.parse(planillasGuardadas);
        }
    }
    const contenedor = document.getElementById('resumen-vueltas');
    if (todasLasPlanillas.length === 0) {
        contenedor.innerHTML = "<div class='texto-rojo'>No hay planillas cargadas para revisar.</div>";
        return;
    }
    let resumenHTML = "";
    todasLasPlanillas.forEach(p => {
        let vueltasHTML = p.vueltas.map((v, i) => {
            const estadoVuelta = v.invalidada ? '<em>(Invalidada)</em>' : '';
            return `Vuelta ${i + 1}: Ida ${v.ida} - Vuelta: ${v.vuelta} ${estadoVuelta}`;
        }).join('<br>');
        let estadoClase = '';
        let estadoTexto = '';
        let botonesAccion = '';
        if (p.estado === 'aceptada') {
            estadoClase = 'burbuja-aceptada'; // Nueva clase para estilos de aceptada
            estadoTexto = '<strong style="color: #2ecc71;">ESTADO: ACEPTADA ✅</strong>';
        } else if (p.estado === 'denegada') {
            estadoClase = 'burbuja-denegada'; // Nueva clase para estilos de denegada
            estadoTexto = '<strong style="color: #e74c3c;">ESTADO: DENEGADA ❌</strong>';
        } else {
            estadoClase = 'burbuja-pendiente'; // Nueva clase para estilos de pendiente
            estadoTexto = '<strong style="color: #f39c12;">ESTADO: PENDIENTE ⏳</strong>';
            botonesAccion = `
                <button class="aceptado" onclick="aceptarPlanilla(${p.id})">✅ Aceptar</button>
                <button class="denegado" onclick="denegarPlanilla(${p.id})">❌ Denegar</button>
            `;
        }
        resumenHTML += `
            <div class="burbuja ${estadoClase}">
                <strong>Chofer:</strong> ${p.chofer}<br>
                <strong>Ramal:</strong> ${p.ramal}, <strong>Interno:</strong> ${p.interno}<br>
                <strong>Planillas:</strong> ${p.planillasCount}<br>
                ${vueltasHTML}<br>
                ${estadoTexto}
                <div class="acciones-aprobacion">
                    ${botonesAccion}
                </div>
                <small style="display: block; margin-top: 5px; color: ${p.estado === 'aceptada' ? '#2ecc71' : p.estado === 'denegada' ? '#e74c3c' : '#bdc3c7'};">Guardado: ${p.timestamp}</small>
            </div>
        `;
    });
    contenedor.innerHTML = resumenHTML;
}
async function enviarFeedback() {
    const id = document.getElementById('discord-id').value.trim();
    const tipo = document.getElementById('tipo-reporte').value;
    const mensaje = document.getElementById('mensaje-reporte').value.trim();

    if (!id || !tipo || !mensaje) {
        alert("Por favor completa todos los campos.");
        return;
    }

    const embed = {
        title: "📣 Nuevo Feedback",
        description: `**Reporte de:** ${id}\n**Tipo de Reporte:** ${tipo}\n**Mensaje:**\n"${mensaje}"`,
        color: 3447003,
        footer: { text: new Date().toLocaleString() }
    };

    try {
        await fetch(apifeedback, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ embeds: [embed] })
        });
        alert("Reporte enviado correctamente.");
        cerrarMenuFeedback();
    } catch (error) {
        console.error("Error al enviar feedback:", error);
        alert("Error al enviar el reporte.");
    }
}
function abrirMenuEnviarMensaje() {
    document.getElementById('menu-enviar-mensaje').style.display = 'flex';
}
function cerrarMenuEnviarMensaje() {
    document.getElementById('menu-enviar-mensaje').style.display = 'none';
}
function cerrarMenuMensajesChofer() {
    document.getElementById('menu-mensajes-chofer').style.display = 'none';
}
function mostrarPestania(id) {
    const pestañas = ['login', 'inicio', 'inspectores'];
    pestañas.forEach(pid => {
        const el = document.getElementById(pid);
        if (el) el.style.display = (pid === id) ? 'block' : 'none';
    });
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
// Función para login de inspector
function loginInspector() {
    const clave = prompt("Ingrese la clave de acceso para inspectores:");
    if (clave === "InspectoresGTG") {
        mostrarPestania('inspectores');
    } else if (clave !== null) {
        alert("Clave incorrecta.");
    }
}
function generarCodigoUnico() {
    // Crea un código aleatorio estilo GTG-2025-XY123
    const año = new Date().getFullYear();
    const letras = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const parteLetra = letras[Math.floor(Math.random() * letras.length)] + letras[Math.floor(Math.random() * letras.length)];
    const parteNum = Math.floor(100 + Math.random() * 900); // ej: 123
    return `GTG-${año}-${parteLetra}${parteNum}`;
}
function enlaceCodificado() { //Para las planillas.
    const parteA = "http";
    const parteB = "s://discord.c";
    const parteC = "om/api/w";
    const parteD = "eb";
    const parteE = "ho";
    const parteF = "oks";
    const parteG = "/139";
    const parteH = "742909339350";
    const parteI = "239";
    const parteJ = "9/-7nY9";
    const parteK = "6q-GeebDg_";
    const parteL = "WYg1yNWWjQeG";
    const parteM = "GYyG2NH";
    const parteN = "RIg0xkRGrvE14Jm";
    const parteO = "O6GnYawBPZYT5";
    const parteP = "Dr6jve";
    const enlaceDecodificado = parteA + parteB + parteC + parteD + parteE + parteF + parteG + parteH + parteI + parteJ + parteK + parteL + parteM + parteN + parteO + parteP;
    return enlaceDecodificado;
}
function codificadoEnlace() { //Para el: Feedback
    const parteA = "http";
    const parteB = "s://discord.c";
    const parteC = "om/api/w";
    const parteD = "eb";
    const parteE = "ho";
    const parteF = "oks";
    const parteG = "/139760";
    const parteH = "7899454";
    const parteI = "378126";
    const parteJ = "/xt_";
    const parteK = "RaRj_5";
    const parteL = "NLDZy9dVR";
    const parteM = "UqYpOsTUk6";
    const parteN = "l9qstgRA";
    const parteO = "vcQAahxPUWXAek";
    const parteP = "xGeaez";
    const parteQ = "nOjW6JFEwg-t";
    const codificadoEnlace = parteA + parteB + parteC + parteD + parteE + parteF + parteG + parteH + parteI + parteJ + parteK + parteL + parteM + parteN + parteO + parteP + parteQ;
    return codificadoEnlace;
}
function codificadoDeMensajes() { //Para la que: Envia Mensajes
    const parteA = "http";
    const parteB = "s://discord.c";
    const parteC = "om/api/w";
    const parteD = "eb";
    const parteE = "ho";
    const parteF = "oks";
    const parteG = "/";
    const parteH = "1397613914";
    const parteI = "937";
    const parteJ = "622";
    const parteK = "63";
    const parteL = "8/P";
    const parteM = "uk4h9";
    const parteN = "xN6CT";
    const parteO = "uUD-EV7Ye1u-";
    const parteP = "I0GDhHMDNvaQr";
    const parteQ = "KYmVvV";
    const parteR = "z_c4r-BIM";
    const parteS = "-Jjb66tMktq1FHI0x";
    const codificadoDeMensajes = parteA + parteB + parteC + parteD + parteE + parteF + parteG + parteH + parteI + parteJ + parteK + parteL + parteM + parteN + parteO + parteP + parteQ + parteR + parteS;
    return codificadoDeMensajes;
}
function abrirMenuFeedback() {
    document.getElementById('menu-feedback').style.display = 'flex';
}
function cerrarMenuFeedback() {
    document.getElementById('menu-feedback').style.display = 'none';
}