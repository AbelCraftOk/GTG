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
    serverTimestamp,
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
async function subirImagenes() {
  const idInput = document.getElementById("id-planilla").value.trim();
  const input = document.getElementById("imagenes");
  const archivos = input.files;
  if (!idInput || archivos.length === 0) {
    alert("⚠️ Debes escribir una ID y seleccionar al menos una imagen.");
    return;
  }
  if (archivos.length > 8) {
    alert("⚠️ Solo puedes subir hasta 8 imágenes.");
    return;
  }
  const data = {};
  for (let i = 0; i < archivos.length; i++) {
    const binario = await convertirABinario(archivos[i]);
    data[`img${i + 1}`] = binario;
  }
  try {
    await setDoc(doc(db, "capturas", idInput), data);
    alert("✅ Imágenes subidas correctamente con ID: " + idInput);
  } catch (err) {
    console.error("Error al guardar imágenes:", err);
    alert("❌ Error al subir imágenes.");
  }
}
async function verImagenes() {
  const idBuscar = document.getElementById("buscar-id").value.trim();
  if (!idBuscar) {
    alert("⚠️ Debes colocar una ID.");
    return;
  }
  try {
    const docSnap = await getDoc(doc(db, "capturas", idBuscar));
    if (!docSnap.exists()) {
      alert("No hay capturas asignadas a esa ID");
      return;
    }
    const contenedor = document.getElementById("contenedor-imagenes");
    contenedor.innerHTML = "";
    const data = docSnap.data();
    Object.values(data).forEach(binario => {
      const img = document.createElement("img");
      img.src = "data:image/png;base64," + binario;
      img.style.width = "200px";
      img.style.margin = "10px";
      contenedor.appendChild(img);
    });
  } catch (err) {
    console.error("Error al obtener imágenes:", err);
    alert("❌ Error al cargar imágenes.");
  }
}
window.subirImagenes = subirImagenes;
window.verImagenes = verImagenes;