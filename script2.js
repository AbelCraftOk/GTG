import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import {
    getFirestore,
    collection,
    addDoc,
    getDocs,
    deleteDoc,
    doc,
    updateDoc
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
import { setDoc, doc as firestoreDoc } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyAMIMRcSoBD4pmGJStXNP7HUyQ92LGx25Y",
    authDomain: "planillasinspectores-53856.firebaseapp.com",
    projectId: "planillasinspectores-53856",
    storageBucket: "planillasinspectores-53856.firebasestorage.app",
    messagingSenderId: "752544495285",
    appId: "1:752544495285:web:dbf678155d39d1b7d9b0fc"
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function guardarPlanilla() {
    const codigoPlanilla = generarCodigoUnico();
    const choferInput = document.getElementById('chofer').value.trim();
    const planillasCount = document.getElementById('planillas').value.trim();

    if (!ramalSeleccionado || !internoSeleccionado || !choferInput || !planillasCount || vueltas.length === 0) {
        alert("Por favor, complete todos los datos (Chofer, Ramal, Interno, Planillas y al menos una vuelta válida).");
        return;
    }

    const vueltasValidas = vueltas.filter(v => !v.invalidada);
    if (vueltasValidas.length === 0) {
        alert("Debe haber al menos una vuelta válida cargada.");
        return;
    }

    try {
        // Verificar si el chofer está registrado en la colección "choferes"
        const choferesSnapshot = await getDocs(collection(db, "choferes"));
        let choferEncontrado = false;

        choferesSnapshot.forEach(docu => {
            const data = docu.data();
            if (data.chofer === `@${choferInput}`) {
                choferEncontrado = true;
            }
        });

        if (!choferEncontrado) {
            alert(`El ID de Discord "${choferInput}" no está registrado como chofer. Verifica lo escrito.`);
            return;
        }

        const nuevaPlanilla = {
            chofer: choferInput,
            ramal: ramalSeleccionado,
            interno: internoSeleccionado,
            planillasCount: planillasCount,
            vueltas: [...vueltas],
            estado: 'pendiente',
            timestamp: new Date(),
            codigoPlanilla: codigoPlanilla,
        };

        await addDoc(collection(db, "planillas"), nuevaPlanilla);
        alert("✅ Planilla guardada exitosamente.");
        limpiarCampos();
        abrirMenuCapturas();

    } catch (error) {
        console.error("Error al guardar/verificar la planilla:", error);
        alert("❌ Ocurrió un error al guardar la planilla.");
    }
}
window.guardarPlanilla = guardarPlanilla;

async function obtenerPlanillas() {
    const contenedor = document.getElementById('resumen-vueltas');
    contenedor.innerHTML = '';
    const querySnapshot = await getDocs(collection(db, "planillas"));
    let planillas = [];
    querySnapshot.forEach((docu) => {
        planillas.push({ id: docu.id, ...docu.data() });
    });
    if (planillas.length === 0) {
        contenedor.innerHTML = '<div class="texto-rojo">No se han encontrado planillas recientes.</div>';
        return;
    }
    planillas.forEach(planilla => {
        let vueltasHtml = '';
        if (Array.isArray(planilla.vueltas)) {
            planilla.vueltas.forEach((v, idx) => {
                vueltasHtml += `<div>Vuelta ${idx + 1}: Ida: ${v.ida} | Vuelta: ${v.vuelta} ${v.invalidada ? '<em>(Invalidada)</em>' : ''}</div>`;
            });
        }
        contenedor.innerHTML += `
            <div class="burbuja">
                <strong>Chofer:</strong> ${planilla.chofer}<br>
                <strong>Ramal:</strong> ${planilla.ramal}<br>
                <strong>Interno:</strong> ${planilla.interno}<br>
                <strong>Planillas Realizadas:</strong> ${planilla.planillasCount}<br>
                ${vueltasHtml}
                <strong>Codigo de Planilla:</strong> ${planilla.codigoPlanilla} | ${planilla.timestamp instanceof Date ? planilla.timestamp.toLocaleString() : (planilla.timestamp?.toDate ? planilla.timestamp.toDate().toLocaleString() : planilla.timestamp)}<br>
                <strong>Estado:</strong> ${planilla.estado}<br>
                <button style="display: block; margin-top: 5px; color: #2ecc71" onclick="window.aceptarPlanilla('${planilla.id}')">ACEPTAR</button>
                <button style="display: block; margin-top: 5px; color: #e74c3c" onclick="window.denegarPlanilla('${planilla.id}')">RECHAZAR</button>
            </div>
            <div class="separador"></div>
        `;
    });
}
window.obtenerPlanillas = obtenerPlanillas;

window.aceptarPlanilla = async function aceptarPlanilla(id) {
    try {
        // 1. Buscar la planilla en 'planillas'
        const planillaRef = doc(db, "planillas", id);
        const planillaSnap = await getDocs(collection(db, "planillas"));
        let planillaData = null;
        planillaSnap.forEach((docu) => {
            if (docu.id === id) {
                planillaData = { id: docu.id, ...docu.data() };
            }
        });
        if (!planillaData) {
            alert("No se encontró la planilla.");
            return;
        }
        // 2. Modificar estado y mover a historialPlanillas
        planillaData.estado = "aprobado";
        await addDoc(collection(db, "historialPlanillas"), planillaData);
        // 3. Eliminar de planillas
        await deleteDoc(planillaRef);
        // 4. Notificar a Discord
        let vueltasTexto = "";
        if (Array.isArray(planillaData.vueltas)) {
            planillaData.vueltas.forEach((v, idx) => {
                vueltasTexto += `Vuelta ${idx + 1}: Ida: ${v.ida} | Vuelta: ${v.vuelta} ${v.invalidada ? '(Invalidada)' : ''}\n`;
            });
        }
        const embed = {
            title: "Planilla Aprobada",
            description: `**Chofer:** ${planillaData.chofer}\n**Ramal:** ${planillaData.ramal}\n**Interno:** ${planillaData.interno}\n**Planillas Realizadas:** ${planillaData.planillasCount}\n${vueltasTexto}\n**Codigo de Planilla: ${planillaData.codigoPlanilla} | ${(planillaData.timestamp instanceof Date ? planillaData.timestamp.toLocaleString() : (planillaData.timestamp?.toDate ? planillaData.timestamp.toDate().toLocaleString() : planillaData.timestamp))}**`,
            color: 3066993,
            footer: { text: new Date().toLocaleString() }
        };
        await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ embeds: [embed] })
        });
        alert("Planilla aprobada y movida a historial.");
        obtenerPlanillas();
    } catch (error) {
        alert("Error al aprobar la planilla.");
        console.error(error);
    }
}
window.denegarPlanilla = async function denegarPlanilla(id) {
    try {
        // 1. Buscar la planilla en 'planillas'
        const planillaRef = doc(db, "planillas", id);
        const planillaSnap = await getDocs(collection(db, "planillas"));
        let planillaData = null;
        planillaSnap.forEach((docu) => {
            if (docu.id === id) {
                planillaData = { id: docu.id, ...docu.data() };
            }
        });
        if (!planillaData) {
            alert("No se encontró la planilla.");
            return;
        }
        // 2. Modificar estado y mover a historialPlanillas
        planillaData.estado = "rechazado";
        await addDoc(collection(db, "historialPlanillas"), planillaData);
        // 3. Eliminar de planillas
        await deleteDoc(planillaRef);
        // 4. Notificar a Discord
        let vueltasTexto = "";
        if (Array.isArray(planillaData.vueltas)) {
            planillaData.vueltas.forEach((v, idx) => {
                vueltasTexto += `Vuelta ${idx + 1}: Ida: ${v.ida} | Vuelta: ${v.vuelta} ${v.invalidada ? '(Invalidada)' : ''}\n`;
            });
        }
        const embed = {
            title: "Planilla Rechazada",
            description: `**Chofer:** ${planillaData.chofer}\n**Ramal:** ${planillaData.ramal}\n**Interno:** ${planillaData.interno}\n**Planillas Realizadas:** ${planillaData.planillasCount}\n${vueltasTexto}\n**Codigo de Planilla: ${planillaData.codigoPlanilla} | ${(planillaData.timestamp instanceof Date ? planillaData.timestamp.toLocaleString() : (planillaData.timestamp?.toDate ? planillaData.timestamp.toDate().toLocaleString() : planillaData.timestamp))}**`,
            color: 15158332,
            footer: { text: new Date().toLocaleString() }
        };
        await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ embeds: [embed] })
        });
        alert("Planilla rechazada y movida a historial.");
        obtenerPlanillas();
    } catch (error) {
        alert("Error al rechazar la planilla.");
        console.error(error);
    }
}
window.enviarMensajeInspector = async function enviarMensajeInspector() {
    const mensaje = document.getElementById('mensaje-inspector').value.trim();
    if (!mensaje) {
        alert("El mensaje no puede estar vacío.");
        return;
    }
    try {
        // Guardar en Firestore (Función 1)
        await addDoc(collection(db, "mensajesInspectores"), {
            texto: mensaje,
            timestamp: new Date()
        });
        // Enviar al webhook (Función 2)
        const embed = {
            title: "📨 Nuevo Mensaje del Inspector",
            description: `Un inspector ha enviado un nuevo mensaje: "${mensaje}"`,
            color: 3447003,
            footer: { text: new Date().toLocaleString() }
        };
        await fetch(apiMensajes, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ embeds: [embed] })
        });
        alert("Mensaje enviado correctamente.");
        cerrarMenuEnviarMensaje();
    } catch (err) {
        alert("Error al enviar el mensaje.");
        console.error(err);
    }
}
window.abrirMenuHistorialPlanillas = async function abrirMenuHistorialPlanillas() {
    const menu = document.getElementById('menu-historial-planillas');
    const contenedor = document.getElementById('contenedor-historial-planillas');
    contenedor.innerHTML = '';
    const querySnapshot = await getDocs(collection(db, "historialPlanillas"));
    let planillas = [];
    querySnapshot.forEach((docu) => {
        planillas.push({ id: docu.id, ...docu.data() });
    });
    if (planillas.length === 0) {
        contenedor.innerHTML = '<div class="texto-rojo">No hay historial de planillas.</div>';
    } else {
        planillas.sort((a, b) => {
            // Ordenar por fecha ascendente (más antiguo primero)
            const ta = a.timestamp instanceof Date ? a.timestamp : (a.timestamp?.toDate ? a.timestamp.toDate() : new Date(a.timestamp));
            const tb = b.timestamp instanceof Date ? b.timestamp : (b.timestamp?.toDate ? b.timestamp.toDate() : new Date(b.timestamp));
            return ta - tb;
        });
        historialCache = [...planillas];
        renderizarHistorial(historialCache);
    }
    menu.style.display = 'flex';
    window._historialPlanillasCache = planillas;
}
window.cerrarMenuHistorialPlanillas = function cerrarMenuHistorialPlanillas() {
    document.getElementById('menu-historial-planillas').style.display = 'none';
}
window.abrirMenuActualizar = function abrirMenuActualizar() {
    document.getElementById('menu-actualizar').style.display = 'flex';
}
window.cerrarMenuActualizar = function cerrarMenuActualizar() {
    document.getElementById('menu-actualizar').style.display = 'none';
}
window.actualizacion = async function actualizacion() {
    const titulo = document.getElementById('titulo-actualizacion').value.trim();
    const mensaje = document.getElementById('mensaje-actualizacion').value.trim();
    const cambios = document.getElementById('cambios-actualizacion').value.trim();
    const autor = document.getElementById('autor-actualizacion').value.trim();
    if (!titulo || !mensaje || !cambios || !autor) {
        alert('Por favor completa todos los campos.');
        return;
    }
    const embed = {
        title: `#
         ${titulo}`,
        description: `${mensaje}\n\n**Cambios:**\n${cambios}\nAutor: ${autor}`,
        color: 15844367,
        footer: { text: new Date().toLocaleString() }
    };
    try {
        await fetch(apiactu(), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ embeds: [embed] })
        });
        alert('Actualización enviada correctamente.');
        cerrarMenuActualizar();
    } catch (error) {
        alert('Error al enviar la actualización.');
        console.error(error);
    }
}
function reJoin() {
    window.location.href='https://abelcraftok.github.io/GTG/'
}
window.reJoin = reJoin;

window.abrirMenuAgregarChofer = function abrirMenuAgregarChofer() {
    document.getElementById('agregar-chofer').style.display = 'flex';
}
window.cerrarMenuAgregarChofer = function cerrarMenuAgregarChofer() {
    document.getElementById('agregar-chofer').style.display = 'none';
}
window.agregarChofer = async function agregarChofer() {
    const input = document.getElementById('nuevo-chofer-id');
    const id = input.value.trim();

    if (!id) {
        alert("Por favor ingrese el ID de Discord.");
        return;
    }

    const data = { chofer: `@${id}` };

    try {
        await addDoc(collection(db, "choferes"), data);
        alert(`✅ Chofer @${id} agregado correctamente.`);
        input.value = "";
        cerrarMenuAgregarChofer();
    } catch (error) {
        console.error("❌ Error al agregar chofer:", error);
        alert("Error al guardar el nuevo chofer.");
    }
}
let historialCache = []; // Copia del historial cargado

window.abrirMenuFiltroHistorial = function () {
    document.getElementById('menu-filtro-historial').style.display = 'flex';
}
window.cerrarMenuFiltroHistorial = function () {
    document.getElementById('menu-filtro-historial').style.display = 'none';
}

function renderizarHistorial(planillas) {
    const contenedor = document.getElementById('contenedor-historial-planillas');
    contenedor.innerHTML = '';

    if (planillas.length === 0) {
        contenedor.innerHTML = '<div class="texto-rojo">No hay historial de planillas.</div>';
        return;
    }

    planillas.forEach(planilla => {
        let vueltasHtml = '';
        if (Array.isArray(planilla.vueltas)) {
            planilla.vueltas.forEach((v, idx) => {
                vueltasHtml += `<div>Vuelta ${idx + 1}: Ida: ${v.ida} | Vuelta: ${v.vuelta} ${v.invalidada ? '<em>(Invalidada)</em>' : ''}</div>`;
            });
        }

        contenedor.innerHTML += `
            <div class="burbuja">
                <strong>Chofer:</strong> ${planilla.chofer}<br>
                <strong>Ramal:</strong> ${planilla.ramal}<br>
                <strong>Interno:</strong> ${planilla.interno}<br>
                <strong>Planillas Realizadas:</strong> ${planilla.planillasCount}<br>
                ${vueltasHtml}
                <strong>Codigo de Planilla:</strong> ${planilla.codigoPlanilla}<br>
                <strong>Fecha:</strong> ${(planilla.timestamp?.toDate ? planilla.timestamp.toDate().toLocaleString() : planilla.timestamp)}<br>
                <strong>Estado:</strong> ${planilla.estado}
            </div>
            <div class="separador"></div>
        `;
    });
}

// Ordenamientos
window.filtrarHistorialAZ = function () {
    const ordenado = [...historialCache].sort((a, b) => a.chofer.localeCompare(b.chofer));
    renderizarHistorial(ordenado);
    cerrarMenuFiltroHistorial();
}

window.filtrarHistorialZA = function () {
    const ordenado = [...historialCache].sort((a, b) => b.chofer.localeCompare(a.chofer));
    renderizarHistorial(ordenado);
    cerrarMenuFiltroHistorial();
}

window.filtrarHistorialRecientes = function () {
    const ordenado = [...historialCache].sort((a, b) => {
        const ta = a.timestamp?.toDate ? a.timestamp.toDate() : new Date(a.timestamp);
        const tb = b.timestamp?.toDate ? b.timestamp.toDate() : new Date(b.timestamp);
        return tb - ta;
    });
    renderizarHistorial(ordenado);
    cerrarMenuFiltroHistorial();
}

window.filtrarHistorialAntiguas = function () {
    const ordenado = [...historialCache].sort((a, b) => {
        const ta = a.timestamp?.toDate ? a.timestamp.toDate() : new Date(a.timestamp);
        const tb = b.timestamp?.toDate ? b.timestamp.toDate() : new Date(b.timestamp);
        return ta - tb;
    });
    renderizarHistorial(ordenado);
    cerrarMenuFiltroHistorial();
}
import { serverTimestamp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

async function registrarLogInicio() {
    const ahora = new Date();

    const dia = ahora.toLocaleDateString('es-AR');  // "dd/mm/yyyy"
    const hora = ahora.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false }); // "HH:mm"

    const logData = {
        dia: dia,
        hora: hora,
        timestamp: serverTimestamp()
    };

    try {
        await addDoc(collection(db, "logs"), logData);
        console.log("✅ Log registrado:", logData);
    } catch (err) {
        console.error("❌ Error al registrar log:", err);
    }
}

// Ejecutar al cargar la página
window.addEventListener("DOMContentLoaded", registrarLogInicio);
window.abrirMenuLogs = async function abrirMenuLogs() {
    const contenedor = document.getElementById('contenedor-logs');
    contenedor.innerHTML = '';
    document.getElementById('menu-logs').style.display = 'flex';

    const logsSnapshot = await getDocs(collection(db, "logs"));
    const hoy = new Date().toLocaleDateString('es-AR'); // "dd/mm/yyyy"

    const logsDeHoy = [];
    logsSnapshot.forEach((docu) => {
        const data = docu.data();
        if (data.dia === hoy) {
            logsDeHoy.push(data);
        }
    });

    if (logsDeHoy.length === 0) {
        contenedor.innerHTML = `<div class="texto-rojo">Hoy no se ha conectado nadie (según la base de datos).</div>`;
        return;
    }

    // Ordenar por hora (más reciente arriba)
    logsDeHoy.sort((a, b) => b.hora.localeCompare(a.hora));

    logsDeHoy.forEach(log => {
        contenedor.innerHTML += `
            <div class="burbuja">
                <strong>Hora:</strong> ${log.hora} <br>
                <strong>Fecha:</strong> ${log.dia}
            </div>
        `;
    });
}

window.cerrarMenuLogs = function cerrarMenuLogs() {
    document.getElementById('menu-logs').style.display = 'none';
}