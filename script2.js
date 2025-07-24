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
    const chofer = document.getElementById('chofer').value.trim();
    const planillasCount = document.getElementById('planillas').value.trim();
    if (!ramalSeleccionado || !internoSeleccionado || !chofer || !planillasCount || vueltas.length === 0) {
        alert("Por favor, complete todos los datos (Chofer, Ramal, Interno, Planillas y cargue al menos una vuelta) antes de guardar.");
        return;
    }
    const nuevaPlanilla = {
        chofer: chofer,
        ramal: ramalSeleccionado,
        interno: internoSeleccionado,
        planillasCount: planillasCount,
        vueltas: [...vueltas],
        estado: 'pendiente',
        timestamp: new Date(),
        codigoPlanilla: codigoPlanilla,
    };
    try {
        await addDoc(collection(db, "planillas"), nuevaPlanilla);
        alert("Planilla guardada exitosamente.");
    } catch (error) {
        alert("Error al guardar la planilla.");
        console.error(error);
    }
    limpiarCampos();
    abrirMenuCapturas();
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
                </div>
                <div class="separador"></div>
            `;
        });
    }
    menu.style.display = 'flex';
    window._historialPlanillasCache = planillas;
}
window.cerrarMenuHistorialPlanillas = function cerrarMenuHistorialPlanillas() {
    document.getElementById('menu-historial-planillas').style.display = 'none';
}
window.eliminarPlanillaMasAntigua = async function eliminarPlanillaMasAntigua() {
    const planillas = window._historialPlanillasCache || [];
    if (planillas.length === 0) return;
    const masAntigua = planillas[0];
    if (confirm('¿Seguro que deseas eliminar la planilla más antigua?')) {
        await deleteDoc(doc(db, "historialPlanillas", masAntigua.id));
        window.abrirMenuHistorialPlanillas();
    }
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
        title: `# 🆕 ${titulo}`,
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
    const parteR = "FLZ8TTQT8te";
    const apiactu = parteA + parteB + parteC + parteD + parteE + parteF + parteG + parteH + parteI + parteJ + parteK + parteL + parteM + parteN + parteO + parteP + parteQ + parteR;
    return apiactu;
}