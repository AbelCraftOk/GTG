let vueltas = [];
let ramalSeleccionado = "";
let internoSeleccionado = "";
let todasLasPlanillas = [];
const WEBHOOK_URL = 'https://discord.com/api/webhooks/1391181498224345148/ojCF0tPvvfSv2qNTxJQwu_dm1N1Wge2bTKtd6ck73JPmBKEq_djqS04vn5U_Fke565Zn';

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
        timestamp: new Date().toLocaleString() // Para saber cuándo se guardó
    };

    
    const codigoPlanilla = generarCodigoUnico();

    todasLasPlanillas.push(nuevaPlanilla);
    localStorage.setItem('todasLasPlanillas', JSON.stringify(todasLasPlanillas)); // Guarda en localStorage
    alert("Planilla guardada exitosamente. Codigo de planilla: " + codigoPlanilla);

    limpiarCampos(); // Limpia los campos después de guardar la planilla.
    abrirMenuCapturas(); // Le avisa al usaurio que tiene que enviar las capturas.
}

// Función para limpiar todos los campos
function limpiarCampos() {
    vueltas = [];
    ramalSeleccionado = "";
    document.getElementById('boton-ramal').textContent = "Indicar Ramal";
    internoSeleccionado = "";
    document.getElementById('boton-interno').textContent = "Indicar Interno";
    document.getElementById('chofer').value = "";
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
                text: `ID de Planilla: ${planilla.id} | ${planilla.timestamp}`
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
                text: `ID de Planilla: ${planilla.id} | ${planilla.timestamp}`
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
    const clave = prompt("Ingrese la clave para ver el menú privado:");
    if (clave !== "InspectoresGTG") {
        alert("Clave incorrecta.");
        return;
    }

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

// Cargar planillas desde localStorage al iniciar la aplicación
document.addEventListener('DOMContentLoaded', () => {
    const storedPlanillas = localStorage.getItem('todasLasPlanillas');
    if (storedPlanillas) {
        todasLasPlanillas = JSON.parse(storedPlanillas);
    }
    actualizarBotonVueltas(); // Asegura que el botón del footer muestre el estado correcto al cargar
});

// --- Lógica para el Modo Oscuro/Claro ---

document.addEventListener('DOMContentLoaded', () => {
    const themeToggleBtn = document.getElementById('theme-toggle');
    const body = document.body;

    // Función para actualizar el texto del botón según el modo actual
    function actualizarTextoBoton() {
        if (!body.classList.contains('light-mode')) {
            themeToggleBtn.innerHTML = '🌙 Noche';
        } else {
            themeToggleBtn.innerHTML = '☀️ Día';
        }
    }

    // Comprueba el tema guardado o la preferencia del sistema al cargar
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light-mode') {
        body.classList.add('light-mode');
    } else if (savedTheme === 'dark-mode') {
        body.classList.remove('light-mode');
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
        body.classList.add('light-mode');
    } else {
        body.classList.remove('light-mode');
    }

    actualizarTextoBoton(); // Llamada inicial para establecer el texto correcto al cargar la página

    // Event listener para el botón de cambio de tema
    themeToggleBtn.addEventListener('click', () => {
        body.classList.toggle('light-mode');
        actualizarTextoBoton();

        if (body.classList.contains('light-mode')) {
            localStorage.setItem('theme', 'light-mode');
        } else {
            localStorage.setItem('theme', 'dark-mode');
        }
    });
});