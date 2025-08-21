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
const chofer = "@abelcraft_ok664";
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
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

        // Formatear timestamp
        let timestamp = '';
        if (planilla.timestamp instanceof Date) {
            timestamp = planilla.timestamp.toLocaleString();
        } else if (planilla.timestamp?.toDate) {
            timestamp = planilla.timestamp.toDate().toLocaleString();
        } else {
            timestamp = planilla.timestamp || '';
        }

        contenedor.innerHTML += `
            <div class="burbuja">
                <strong>Chofer:</strong> ${planilla.chofer}<br>
                <strong>Ramal:</strong> ${planilla.ramal}<br>
                <strong>Interno:</strong> ${planilla.interno}<br>
                <strong>Recorrido:</strong> ${planilla.recorrido}<br>
                <strong>Planillas Generales:</strong> ${planilla.planillas1}<br>
                <strong>Planillas Semanales:</strong> ${planilla.planillas2}<br>
                <strong>Planillas Diarias:</strong> ${planilla.planillas3}<br>
                
                <strong>IDA:</strong><br>
                &nbsp;&nbsp;Salida: ${planilla.ida1 || '-'}<br>
                &nbsp;&nbsp;Llegada: ${planilla.ida2 || '-'}<br>
                
                <strong>VUELTA:</strong><br>
                &nbsp;&nbsp;Salida: ${planilla.vuelta1 || '-'}<br>
                &nbsp;&nbsp;Llegada: ${planilla.vuelta2 || '-'}<br>
                
                <strong>Descanso 1:</strong> ${planilla.descanso || '-'}<br>
                <strong>Descanso 2:</strong> ${planilla.descanso2 || '-'}<br>
                
                <strong>Codigo de Planilla:</strong> ${planilla.codigoPlanilla} | ${timestamp}<br>
                <strong>Estado:</strong> ${planilla.estado}<br>
                
                <button onclick="aceptarPlanilla('${planilla.id}')" style="display: block; margin-top: 5px; color: white; background-color: #8bc34a; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer;">ACEPTAR</button>
                <button onclick="denegarPlanilla('${planilla.id}')" style="display: block; margin-top: 5px; color: white; background-color: #c0392b; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer;">RECHAZAR</button>
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
    alert("Aceptando planilla, por favor espere...");
    try {
        const planillaRef = doc(db, "planillas", id);
        const planillaSnap = await getDoc(planillaRef);
        if (!planillaSnap.exists()) {
            alert("No se encontró la planilla.");
            return;
        }

        const planillaData = { id: planillaSnap.id, ...planillaSnap.data() };
        planillaData.estado = "aprobado";

        // Mover a historialPlanillas
        await addDoc(collection(db, "historialPlanillas"), planillaData);
        await deleteDoc(planillaRef);

        // Construir texto de vueltas
        const vueltasTexto = `
IDA:
  Salida: ${planillaData.ida1 || '-'}
  Llegada: ${planillaData.ida2 || '-'}
VUELTA:
  Salida: ${planillaData.vuelta1 || '-'}
  Llegada: ${planillaData.vuelta2 || '-'}
`;

        const embed = {
            title: "Planilla Aprobada",
            description: `**Chofer:** ${planillaData.chofer}
**Ramal:** ${planillaData.ramal}
**Interno:** ${planillaData.interno}
**Recorrido:** ${planillaData.recorrido}
**Planillas Generales:** ${planillaData.planillas1}
**Planillas Semanales:** ${planillaData.planillas2}
**Planillas Diarias:** ${planillaData.planillas3}
${vueltasTexto}
**Codigo de Planilla:** ${planillaData.codigoPlanilla} | ${(planillaData.timestamp instanceof Date ? planillaData.timestamp.toLocaleString() : (planillaData.timestamp?.toDate ? planillaData.timestamp.toDate().toLocaleString() : planillaData.timestamp))}
`,
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
    alert("Rechazando planilla, por favor espere...");
    try {
        const planillaRef = doc(db, "planillas", id);
        const planillaSnap = await getDoc(planillaRef);
        if (!planillaSnap.exists()) {
            alert("No se encontró la planilla.");
            return;
        }

        const planillaData = { id: planillaSnap.id, ...planillaSnap.data() };
        planillaData.estado = "rechazado";

        await addDoc(collection(db, "historialPlanillas"), planillaData);
        await deleteDoc(planillaRef);

        const vueltasTexto = `
IDA:
  Salida: ${planillaData.ida1 || '-'}
  Llegada: ${planillaData.ida2 || '-'}
VUELTA:
  Salida: ${planillaData.vuelta1 || '-'}
  Llegada: ${planillaData.vuelta2 || '-'}
`;

        const embed = {
            title: "Planilla Rechazada",
            description: `**Chofer:** ${planillaData.chofer}
**Ramal:** ${planillaData.ramal}
**Interno:** ${planillaData.interno}
**Recorrido:** ${planillaData.recorrido}
**Planillas Generales:** ${planillaData.planillas1}
**Planillas Semanales:** ${planillaData.planillas2}
**Planillas Diarias:** ${planillaData.planillas3}
${vueltasTexto}
**Codigo de Planilla:** ${planillaData.codigoPlanilla} | ${(planillaData.timestamp instanceof Date ? planillaData.timestamp.toLocaleString() : (planillaData.timestamp?.toDate ? planillaData.timestamp.toDate().toLocaleString() : planillaData.timestamp))}
`,
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
