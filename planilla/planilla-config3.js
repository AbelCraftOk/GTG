import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import {
    getFirestore,
    collection,
    addDoc,
    getDocs,
    getDoc,
    deleteDoc,
    doc,
    updateDoc,
    query,
    where,
    setDoc,
    doc as firestoreDoc
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
const chofer = "@elrayo_joaqueen.";
document.addEventListener("DOMContentLoaded", mostrarLasPlanillas);
async function mostrarLasPlanillas() { 
    const contenedor = document.getElementById('resumen-vueltas');
    contenedor.innerHTML = '';

    const planillasRef = collection(db, "planillas");
    const q = query(planillasRef, where("chofer", "==", chofer));

    const querySnapshot = await getDocs(q);

    let planillas = [];
    querySnapshot.forEach((docu) => {
        planillas.push({ id: docu.id, ...docu.data() });
    });

    if (planillas.length === 0) {
        contenedor.innerHTML = '<div class="texto-rojo">No se han encontrado planillas recientes.</div>';
        document.getElementById('cargando-planilla').style.display = 'none';
        return;
    }

    planillas.forEach(planilla => {
        document.getElementById('cargando-planilla').style.display = 'none';

        contenedor.innerHTML += `
            <div class="burbuja">
                <strong>Chofer:</strong> ${planilla.chofer}<br>
                <strong>Ramal:</strong> ${planilla.ramal}<br>
                <strong>Recorrido:</strong> ${planilla.recorrido}<br>
                <strong>Interno:</strong> ${planilla.interno}<br><br>

                <u><b>IDA</b></u><br>
                • Salida: ${planilla.ida1 || '—'}<br>
                • Llegada: ${planilla.ida2 || '—'}<br><br>

                <u><b>DESCANSOS</b></u><br>
                • Descanso 1: ${planilla.descanso || '—'}<br>
                ${planilla.descanso2 ? `• Descanso 2: ${planilla.descanso2}<br>` : ''}<br>

                <u><b>VUELTA</b></u><br>
                • Salida: ${planilla.vuelta1 || '—'}<br>
                • Llegada: ${planilla.vuelta2 || '—'}<br><br>

                <u><b>PLANILLAS</b></u><br>
                • Generales: ${planilla.planillas1 || 0}<br>
                • Semanales: ${planilla.planillas2 || 0}<br>
                • Mensuales: ${planilla.planillas3 || 0}<br><br>

                <strong>Código de Planilla:</strong> ${planilla.codigoPlanilla}<br>
                <strong>Fecha:</strong> ${planilla.timestamp instanceof Date 
                    ? planilla.timestamp.toLocaleString() 
                    : (planilla.timestamp?.toDate ? planilla.timestamp.toDate().toLocaleString() : planilla.timestamp)}<br>
                <strong>Estado:</strong> ${planilla.estado}<br><br>

                <button onclick="aceptarPlanilla('${planilla.id}')" 
                    style="display: block; margin-top: 5px; color: white; background-color: #8bc34a; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer;">
                    ACEPTAR
                </button>
                <button onclick="denegarPlanilla('${planilla.id}')" 
                    style="display: block; margin-top: 5px; color: white; background-color: #c0392b; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer;">
                    RECHAZAR
                </button>
            </div>
            <div class="separador"></div>
        `;
    });
}


window.mostrarLasPlanillas = mostrarLasPlanillas;
    const WEBHOOK_URL = enlaceCodificado(); //Para planillas
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

window.aceptarPlanilla = async function aceptarPlanilla(id) {
    alert("Aceptando planilla, por favor espere...")
    try {
        // 1. Buscar la planilla en 'planillas'
        const planillaRef = doc(db, "planillas", id);
        const planillaSnap = await getDoc(planillaRef);
        if (!planillaSnap.exists()) {
            alert("No se encontró la planilla.");
            return;
        }
        const planillaData = { id: planillaSnap.id, ...planillaSnap.data() };
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
        mostrarLasPlanillas()
    } catch (error) {
        alert("Error al aprobar la planilla.");
        console.error(error);
    }
}

window.denegarPlanilla = async function denegarPlanilla(id) {
    alert("Rechazando planilla, por favor espere...")
    try {
        // 1. Buscar la planilla en 'planillas'
        const planillaRef = doc(db, "planillas", id);
        const planillaSnap = await getDoc(planillaRef);
        if (!planillaSnap.exists()) {
            alert("No se encontró la planilla.");
            return;
        }
        const planillaData = { id: planillaSnap.id, ...planillaSnap.data() };
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
        mostrarLasPlanillas()
    } catch (error) {
        alert("Error al rechazar la planilla.");
        console.error(error);
    }
}