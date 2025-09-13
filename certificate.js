// Certificate page JavaScript
function loadCertificate() {
  const certData = JSON.parse(localStorage.getItem('certificateData') || '{}');
  if (!certData.id) {
    // No certificate data yet
    return;
  }

  const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
  set('certId', certData.id);
  set('certIssuedAt', new Date(certData.issuedAt).toLocaleString());
  set('certTarget', certData.target);
  set('certAlgorithm', certData.algorithm);
  set('certSize', certData.dataSize);
  set('certDuration', certData.duration);
  set('certHash', certData.hash);
  set('certSignature', certData.signature);
  set('certPublicKey', certData.publicKey);

  renderQRCode(JSON.stringify({
    id: certData.id,
    hash: certData.hash,
    sig: certData.signature
  }));
}

function renderQRCode(text) {
  // Tiny QR-like placeholder (not a full QR implementation). For full QR, later we can plug a library.
  const canvas = document.getElementById('qrCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const size = canvas.width;
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, size, size);
  ctx.fillStyle = '#111827';
  // Simple hash-based pattern
  const bytes = new TextEncoder().encode(text);
  let seed = 0;
  for (let i = 0; i < bytes.length; i++) seed = (seed * 31 + bytes[i]) >>> 0;
  const cells = 21;
  const cellSize = Math.floor(size / cells);
  for (let y = 0; y < cells; y++) {
    for (let x = 0; x < cells; x++) {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff;
      if ((seed & 3) === 0) {
        ctx.fillRect(x * cellSize, y * cellSize, cellSize - 1, cellSize - 1);
      }
    }
  }
}

function downloadPDF() {
  // Use browser print to save as PDF (works cross-platform). A dedicated PDF lib can be added later.
  window.print();
}

function copyShareLink() {
  const certData = localStorage.getItem('certificateData');
  if (!certData) return;
  const blob = new Blob([certData], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  navigator.clipboard.writeText(url).then(() => {
    // Optional: show toast
  });
}

document.addEventListener('DOMContentLoaded', () => {
  loadCertificate();
  const btnPdf = document.getElementById('downloadPdf');
  btnPdf?.addEventListener('click', downloadPDF);
  const btnLink = document.getElementById('copyLink');
  btnLink?.addEventListener('click', copyShareLink);
});

