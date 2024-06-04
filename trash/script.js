const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth * 0.8;
canvas.height = window.innerHeight * 0.8;

let currentTool = 'pencil';
let drawing = false;
let startX, startY;

const tools = document.querySelectorAll('.tool');
tools.forEach(tool => {
    tool.addEventListener('click', () => {
        currentTool = tool.id;
    });
});

canvas.addEventListener('mousedown', (e) => {
    drawing = true;
    startX = e.offsetX;
    startY = e.offsetY;
});

canvas.addEventListener('mouseup', () => {
    drawing = false;
    ctx.beginPath();
});

canvas.addEventListener('mousemove', (e) => {
    if (!drawing) return;
    switch (currentTool) {
        case 'pencil':
            drawLine(e.offsetX, e.offsetY);
            break;
        case 'brush':
            drawBrush(e.offsetX, e.offsetY);
            break;
        case 'eraser':
            erase(e.offsetX, e.offsetY);
            break;
        case 'line':
            drawStraightLine(startX, startY, e.offsetX, e.offsetY);
            break;
        case 'rectangle':
            drawRectangle(startX, startY, e.offsetX - startX, e.offsetY - startY);
            break;
        case 'circle':
            drawCircle(startX, startY, e.offsetX, e.offsetY);
            break;
    }
});

function drawLine(x, y) {
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
}

function drawBrush(x, y) {
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
}

function erase(x, y) {
    ctx.clearRect(x, y, 10, 10);
}

function drawStraightLine(x1, y1, x2, y2) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.beginPath();
}

function drawRectangle(x, y, width, height) {
    ctx.beginPath();
    ctx.rect(x, y, width, height);
    ctx.stroke();
}

function drawCircle(x1, y1, x2, y2) {
    ctx.beginPath();
    let radius = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    ctx.arc(x1, y1, radius, 0, 2 * Math.PI);
    ctx.stroke();
}
