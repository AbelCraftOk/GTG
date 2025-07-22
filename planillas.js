// Recuerden siempre colocar la coma al final de cada línea de código.
const planillas = [
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",
    "9876543210zyxwvutsrqponmlkjihgfedcbaZYXWVUTSRQPONMLKJIHGFEDCBA",
]

function generarCodigoUnico() {
    const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let codigo;
    do {
        const longitud = Math.floor(Math.random() * 4) + 5; // 5 a 8 caracteres
        codigo = '';
        for (let i = 0; i < longitud; i++) {
            codigo += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
        }
    } while (planillas.includes(codigo));
    return `${codigo}`;
}

// Ejemplo de uso:
const codigoPlanilla = generarCodigoUnico();
console.log(codigoPlanilla);