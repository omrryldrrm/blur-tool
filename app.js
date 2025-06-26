const uploadInput = document.getElementById('upload');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const downloadBtn = document.getElementById('download');
const blurRange = document.getElementById('blur');
const blurValue = document.getElementById('blurValue');

let image = new Image();
let isDragging = false;
let startX, startY;
let selWidth, selHeight;

blurRange.addEventListener('input', () => {
    blurValue.textContent = blurRange.value;
});

uploadInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
        image.onload = () => {
            canvas.width = image.width;
            canvas.height = image.height;
            ctx.drawImage(image, 0, 0);
            downloadBtn.disabled = false;
        };
        image.src = evt.target.result;
    };
    reader.readAsDataURL(file);
});

canvas.addEventListener('mousedown', (e) => {
    if (!image.src) return;
    isDragging = true;
    const rect = canvas.getBoundingClientRect();
    startX = e.clientX - rect.left;
    startY = e.clientY - rect.top;
});

canvas.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const rect = canvas.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;
    selWidth = currentX - startX;
    selHeight = currentY - startY;
    ctx.drawImage(image, 0, 0);
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 2;
    ctx.strokeRect(startX, startY, selWidth, selHeight);
});

canvas.addEventListener('mouseup', () => {
    if (!isDragging) return;
    isDragging = false;
    applyBlur();
});

function applyBlur() {
    if (selWidth === 0 || selHeight === 0) return;
    const sx = selWidth < 0 ? startX + selWidth : startX;
    const sy = selHeight < 0 ? startY + selHeight : startY;
    const sw = Math.abs(selWidth);
    const sh = Math.abs(selHeight);

    const off = document.createElement('canvas');
    off.width = sw;
    off.height = sh;
    const offCtx = off.getContext('2d');
    const amount = blurRange.value;
    offCtx.filter = `blur(${amount}px)`;
    offCtx.drawImage(image, sx, sy, sw, sh, 0, 0, sw, sh);

    ctx.drawImage(image, 0, 0);
    ctx.drawImage(off, sx, sy);
}

downloadBtn.addEventListener('click', () => {
    canvas.toBlob((blob) => {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'blurred.png';
        link.click();
        URL.revokeObjectURL(link.href);
    });
});
