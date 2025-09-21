function generarCodigoUnico() {
  const año = new Date().getFullYear();
  const letras = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const parteLetra = letras[Math.floor(Math.random() * letras.length)] + letras[Math.floor(Math.random() * letras.length)];
  const parteNum = Math.floor(100 + Math.random() * 900);
  return `GTG-${año}-${parteLetra}${parteNum}`;
}
function convertirABinario(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = function(e) {
      const arrayBuffer = e.target.result;
      let binary = '';
      const bytes = new Uint8Array(arrayBuffer);
      const chunkSize = 0x8000;
      for (let i = 0; i < bytes.length; i += chunkSize) {
        binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunkSize));
      }
      resolve(btoa(binary)); // Se guarda en base64 para no corromper datos
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}