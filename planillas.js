// Recuerden siempre colocar la coma al final de cada línea de código.
const planillas = [
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",
    "9876543210zyxwvutsrqponmlkjihgfedcbaZYXWVUTSRQPONMLKJIHGFEDCBA",
]

function obtenerWebhookDescifrado() {
    const enlaceCodificado = "aHR0cHM6Ly9kaXNjb3JkLmNvbS9hcGkvd2ViaG9va3MvMTIzNDU2Nzg5MDEyMzQ1Njc4OS9BQUJCQ0NDZGZoZ0hZSlpY";
    const enlaceDecodificado = atob(enlaceCodificado);
    return enlaceDecodificado;
}
