let vueltas = [];
let ramalSeleccionado = "";
let internoSeleccionado = "";
let todasLasPlanillas = [];
function limpiarCampos() {
    ramalSeleccionado = "";
    internoSeleccionado = "";
    document.getElementById('boton-ramal').textContent = "Indicar Ramal";
    document.getElementById('boton-interno').textContent = "Indicar Interno";
    document.getElementById('recorrido-info').value = "";
    document.getElementById('ida1').value = "";
    document.getElementById('ida2').value = "";
    document.getElementById('descanso').value = "";
    document.getElementById('descanso2').value = "";
    document.getElementById('vuelta1').value = "";
    document.getElementById('vuelta2').value = "";
    document.getElementById('planillas1').value = "";
    document.getElementById('planillas2').value = "";
    document.getElementById('planillas3').value = "";
    const planillasOld = document.getElementById('planillas');
    if (planillasOld) {
        planillasOld.value = "";
    }
}
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
function mostrarPestania(nombre) {
    const secciones = document.querySelectorAll(".contenedor");
    secciones.forEach(s => s.style.display = "none");
    const actual = document.getElementById(nombre);
    if (actual) actual.style.display = "block";
}
function abrirMenuRamales() {
    document.getElementById('menu-ramales').style.display = 'flex';
}
function cerrarMenuRamales() {
    document.getElementById('menu-ramales').style.display = 'none';
}
function abrirMenuInternos() {
    if (!ramalSeleccionado) {
        alert("Seleccione un ramal primero.");
        return;
    }
    document.getElementById('menu-internos').style.display = 'flex';
}
function cerrarMenuInternos() {
    document.getElementById('menu-internos').style.display = 'none';
}
function seleccionarRamal(ramal) {
    ramalSeleccionado = ramal;
    document.getElementById('boton-ramal').textContent = `${ramal}`;
    actualizarRecorrido();
    cerrarMenuRamales();
}
function seleccionarInterno(interno) {
    internoSeleccionado = interno;
    document.getElementById('boton-interno').textContent = `Interno: ${interno}`;
    cerrarMenuInternos();
}
function abrirMenuCargarVuelta() {
    if (!ramalSeleccionado || !internoSeleccionado) {
        alert("Seleccione ramal e interno primero.");
        return;
    }
    document.getElementById('menu-cargar-vuelta').style.display = 'flex';
}
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
}
function invalidarVuelta() {
    if (vueltas.length === 0) {
        alert("No hay vueltas para invalidar.");
        return;
    }
    vueltas[vueltas.length - 1].invalidada = true;
    alert("Última vuelta invalidada.");
}
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
function cerrarMenuVueltasCargadas() {
    document.getElementById('menu-vueltas-cargadas').style.display = 'none';
}
function generarCodigoUnico() {
    const año = new Date().getFullYear();
    const letras = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const parteLetra = letras[Math.floor(Math.random() * letras.length)] + letras[Math.floor(Math.random() * letras.length)];
    const parteNum = Math.floor(100 + Math.random() * 900); // ej: 123
    return `GTG-${año}-${parteLetra}${parteNum}`;
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
    const hook = inspectoresActiven();
    const embed = {
        title: "Hola, me presento...",
        description: `Hola Inspectores queridos, soy el nuevo BOT que se encargara de avisarles cuando alla una nueva planilla, espero llevarnos bien... Suerte en el trabajo ❤️.`,
        color: 3066993,
    };
    const payload = { embeds: [embed] };
    fetch(hook, {
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
function iniciarTextoRotativo() {
    const frases = [
        "Espere a ser logueado automaticamente",
        "Espere a ser logueado automaticamente.",
        "Espere a ser logueado automaticamente..",
        "Espere a ser logueado automaticamente..."
    ];
    let i = 0;
    const rotador = document.getElementById("texto-rotativo");
    setInterval(() => {
        rotador.innerText = frases[i % frases.length];
        i++;
    }, 500);
}

function horaActual(inputId) {
    const ahora = new Date();
    const horas = String(ahora.getHours()).padStart(2, '0');
    const minutos = String(ahora.getMinutes()).padStart(2, '0');
    document.getElementById(inputId).value = `${horas}:${minutos}`;
}
let alarmaInterval;
let audio = new Audio('./alarm.mp3');
audio.loop = true;
let alarmaDesactivada = false;
function iniciarAlarma() {
    alarmaDesactivada = false;
    alarmaInterval = setInterval(() => {
        if (!alarmaDesactivada) {
            audio.play();
        }
    }, 90 * 1000); // 1 minuto 30 segundos
}
function entendidoAlarma() {
    console.log("✅ Arrancado sistema de Alarma");
    audio.pause();
    audio.currentTime = 0;
    alarmaDesactivada = true;
    if (alarmaInterval) {
        clearInterval(alarmaInterval);
        alarmaInterval = null;
    }
}
function desactivarAlarma() {
    alarmaDesactivada = true;
    audio.pause();
    audio.currentTime = 0;
    if (alarmaInterval) {
        clearInterval(alarmaInterval);
        alarmaInterval = null;
    }
}
function pendienteEnterINPUT(event) {
    if (event.key === "Enter") {
        event.preventDefault();
        CodigoZonaUbi();
    }
}
function CodigoZonaUbi() {
    const codigo = document.getElementById("codigo-zona").value;
    switch (codigo) {
        case "1":
            guardarUbicacion("Av. Principal"); entendidoAlarma();
            break;
        case "2":
            guardarUbicacion("Centro"); entendidoAlarma();
            break;
        case "3":
            guardarUbicacion("Deposito FONO BUS"); entendidoAlarma();
            break;
        case "4":
            guardarUbicacion("Deposito General Tomas Guido"); entendidoAlarma();
            break;
        case "5":
            guardarUbicacion("Deposito Larga Distancia"); entendidoAlarma();
            break;
        case "6":
            guardarUbicacion("Deposito Urbano"); entendidoAlarma();
            break;
        case "7":
            guardarUbicacion("Metrobus 2 Carriles"); entendidoAlarma();
            break;
        case "8":
            guardarUbicacion("Metrobus 6 Carriles"); entendidoAlarma();
            break;
        case "9":
            guardarUbicacion("Patio de Eventos"); entendidoAlarma();
            break;
        case "10":
            guardarUbicacion("Plaza La Cumbre"); entendidoAlarma();
            break;
        case "11":
            guardarUbicacion("Terminal Aguas de Oro"); entendidoAlarma();
            break;
        case "12":
            guardarUbicacion("Terminal del Areopuerto"); entendidoAlarma();
            break;
        case "13":
            guardarUbicacion("Terminal de Barrio"); entendidoAlarma();
            break;
        case "14":
            guardarUbicacion("Terminal de La Cumbre"); entendidoAlarma();
            break;
        case "15":
            guardarUbicacion("Terminal de Los Altos"); entendidoAlarma();
            break;
        case "16":
            guardarUbicacion("Terminal de Minibuses"); entendidoAlarma();
            break;
        case "17":
            guardarUbicacion("Terminal de Omnibus Villa"); entendidoAlarma();
            break;
        case "18":
            guardarUbicacion("Terminal de Retiro"); entendidoAlarma();
            break;
        default:
            alert("⚠️ Código de zona no válido.");
            break;
    }
    document.getElementById("codigo-zona").value = "";
}