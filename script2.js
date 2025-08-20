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

function enviarMensaje(planillaData) {
    const inspectores = inspectoresActiven();

    let vueltasTexto = "";

    if (Array.isArray(planillaData.vueltas) && planillaData.vueltas.length > 0) {
        vueltasTexto = "**Vueltas:**\n";
        planillaData.vueltas.forEach((v, i) => {
            vueltasTexto += `• Vuelta ${i + 1}: ${v.hora || 'sin hora'} - ${v.comentario || 'sin comentario'}\n`;
        });
    } else {
        vueltasTexto = "Sin vueltas registradas.";
    }

    const embed = {
        title: "📋 Nueva Planilla Cargada",
        description: `Hola Inspectores queridos, soy el BOT encargado de avisarle cuando alla una nueva planilla y recien se acaba de cargar una nueva, asi que lo antes posible traten de revisarla... Aqui se las dejo ❤️\n\n**Chofer:** ${planillaData.chofer}\n**Ramal:** ${planillaData.ramal}\n**Interno:** ${planillaData.interno}\n**Planillas Realizadas:** ${planillaData.planillasCount}\n\n${vueltasTexto}\n\n**Código de Planilla:** ${planillaData.codigoPlanilla} | ${new Date().toLocaleString()}\n\n[👉 Aceptar/Rechazar Planilla](https://abelcraftok.github.io/GTG/planilla/@${planillaData.chofer.replace('@', '')}.html)`,
        color: 3066993,
        footer: {
            text: `📅 Enviada: ${new Date().toLocaleString()}`
        }
    };

    const payload = { embeds: [embed] };

    fetch(inspectores, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
    })
    .then(response => {
        if (!response.ok) {
            console.error("❌ Error al enviar mensaje:", response.statusText);
        } else {
            console.log("✅ Mensaje embed enviado a Discord");
            redirigirSegunRol();
        }
    })
    .catch(error => {
        console.error("❌ Error en la solicitud al enviar embed:", error);
    });
}
async function guardarPlanilla() {
    alert("Enviando planilla, por favor espere...")
    const codigoPlanilla = generarCodigoUnico();

    const choferElem = document.getElementById('chofer');
    const planillasElem = document.getElementById('planillas');

    if (!choferElem || !planillasElem) {
        alert("❌ No se encontraron algunos campos obligatorios en el DOM (chofer o planillas).");
        return;
    }

    const choferInput = choferElem.value.trim();
    const planillasCount = planillasElem.value.trim();

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
        // Verificar si el chofer está registrado
        const choferesSnapshot = await getDocs(collection(db, "choferes"));
        let choferEncontrado = false;

        choferesSnapshot.forEach(docu => {
            const data = docu.data();
            if (data.chofer === `${choferInput}`) {
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
        console.log("✅ Planilla registrada");

        enviarMensaje(nuevaPlanilla);  // 👈 Mensaje con embed a Discord
        limpiarCampos()

    } catch (error) {
        console.error("Error al guardar/verificar la planilla:", error);
        alert("❌ Ocurrió un error al guardar la planilla.");
    }
}
window.guardarPlanilla = guardarPlanilla;

window.obtenerPlanillas = async function obtenerPlanillas() {
  alert("Obteniendo planillas, por favor espere...")
  const contenedor = document.getElementById('resumen-vueltas');
  if (!contenedor) {
    console.error("El elemento 'resumen-vueltas' no se encontró.");
    return;
  }
  contenedor.innerHTML = '';

  try {
    const querySnapshot = await getDocs(collection(db, "planillas"));
    let planillas = [];
    querySnapshot.forEach((docu) => {
      planillas.push({ id: docu.id, ...docu.data() });
    });

    if (planillas.length === 0) {
      const msg = '<div class="texto-rojo">No se han encontrado planillas recientes.</div>';
      contenedor.innerHTML = msg;
      return;
    }

    planillas.forEach(planilla => {
      let vueltasHtml = '';
      if (Array.isArray(planilla.vueltas)) {
        planilla.vueltas.forEach((v, idx) => {
          vueltasHtml += `<div>Vuelta ${idx + 1}: Ida: ${v.ida} | Vuelta: ${v.vuelta} ${v.invalidada ? '<em>(Invalidada)</em>' : ''}</div>`;
        });
      }

      const planillaHTML = `
        <div class="burbuja">
          <strong>Chofer:</strong> ${planilla.chofer}<br>
          <strong>Ramal:</strong> ${planilla.ramal}<br>
          <strong>Interno:</strong> ${planilla.interno}<br>
          <strong>Planillas Realizadas:</strong> ${planilla.planillasCount}<br>
          ${vueltasHtml}
          <strong>Codigo de Planilla:</strong> ${planilla.codigoPlanilla} | 
          ${planilla.timestamp instanceof Date
            ? planilla.timestamp.toLocaleString()
            : (planilla.timestamp?.toDate
              ? planilla.timestamp.toDate().toLocaleString()
              : planilla.timestamp)}<br>
          <strong>Estado:</strong> ${planilla.estado}<br>
          <button onclick="aceptarPlanilla('${planilla.id}')" style="display: block; margin-top: 5px; color: white; background-color: #8bc34a; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer;">ACEPTAR</button>
          <button onclick="denegarPlanilla('${planilla.id}')" style="display: block; margin-top: 5px; color: white; background-color: #c0392b; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer;">RECHAZAR</button>
        </div>
        <div class="separador"></div>
      `;

      contenedor.innerHTML += planillaHTML;
    });
  } catch (error) {
    console.error("Error al obtener planillas:", error);
  }
};

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
        obtenerPlanillas();
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
        obtenerPlanillas();
    } catch (error) {
        alert("Error al rechazar la planilla.");
        console.error(error);
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
        title: `Nueva Actualizacion: ${titulo}`,
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
    location.reload()
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

    const data = { chofer: `${id}` };

    try {
        await addDoc(collection(db, "choferes"), data);
        alert(`✅ Chofer ${id} agregado correctamente.`);
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
async function registrarLogInicio(usuario) {
    const ahora = new Date();

    const dia = ahora.toLocaleDateString('es-AR');  // "dd/mm/yyyy"
    const hora = ahora.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false }); // "HH:mm"

    const logData = {
        dia: dia,
        hora: hora,
        timestamp: serverTimestamp(),
        usuario: usuario
    };

    try {
        await addDoc(collection(db, "logs"), logData);
        console.log("✅ Log registrado:", logData);
    } catch (err) {
        console.error("❌ Error al registrar log:", err);
    }
}

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
                <strong>Usuario:</strong> ${log.usuario} <br>
                <strong>Hora:</strong> ${log.hora} <br>
                <strong>Fecha:</strong> ${log.dia}
            </div>
        `;
    });
}
window.cerrarMenuLogs = function cerrarMenuLogs() {
    document.getElementById('menu-logs').style.display = 'none';
}
window.registrarCuenta = async function () {
  const usuario = document.getElementById('register-user').value.trim();
  const clave = document.getElementById('register-password').value.trim();
  if (!usuario || !clave) {
    alert("Completa todos los campos.");
    return;
  }
  const datosCuenta = {
    usuario,
    clave,
    rol: "usuario"
  };
  const datosCuentaExtra = {
    usuario,
    clave,
    viaje: "0",
    viajes: "0"
  };
  try {
    const querySnapshot = await getDocs(collection(db, "cuentas"));
    let existeCuenta = false;
    querySnapshot.forEach((docu) => {
      if (docu.data().usuario === usuario) {
        existeCuenta = true;
      }
    });
    if (existeCuenta) {
      alert("Ya existe una cuenta con ese usuario.");
      return;
    }
    await addDoc(collection(db, "cuentas"), datosCuenta);
    await addDoc(collection(db, "cuenta"), datosCuentaExtra);
    alert("Cuenta registrada exitosamente.");
    mostrarPestania('login');
  } catch (err) {
    console.error("Error al registrar la cuenta:", err);
    alert("Error al registrar la cuenta.");
  }
};
window.login = async function () {
    document.getElementById('logueandocampo').style.display = 'block';
    rotateText();
    const usuarioInput = document.getElementById('login-user').value.trim();
    const claveInput = document.getElementById('login-password').value.trim();
    const q = query(collection(db, "cuentas"), where("usuario", "==", usuarioInput));
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
        alert("El usuario no coincide con las cuentas creadas.");
        return;
    }
    let acceso = false;
    snapshot.forEach((docu) => {
        const data = docu.data();
        if (data.clave === claveInput) {
            acceso = true;
            const rol = data.rol;

            localStorage.setItem("usuario", data.usuario);
            localStorage.setItem("clave", data.clave);
            localStorage.setItem("rolUsuario", rol);
            localStorage.setItem("loginConfig", JSON.stringify({
                usuario: data.usuario,
                clave: data.clave
            }));
            
            window.user = data.usuario;
            registrarLogInicio(data.usuario);
            
            document.getElementById('myAudio').play()
            if (rol === "developer") {
                alert('Logueo exitoso, tu rol es: Developer');
                mostrarPestania('developer');
                document.getElementById('cerrarSesion').style.display = 'block';
                document.getElementById('feedback').style.display = 'flex';
                document.getElementById('micro-btn').style.display = 'flex';
                document.getElementById('logueandocampo').style.display = 'none';
            }
            else if (rol === "inspector") {
                alert('Logueo exitoso, tu rol es: Inspector');
                mostrarPestania('inspectores');
                document.getElementById('cerrarSesion').style.display = 'block';
                document.getElementById('feedback').style.display = 'flex';
                document.getElementById('micro-btn').style.display = 'flex';
                document.getElementById('logueandocampo').style.display = 'none';
            }
            else if (rol === "personal") {
                alert('Logueo exitoso, tu eres del Perosnal de la empresa GTG');
                mostrarPestania('personal');
                document.getElementById('cerrarSesion').style.display = 'block';
                document.getElementById('feedback').style.display = 'flex';
                document.getElementById('micro-btn').style.display = 'flex';
                document.getElementById('logueandocampo').style.display = 'none';
            }
            else if (rol === "admin") {
                alert('Logueo exitoso, tu rol es: Administrador');
                mostrarPestania('admin');
                document.getElementById('cerrarSesion').style.display = 'block';
                document.getElementById('feedback').style.display = 'flex';
                document.getElementById('micro-btn').style.display = 'flex';
                document.getElementById('logueandocampo').style.display = 'none';
            }
            else if (rol === "jefe") {
                alert('Logueo exitoso, tu rol es: Jefe');
                mostrarPestania('admin');
                document.getElementById('cerrarSesion').style.display = 'block';
                document.getElementById('feedback').style.display = 'flex';
                document.getElementById('micro-btn').style.display = 'flex';
                document.getElementById('logueandocampo').style.display = 'none';
            }
            else if (rol === "usuario") {
                alert('Logueo exitoso');
                mostrarPestania('usuario');
                document.getElementById('cerrarSesion').style.display = 'block';
                document.getElementById('feedback').style.display = 'flex';
                document.getElementById('micro-btn').style.display = 'flex';
                document.getElementById('logueandocampo').style.display = 'none';
            }
        } else {
            alert("La clave es incorrecta.");
            document.getElementById('logueandocampo').style.display = 'none';
        }
    });
    if (!acceso) return;
};
window.autoLogin = async function () {
    const config = localStorage.getItem("loginConfig");

    // Si no hay datos guardados, redirige al login
    if (!config) {
        setTimeout(() => {
            mostrarPestania('login');
            document.getElementById('auto-login').style.display = 'none';
        }, 1500);
        return;
    }

    const { usuario, clave } = JSON.parse(config);
    document.getElementById('logueandocampo').style.display = 'block';
    rotateText();
    document.getElementById('myAudio').play()

    try {
        const q = query(collection(db, "cuentas"), where("usuario", "==", usuario));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
            alert("El usuario no coincide con las cuentas guardadas.");
            localStorage.removeItem("loginConfig");
            document.getElementById('logueandocampo').style.display = 'none';
            mostrarPestania('login');
            return;
        }

        let acceso = false;
        snapshot.forEach((docu) => {
            const data = docu.data();
            if (data.clave === clave) {
                acceso = true;
                const rol = data.rol;

                // Guardar datos de sesión
                localStorage.setItem("usuario", data.usuario);
                localStorage.setItem("clave", data.clave);
                localStorage.setItem("rolUsuario", rol);
                window.user = data.usuario;
                registrarLogInicio(data.usuario);

                let pestania = '';
                if (rol === "developer") pestania = 'developer';
                else if (rol === "inspector") pestania = 'inspectores';
                else if (rol === "personal") pestania = 'personal';
                else if (rol === "admin" || rol === "jefe") pestania = 'admin';
                else pestania = 'usuario';

                alert(`Logueo exitoso, tu rol es: ${rol}`);
                mostrarPestania(pestania);
                document.getElementById('cerrarSesion').style.display = 'block';
                document.getElementById('feedback').style.display = 'flex';
                document.getElementById('micro-btn').style.display = 'flex';
                document.getElementById('logueandocampo').style.display = 'none';
                document.getElementById('auto-login').style.display = 'none';
            }
        });

        // Si no se logró acceso, ir al login
        if (!acceso) {
            alert("La clave es incorrecta o el usuario no tiene acceso.");
            localStorage.removeItem("loginConfig");
            document.getElementById('logueandocampo').style.display = 'none';
            document.getElementById('auto-login').style.display = 'none';
            mostrarPestania('login');
        }
    } catch (error) {
        console.error("Error en auto-login:", error);
        alert("Hubo un error al intentar loguearte automáticamente.");
        localStorage.removeItem("loginConfig");
        document.getElementById('logueandocampo').style.display = 'none';
        document.getElementById('auto-login').style.display = 'none';
        mostrarPestania('login');
    }
};
window.redirigirSegunRol = function () {
    const rol = localStorage.getItem("rolUsuario");

    if (!rol) {
        alert("No se encontró información de rol. Por favor, inicie sesión.");
        return;
    }
    if (rol === "developer") mostrarPestania('developer');
    else if (rol === "inspector") mostrarPestania('inspectores');
    else if (rol === "personal") mostrarPestania('personal');
    else if (rol === "admin") mostrarPestania('admin');
    else if (rol === "jefe") mostrarPestania('admin');
    else if (rol === "usuario") mostrarPestania('usuario');
    else alert("Rol desconocido. Verifique su cuenta.");
};
window.enviarSolicitud = async function () {
    const id = document.getElementById('asistencia-id').value.trim();
    if (!id) return alert("Completa tu ID de Discord.");

    const embed = {
        title: "Nueva Solicitud de Asistencia",
        description: `Usuario: ${id}\nTipo de Solicitud: Solicitud de Rango en la cuenta`,
        color: 15844367,
        footer: { text: new Date().toLocaleString() }
    };

    try {
        await fetch(solicitudCifrada(), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ embeds: [embed] })
        });
        alert("Solicitud enviada.");
        document.getElementById('menu-asistencia').style.display = 'none';
    } catch (err) {
        alert("Error al enviar la solicitud.");
        console.error(err);
    }
};
window.enviarPreActualizacion = async function () {
const titulo = document.getElementById('titulo-pre-actualizacion').value.trim();
    const mensaje = document.getElementById('mensaje-pre-actualizacion').value.trim();
    const cambios = document.getElementById('cambios-pre-actualizacion').value.trim();
    const autor = document.getElementById('autor-pre-actualizacion').value.trim();
    if (!titulo || !mensaje || !cambios || !autor) {
        alert('Por favor completa todos los campos.');
        return;
    }
    const embed = {
        title: `SPOILER de la proxima Actualizacion: ${titulo}`,
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
        alert('Pre-Actualización enviada correctamente.');
        cerrarMenuActualizar();
    } catch (error) {
        alert('Error al enviar la actualización.');
        console.error(error);
    }
};
// Función: Contar pasajes disponibles
async function countPasajesDisponibles() {
    const docSnap = await getDocs(collection(db, "viaje"));
    let count = 0;
    docSnap.forEach(d => {
        if (d.data().estado === "activo") count++;
    });
    return count === 1 ? "1 pasaje disponible" : `${count} pasajes disponibles.`;
}

// Función: Mostrar pasajes disponibles
async function mostrarPasajesDisponibles() {
    const div = document.getElementById("pasajesDisponibles");
    div.innerHTML = "Cargando...";
    const docs = await getDocs(collection(db, "viaje"));
    const activos = [];
    docs.forEach(d => {
        if (d.data().estado === "activo") {
            activos.push({ id: d.id, ...d.data() });
        }
    });
    if (activos.length === 0) {
        div.innerHTML = "No hay pasajes disponibles.";
        return;
    }
    const random = activos[Math.floor(Math.random() * activos.length)];
    div.innerHTML = `
    ID de viaje: ${random.viaje}<br/>
    Recorrido: ${random.recorrido}<br/>
    <button onclick="comprarPasaje('${random.viaje}')">Comprar este pasaje</button>
  `;
}
window.mostrarPasajesDisponibles = mostrarPasajesDisponibles;
// Función: Mostrar información de pasajes sin viajar
async function mostrarPasajesSinViajar() {
    const div = document.getElementById("infoPasajes");
    const cuentaRef = doc(db, "cuenta", $idUsuario$);
    const userSnap = await getDocs(collection(db, "cuenta"));
    let viaje = "0";
    userSnap.forEach(d => {
        if (d.id === $idUsuario$) viaje = d.data().viaje;
    });
    if (viaje === "0") {
        div.innerText = "No tienes pasajes sin viajar.";
        return;
    }
    const viajesSnap = await getDocs(collection(db, "viaje"));
    for (const d of viajesSnap.docs) {
        const data = d.data();
        if (data.estado === "activo" && data.viaje === viaje) {
            div.innerHTML = `
        ID de viaje: ${data.viaje}<br/>
        Recorrido: ${data.recorrido}<br/>
        Día de Viaje: ${data.vencimiento}
      `;
            return;
        }
    }
}
window.mostrarPasajesSinViajar = mostrarPasajesSinViajar;
// Función: Comprar pasaje
async function comprarPasaje(viajeId) {
    const cuentaRef = doc(db, "cuenta", $idUsuario$);
    const userSnap = await getDocs(collection(db, "cuenta"));
    for (const d of userSnap.docs) {
        if (d.id === $idUsuario$) {
            if (parseInt(d.data().viaje) >= 1) {
                alert("Ya tienes un pasaje asignado.");
                return;
            }
        }
    }
    const userData = (await getDocs(collection(db, "cuenta"))).docs.find(d => d.id === $idUsuario$).data();
    const nuevoData = {
        clave: userData.clave,
        usuario: userData.usuario,
        viaje: viajeId,
        viajes: userData.viajes
    };
    await setDoc(doc(db, "cuenta", $idUsuario$), nuevoData);
    alert("Pasaje comprado con éxito.");
    mostrarPestania("usuario");
}
window.comprarPasaje = comprarPasaje;
window.guardarUbicacion = guardarUbicacion;
async function enviarPlanilla() {
    const chofer = document.getElementById('chofer').value.trim();
    if (!chofer) {
        alert("Debes indicar el chofer antes de enviar la planilla.");
        return;
    }
    guardarPlanilla();
    await eliminarUbicacionesChofer(chofer);
}
window.enviarPlanilla = enviarPlanilla;
async function eliminarUbicacionesChofer(chofer) {
    try {
        const q = query(collection(db, "ubication"), where("chofer", "==", chofer));
        const snapshot = await getDocs(q);
        if (snapshot.empty) {
            console.log("No había ubicaciones para eliminar.");
            return;
        }
        const deletes = snapshot.docs.map(docSnap => deleteDoc(docSnap.ref));
        await Promise.all(deletes);
        console.log(`Se eliminaron ${snapshot.size} ubicaciones del chofer ${chofer}`);
    } catch (error) {
        console.error("Error eliminando ubicaciones:", error);
    }
}
async function refrescarColectivos() {
    const listaDiv = document.getElementById("colectivos-lista");
    listaDiv.innerHTML = "Cargando...";
    try {
        const snapshot = await getDocs(collection(db, "ubication"));
        if (snapshot.empty) {
            listaDiv.innerHTML = '<span style="color:red; font-weight:bold;">No hay colectivos circulando.</span>';
            return;
        }
        listaDiv.innerHTML = "";
        snapshot.forEach(docSnap => {
            const data = docSnap.data();
            const linea = `[${data.ramal}] - ${data.chofer} - ${data.ubicacion} - ${data.sentido} - ${data.time}`;
            const p = document.createElement("p");
            p.classList.add("colectivo-linea");
            p.innerHTML = `
                <span style="color: #00BFFF; font-weight: bold;">[${data.ramal}]</span>
                <span style="color: white; font-weight: bold;"> - </span>
                <span style="color: #FF0000; font-weight: bold;">${data.chofer}</span>
                <span style="color: white; font-weight: bold;"> - </span>
                <span style="color: #32CD32; font-weight: bold;">${data.ubicacion}</span>
                <span style="color: white; font-weight: bold;"> - </span>
                <span style="color: #FFA500; font-weight: bold;">${data.sentido}</span>
                <span style="color: white; font-weight: bold;"> - </span>
                <span style="color: #008000; font-weight: bold;">${data.time}</span>
            `;
            listaDiv.appendChild(p);
            listaDiv.appendChild(document.createElement("div"));
        });
    } catch (error) {
        console.error("Error al cargar colectivos:", error);
        listaDiv.innerHTML = "Error al cargar la información.";
    }
}
window.refrescarColectivos = refrescarColectivos;
async function guardarUbicacion(ubicacion) {
    const chofer = document.getElementById('chofer').value.trim();
    const ramal = document.getElementById('boton-ramal').innerText.trim();
    const sentido = document.getElementById('sentido').value;
    if (!chofer || chofer === "Indicar Chofer") {
        alert('Debes indicar el chofer antes de guardar la ubicación.');
        return;
    }
    if (!ramal || ramal === "Indicar Ramal") {
        alert('Debes indicar el ramal antes de guardar la ubicación.');
        return;
    }
    if (!sentido) {
        alert('Debes seleccionar el sentido (IDA o VUELTA).');
        return;
    }
    const fecha = new Date();
    const horaFormato = `${fecha.getHours().toString().padStart(2,'0')}:` +
                        `${fecha.getMinutes().toString().padStart(2,'0')}`;
    try {
        await setDoc(doc(db, "ubication", chofer), {
            chofer: chofer,
            ubicacion: ubicacion,
            time: horaFormato,
            ramal: ramal,
            sentido: sentido
        });
        console.log(`✅ Ubicación "${ubicacion}" guardada para ${chofer}, ramal ${ramal}, sentido ${sentido}`);
        const webhookUrl = enlaces();
        const embed = {
            title: "🚌 Nueva Ubicación Registrada",
            description: `El chofer @${chofer.replace('@', '')} ha guardado una nueva ubicación.\n\n` +
                         `📍 Ubicación: **${ubicacion}**\n` +
                         `🛣️ Ramal: **${ramal}**\n` +
                         `➡️ Sentido: **${sentido}**\n\n` +
                         `[Visualizar Últimas Ubicaciones de Recorridos Actuales](https://abelcraftok.github.io/GTG/ubication.html)`,
            color: 3447003,
            footer: { text: `📅 Horario: ${new Date().toLocaleString()}` }
        };
        await fetch(webhookUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ embeds: [embed] })
        });
        console.log("✅ Mensaje embed enviado a Discord");
    } catch (error) {
        console.error("❌ Error guardando ubicación o enviando embed:", error);
    }
}
window.guardarUbicacion = guardarUbicacion;