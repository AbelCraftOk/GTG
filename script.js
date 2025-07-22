let vueltas = [];
let ramalSeleccionado = "";
let internoSeleccionado = "";
let todasLasPlanillas = [];
const WEBHOOK_URL = 'https://discord.com/api/webhooks/1391181498224345148/ojCF0tPvvfSv2qNTxJQwu_dm1N1Wge2bTKtd6ck73JPmBKEq_djqS04vn5U_Fke565Zn';
const codigoPlanilla = generarCodigoUnico();

function guardarPlanilla() {
    const chofer = document.getElementById('chofer').value.trim();
    const planillasCount = document.getElementById('planillas').value.trim();

    if (!ramalSeleccionado || !internoSeleccionado || !chofer || !planillasCount || vueltas.length === 0) {
        alert("Por favor, complete todos los datos (Chofer, Ramal, Interno, Planillas y cargue al menos una vuelta) antes de guardar.");
        return;
    }
    const nuevaPlanilla = {
        id: Date.now(), // Un ID único para la planilla
        chofer: chofer,
        ramal: ramalSeleccionado,
        interno: internoSeleccionado,
        planillasCount: planillasCount,
        vueltas: [...vueltas], // Copia las vueltas actuales
        estado: 'pendiente', // Estado inicial
        timestamp: new Date().toLocaleString(), // Para saber cuándo se guardó
        text: `Codigo de Planilla: ` + codigoPlanilla // Genera un código único para la planilla
    };

    todasLasPlanillas.push(nuevaPlanilla);
    localStorage.setItem('todasLasPlanillas', JSON.stringify(todasLasPlanillas)); // Guarda en localStorage
    alert("Planilla guardada exitosamente. Codigo de planilla: " + codigoPlanilla);

    limpiarCampos() // Limpia los campos después de guardar la planilla.
    abrirMenuCapturas(); // Le avisa al usaurio que tiene que enviar las capturas.
}

// Función para limpiar todos los campos
function limpiarCampos() {
    vueltas = [];
    ramalSeleccionado = "";
    document.getElementById('boton-ramal').textContent = "Indicar Ramal";
    internoSeleccionado = "";
    document.getElementById('boton-interno').textContent = "Indicar Interno";
    document.getElementById('planillas').value = "";
    actualizarBotonVueltas();
    document.getElementById('resumen-vueltas').innerHTML = ""; // Limpia el resumen del panel privado
}

// Función para actualizar el texto del botón del footer con la cantidad de vueltas
function actualizarBotonVueltas() {
    const boton = document.getElementById('boton-vueltas-footer');
    const vueltasValidas = vueltas.filter(v => !v.invalidada);
    boton.textContent = `${vueltasValidas.length}/3`; // Considera solo vueltas válidas
    boton.disabled = vueltasValidas.length === 0;
}

// Función para establecer la hora actual en un campo de input
function horaActual(id) {
    const ahora = new Date();
    const horas = ahora.getHours().toString().padStart(2, '0');
    const minutos = ahora.getMinutes().toString().padStart(2, '0');
    document.getElementById(id).value = `${horas}:${minutos}`;
}
async function aceptarPlanilla(id) {
    const planillaIndex = todasLasPlanillas.findIndex(p => p.id === id);
    if (planillaIndex !== -1) {
        const planilla = todasLasPlanillas[planillaIndex]; // Obtenemos el objeto planilla
        planilla.estado = 'aceptada';
        localStorage.setItem('todasLasPlanillas', JSON.stringify(todasLasPlanillas));

        // Construir la lista de vueltas para la descripción del embed
        const vueltasDescription = planilla.vueltas.map((v, i) => {
            const estadoVuelta = v.invalidada ? '(Invalidada)' : '';
            return `**Vuelta ${i + 1}:** Ida: ${v.ida} - Vuelta: ${v.vuelta} ${estadoVuelta}`;
        }).join('\n');

        // Construir el mensaje específico para "Aceptado"
        const embed = {
            title: "✅ Planilla Aceptada",
            description: `
**Chofer:** ${planilla.chofer}
**Interno:** ${planilla.interno}
**Línea:** ${planilla.ramal}
**Cantidad de Planillas Físicas:** ${planilla.planillasCount}
---
**Vueltas Cargadas:**
${vueltasDescription}
            `, // Usamos template literals para formato multilinea
            color: 3066993, // Un color verde (decimal para #2ecc71)
            footer: {
                text: `Codigo de Planilla: ${codigoPlanilla} | ${planilla.timestamp}`
            }
        };

        try {
            const response = await fetch(WEBHOOK_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    embeds: [embed]
                }),
            });

            if (response.ok) {
                alert('Planilla aceptada y notificada en Discord.');
            } else {
                alert('Planilla aceptada, pero hubo un error al notificar a Discord.');
                console.error('Error al enviar webhook de aceptado:', response.status, await response.text());
            }
        } catch (error) {
            alert('Planilla aceptada, pero no se pudo conectar con el servidor de Discord.');
            console.error('Error de red al enviar webhook de aceptado:', error);
        }

        verResumenVueltas();
    }
}

async function denegarPlanilla(id) {
    const planillaIndex = todasLasPlanillas.findIndex(p => p.id === id);
    if (planillaIndex !== -1) {
        const planilla = todasLasPlanillas[planillaIndex]; // Obtenemos el objeto planilla
        planilla.estado = 'denegada';
        localStorage.setItem('todasLasPlanillas', JSON.stringify(todasLasPlanillas));

        // Construir la lista de vueltas para la descripción del embed
        const vueltasDescription = planilla.vueltas.map((v, i) => {
            const estadoVuelta = v.invalidada ? '(Invalidada)' : '';
            return `**Vuelta ${i + 1}:** Ida: ${v.ida} - Vuelta: ${v.vuelta} ${estadoVuelta}`;
        }).join('\n');

        // Construir el mensaje específico para "Denegado"
        const embed = {
            title: "❌ Planilla Denegada",
            description: `
**Chofer:** ${planilla.chofer}
**Interno:** ${planilla.interno}
**Línea:** ${planilla.ramal}
**Cantidad de Planillas Físicas:** ${planilla.planillasCount}
---
**Vueltas Cargadas:**
${vueltasDescription}
            `, // Usamos template literals para formato multilinea
            color: 15158332, // Un color rojo (decimal para #e74c3c)
            footer: {
                text: `Codigo de Planilla: ${codigoPlanilla} | ${planilla.timestamp}`
            }
        };

        try {
            const response = await fetch(WEBHOOK_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    embeds: [embed]
                }),
            });

            if (response.ok) {
                alert('Planilla denegada y notificada en Discord.');
            } else {
                alert('Planilla denegada, pero hubo un error al notificar a Discord.');
                console.error('Error al enviar webhook de denegado:', response.status, await response.text());
            }
        } catch (error) {
            alert('Planilla denegada, pero no se pudo conectar con el servidor de Discord.');
            console.error('Error de red al enviar webhook de denegado:', error);
        }

        verResumenVueltas();
    }
}

// Función para ver el resumen de todas las planillas (con clave)
function verResumenVueltas() {
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

function abrirPanel() {
    document.getElementById('panel').style.display = 'block';
}
function cerrarPanel() {
    document.getElementById('panel').style.display = 'none';
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
    actualizarBotonVueltas();
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

function mostrarPestania(id) {
    const pestañas = ['login', 'inicio', 'inspectores'];
    pestañas.forEach(pid => {
        const el = document.getElementById(pid);
        if (el) el.style.display = (pid === id) ? 'block' : 'none';
    });
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