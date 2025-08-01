let vueltas = [];
let ramalSeleccionado = "";
let internoSeleccionado = "";
let todasLasPlanillas = [];
const WEBHOOK_URL = enlaceCodificado(); //Para planillas
const apiMensajes = codificadoDeMensajes(); //Para Mensajes de Inspectores
const apiLicencia = licenciacodificado(); //Para las licencias. Hay que configurarlo.

// Función para limpiar todos los campos
function limpiarCampos() {
    vueltas = [];
    ramalSeleccionado = "";
    document.getElementById('boton-ramal').textContent = "Indicar Ramal";
    internoSeleccionado = "";
    document.getElementById('boton-interno').textContent = "Indicar Interno";
    document.getElementById('planillas').value = "";
}
// Función para establecer la hora actual en un campo de input
function horaActual(id) {
    const ahora = new Date();
    const horas = ahora.getHours().toString().padStart(2, '0');
    const minutos = ahora.getMinutes().toString().padStart(2, '0');
    document.getElementById(id).value = `${horas}:${minutos}`;
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
    const pestañas = ['login', 'register', 'admin', 'developer', 'inspectores', 'inicio', 'personal', 'licencias', 'usuario', 'comprar-pasajes', 'info-pasajes'];
    pestañas.forEach(pid => {
        const el = document.getElementById(pid);
        if (el) el.style.display = (pid === id) ? 'block' : 'none';
    });
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
    const parteG = "/140035079983779022";
    const parteH = "9/JHaNa45AB-lQNESqc";
    const parteI = "mODbDSivf2ZnA0C7mvk";
    const parteJ = "SnG5ZLm7R0EYE5CpA7l";
    const parteK = "5TjZLscM1D14z";
    const enlaceDecodificado = parteA + parteB + parteC + parteD + parteE + parteF + parteG + parteH + parteI + parteJ + parteK;
    return enlaceDecodificado;
}
function feedback() { //Para Feedback
    const parteA = "http";
    const parteB = "s://discord.c";
    const parteC = "om/api/w";
    const parteD = "eb";
    const parteE = "ho";
    const parteF = "oks";
    const parteG = "/140060024549409180";
    const parteH = "7/MVptI62uW3SK7z6rb";
    const parteI = "g6-kbCuF10FTn9S34Ha";
    const parteJ = "b9iDI5rtFC_YYLa0Hs0";
    const parteK = "i00y9pTzWHXs-";
    const apifeedback = parteA + parteB + parteC + parteD + parteE + parteF + parteG + parteH + parteI + parteJ + parteK;
    return apifeedback;
}
function codificadoDeMensajes() { //Para la que: Envia Mensajes
    const parteA = "http";
    const parteB = "s://discord.c";
    const parteC = "om/w";
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
function apiactu() { //Para enviar actualizaciones
    const parteA = "http";
    const parteB = "s://discord.c";
    const parteC = "om/api/w";
    const parteD = "eb";
    const parteE = "ho";
    const parteF = "oks";
    const parteG = "/139784659";
    const parteH = "43759";
    const parteI = "13545";
    const parteJ = "/YIAG";
    const parteK = "y2KC-f8QJpTj";
    const parteL = "negB3yP";
    const parteM = "SvVFBKBX";
    const parteN = "bCPt81";
    const parteO = "LrrVPvp";
    const parteP = "zmDq0ASI";
    const parteQ = "m1Zkt";
    const parteR = "FLZ8T";
    const parteS = "TQT8te";
    const apiactu = parteA + parteB + parteC + parteD + parteE + parteF + parteG + parteH + parteI + parteJ + parteK + parteL + parteM + parteN + parteO + parteP + parteQ + parteR + parteS;
    return apiactu;
}
function licenciacodificado() { //Para las licencias
    const parteA = "http";
    const parteB = "s://discord.c";
    const parteC = "om/api/w";
    const parteD = "eb";
    const parteE = "ho";
    const parteF = "oks";
    const parteG = "/1398496010";
    const parteH = "329919568/";
    const parteI = "MFrkHCiEhCA";
    const parteJ = "2zqV0BPDt";
    const parteK = "4W7L_6Fr8H";
    const parteL = "LwqOWDm5H";
    const parteM = "-6iVw1VITs";
    const parteN = "84bnAeX8n";
    const parteO = "dhpjOCo4b0";
    const apiLicencia = parteA + parteB + parteC + parteD + parteE + parteF + parteG + parteH + parteI + parteJ + parteK + parteL + parteM + parteN + parteO;
    return apiLicencia;
}
function solicitudCifrada() { //Para las solicitudes de rango
    const parteA = "http";
    const parteB = "s://discord.c";
    const parteC = "om/api/w";
    const parteD = "eb";
    const parteE = "ho";
    const parteF = "oks";
    const parteG = "/139888966";
    const parteH = "6609938549/1";
    const parteI = "gLOsGX8u_S";
    const parteJ = "Qhpgg8kz3MmK";
    const parteK = "OAq2lvOgmb";
    const parteL = "DeT4zF05YV9";
    const parteM = "AXCjil_WK";
    const parteN = "vvWSMp9fnNC";
    const parteO = "r7Up";
    const solicitudCifrada = parteA + parteB + parteC + parteD + parteE + parteF + parteG + parteH + parteI + parteJ + parteK + parteL + parteM + parteN + parteO;
    return solicitudCifrada;
}
function abrirMenuFeedback() {
    document.getElementById('menu-anun-feedback').style.display = 'flex';
}
function cerrarMenuFeedback() {
    document.getElementById('menu-feedback').style.display = 'none';
}
function abrirFeedback() {
    document.getElementById('menu-anun-feedback').style.display = 'none';
    document.getElementById('menu-feedback').style.display = 'flex';
}
function abrirMenuAccionChofer() {
    document.getElementById('accion-chofer').style.display = 'flex';
}
function cerrarMenuAccionChofer() {
    document.getElementById('accion-chofer').style.display = 'none';
}
function cargarLicencia() {
    const idDiscord = document.getElementById('licencia-discord').value.trim();
    const idRoblox = document.getElementById('licencia-roblox').value.trim();
    const apodoRoblox = document.getElementById('licencia-apodo').value.trim();
    const motivo = document.getElementById('licencia-motivo').value;
    const duracion = document.getElementById('licencia-tiempo').value;
    const sector = document.getElementById('licencia-sector').value;

    if (!idDiscord || !idRoblox || !apodoRoblox || !motivo || !duracion || !sector || motivo.startsWith("Seleccione") || duracion.startsWith("Seleccione") || sector === "Seleccione su Sector") {
        alert("Por favor, complete todos los campos correctamente.");
        return;
    }

    const mensaje = 
`ID de Discord: ${idDiscord}
ID de Roblox: ${idRoblox}
Apodo de Roblox: ${apodoRoblox}
Sector de la Empresa donde sacara licencia: ${sector}
Motivo de licencia: ${motivo}
Tiempo de licencia: ${duracion}`;

    const embed = {
        title: "📄 Nueva Licencia",
        description: mensaje,
        color: 15844367,
        footer: { text: new Date().toLocaleString() }
    };

    fetch(apiLicencia, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ embeds: [embed] })
    })
    .then(() => {
        alert("Licencia enviada correctamente.");
        mostrarPestania('login');
    })
    .catch(err => {
        console.error("Error al enviar la licencia:", err);
        alert("Error al enviar la solicitud de licencia.");
    });
}
function abrirMenuProximaActualizacion() {
    document.getElementById('menu-pre-actualizar').style.display = 'flex';
}
function cerrarMenuProximaActualizacion() {
    document.getElementById('menu-pre-actualizar').style.display = 'none';
}
function cerrarSesion() {
    document.getElementById('cerrarSesion').style.display = 'none';
    mostrarPestania('login');
}
function acbotonPestanias() {
    document.getElementById('activar-boton-pestanias1').style.display = 'none';
    document.getElementById('activar-boton-pestanias2').style.display = 'none';
    document.getElementById('activar-boton-pestanias3').style.display = 'none';
    document.getElementById('desactivar-boton-pestanias1').style.display = 'block';
    document.getElementById('desactivar-boton-pestanias2').style.display = 'block';
    document.getElementById('desactivar-boton-pestanias3').style.display = 'block';
    document.getElementById('boton-pestanias').style.display = 'flex';
}
function desacbotonPestanias() {
    document.getElementById('desactivar-boton-pestanias1').style.display = 'none';
    document.getElementById('desactivar-boton-pestanias2').style.display = 'none';
    document.getElementById('desactivar-boton-pestanias3').style.display = 'none';
    document.getElementById('activar-boton-pestanias1').style.display = 'block';
    document.getElementById('activar-boton-pestanias2').style.display = 'block';
    document.getElementById('activar-boton-pestanias3').style.display = 'block';
    document.getElementById('boton-pestanias').style.display = 'none';
}
function botonPestanias() {
    document.getElementById('menu-pestanias').style.display = 'flex';
}
function rotateText() {
    const textArray = [
        "Iniciando Sesión",
        "Iniciando Sesión.",
        "Iniciando Sesión..",
        "Iniciando Sesión...",
    ];
    let index = 0;
    const textElement = document.getElementById("logueando");
    setInterval(() => {
        textElement.textContent = textArray[index];
        index = (index + 1) % textArray.length;
    }, 1000);
}
rotateText();
        async function enviarFeedback() {
    const id = document.getElementById('discord-id').value.trim();
    const tipo = document.getElementById('tipo-reporte').value;
    const mensaje = document.getElementById('mensaje-reporte').value.trim();
    const apifeedback = feedback()

    if (!id || !tipo || !mensaje) {
        alert("Por favor completa todos los campos.");
        return;
    }

    const embed = {
        title: "📣 Nuevo Feedback",
        description: `**Reporte de:** ${id}\n**Tipo de Reporte:** ${tipo}\n**Mensaje:**\n${mensaje}`,
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

function holaBOTinsCifrada() {
    const url = BOTinsCifrada(); // URL descifrada del webhook

    const embed = {
        title: "Hola, me presento...",
        description: `Hola Inspectores queridos, soy el nuevo BOT que se encargara de avisarles cuando alla una nueva planilla, espero llevarnos bien... Suerte en el trabajo ❤️.`,
        color: 3066993,
    };

    const payload = { embeds: [embed] };

    fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    })
    .then(response => {
        if (!response.ok) {
            console.error("❌ Error al enviar mensaje:", response.statusText);
        } else {
            console.log("✅ Mensaje embed enviado a Discord");
        }
    })
    .catch(error => {
        console.error("❌ Error en la solicitud al enviar embed:", error);
    });
}

function BOTinsCifrada() { //Para los avisos a los inspectores
    const parteA = "http";
    const parteB = "s://disc";
    const parteC = "ord.com/a";
    const parteD = "pi/web";
    const parteE = "ho";
    const parteF = "oks";
    const parteG = "1400936540";
    const parteH = "678520942/";
    const parteI = "6MyCRrqI4v";
    const parteJ = "_Iwsdzdveu";
    const parteK = "MzsezB40J2";
    const parteL = "Jy1CY-yZaG";
    const parteM = "76D-CqDHx7";
    const parteN = "uXOxBeAji2";
    const parteY = "78xeWa5B";
    const BOTinsCifrada = parteA + parteB + parteC + parteD + parteE + parteF + parteG + parteH + parteI + parteJ + parteK + parteL + parteM + parteN + parteY;
    return BOTinsCifrada;

}
