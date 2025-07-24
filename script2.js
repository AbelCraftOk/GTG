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
async function obtenerPlanillas() {
    const querySnapshot = await getDocs(collection(db, "planillas"));
    let planillas = [];
    querySnapshot.forEach((doc) => {
        planillas.push({ id: doc.id, ...doc.data() });
    });
    return planillas;
}
window.aceptarPlanilla = async function aceptarPlanilla(id) {
    const planillaRef = doc(db, "planillas", id);
    await updateDoc(planillaRef, { estado: "aceptada" });
    alert("Planilla aceptada.");
}
window.denegarPlanilla = async function denegarPlanilla(id) {
    const planillaRef = doc(db, "planillas", id);
    await updateDoc(planillaRef, { estado: "denegada" });
    alert("Planilla denegada.");
}
window.enviarMensajeInspector = async function enviarMensajeInspector() {
    const mensaje = document.getElementById('mensaje-inspector').value.trim();
    if (!mensaje) {
        alert("El mensaje no puede estar vacío.");
        return;
    }
    try {
        await addDoc(collection(db, "mensajesInspectores"), {
            texto: mensaje,
            timestamp: new Date()
        });
        alert("Mensaje enviado correctamente.");
        cerrarMenuEnviarMensaje();
    } catch (err) {
        alert("Error al enviar el mensaje.");
        console.error(err);
    }
}
async function mostrarMensajesInspector() {
    const querySnapshot = await getDocs(collection(db, "mensajesInspectores"));
    const container = document.getElementById('contenedor-mensajes-chofer');
    container.innerHTML = "";
    querySnapshot.forEach((doc) => {
        const m = doc.data();
        container.innerHTML += `
            <div class="burbuja">
                <p>${m.texto}</p>
                <button class="boton-mini" onclick="eliminarMensajeInspector('${doc.id}')">🗑</button>
            </div>`;
    });
}
window.abrirMenuMensajesChofer = mostrarMensajesInspector;
window.eliminarMensajeInspector = async function eliminarMensajeInspector(id) {
    await deleteDoc(doc(db, "mensajesInspectores", id));
    alert("Mensaje eliminado.");
    abrirMenuMensajesChofer(); // Refresca la lista
}