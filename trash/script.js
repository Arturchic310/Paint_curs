const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth * 0.8;
canvas.height = window.innerHeight * 0.8;

let currentTool = 'pencil';
let drawing = false;
let startX, startY;
let canvasStates = [];
let maxStates = 20;

const colorPicker = document.getElementById('color-picker');
const downloadButton = document.getElementById('download');
const undoButton = document.getElementById('undo');
const clearButton = document.getElementById('clear');

ctx.strokeStyle = colorPicker.value;
ctx.fillStyle = colorPicker.value;

document.getElementById('numberSlider').value = 5;
document.getElementById('sliderValue').value = 5;
ctx.lineWidth = 5;

ctx.fillStyle = 'white';
ctx.fillRect(0, 0, canvas.width, canvas.height);


function updateSliderValue() {
    const slider = document.getElementById('numberSlider');
    const input = document.getElementById('sliderValue');
    input.value = slider.value;
    ctx.lineWidth = slider.value;
}

function updateInputValue() {
    const slider = document.getElementById('numberSlider');
    const input = document.getElementById('sliderValue');
    let value = input.value;
    ctx.lineWidth = value;

    if (value < 1) {
        value = 1;
    } else if (value > 100) {
        value = 100;
    }

    slider.value = value;
}

colorPicker.addEventListener('input', (e) => {
    ctx.strokeStyle = e.target.value;
    ctx.fillStyle = e.target.value;
});

downloadButton.addEventListener('click', download);
undoButton.addEventListener('click', restoreState);
clearButton.addEventListener('click', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    saveState();
});

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
    saveState();
});

canvas.addEventListener('mouseup', (e) => {
    if (!drawing) return;
    drawing = false;
    ctx.beginPath();
    
    switch (currentTool) {
        case 'line':
            drawStraightLine(startX, startY, e.offsetX, e.offsetY);
            break;
        case 'rectangle':
            drawRectangle(startX, startY, e.offsetX - startX, e.offsetY - startY);
            break;
        case 'circle':
            drawCircle(startX, startY, e.offsetX, e.offsetY);
            break;
        case 'fill':
            const targetColor = ctx.getImageData(e.offsetX, e.offsetY, 1, 1).data;
            const fillColor = parseColor(colorPicker.value);
            floodFill(e.offsetX, e.offsetY, fillColor);
            break;
        case 'eyedropper':
            console.log(colorPicker.value);
            let color = getPixelColor(ctx.getImageData(0, 0, canvas.width, canvas.height), e.offsetX, e.offsetY);
            colorPicker.value = rgbaToHex(color.r, color.g, color.b);
            ctx.strokeStyle = colorPicker.value;
            ctx.fillStyle = colorPicker.value;
            break;
    }

    ctx.closePath();
});

canvas.addEventListener('mousemove', (e) => {
    if (!drawing) return;
    switch (currentTool) {
        case 'pencil':
            ctx.lineWidth = 2;
            drawLine(e.offsetX, e.offsetY);
            ctx.lineWidth = document.getElementById('sliderValue').value;
            break;
        case 'brush':
            drawBrush(e.offsetX, e.offsetY);
            break;
        case 'eraser':
            erase(e.offsetX, e.offsetY);
            break;
    }
});

function drawLine(x, y) {
    ctx.lineCap = 'round';
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
}

function drawBrush(x, y) {
    ctx.lineCap = 'round';
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
}

function erase(x, y) {
    ctx.strokeStyle = 'white';
    ctx.lineCap = 'round';
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = colorPicker.value;
}

function drawStraightLine(x1, y1, x2, y2) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.closePath();
}

function drawRectangle(x, y, width, height) {
    ctx.rect(x, y, width, height);
    ctx.stroke();
}

function drawCircle(x1, y1, x2, y2) {
    let radius = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    ctx.arc(x1, y1, radius, 0, 2 * Math.PI);
    ctx.stroke();
}

function rgbaToHex(r, g, b) {
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

function getPixelColor(imageData, x, y) {
    const index = (y * imageData.width + x) * 4;
    const data = imageData.data;
    return {
        r: data[index],
        g: data[index + 1],
        b: data[index + 2],
        a: data[index + 3]
    };
}

function setPixelColor(imageData, x, y, color) {
    const index = (y * imageData.width + x) * 4;
    const data = imageData.data;
    data[index] = color.r;
    data[index + 1] = color.g;
    data[index + 2] = color.b;
    data[index + 3] = color.a;
}

function colorsMatch(c1, c2) {
    return c1.r === c2.r && c1.g === c2.g && c1.b === c2.b && c1.a === c2.a;
}

function floodFill(x, y, fillColor) {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const targetColor = getPixelColor(imageData, x, y);
    const stack = [{ x, y }];

    if (colorsMatch(targetColor, fillColor)) return;

    while (stack.length > 0) {
        const { x, y } = stack.pop();
        const currentColor = getPixelColor(imageData, x, y);

        if (!colorsMatch(currentColor, targetColor)) continue;

        setPixelColor(imageData, x, y, fillColor);

        if (x > 0) stack.push({ x: x - 1, y });
        if (x < imageData.width - 1) stack.push({ x: x + 1, y });
        if (y > 0) stack.push({ x, y: y - 1 });
        if (y < imageData.height - 1) stack.push({ x, y: y + 1 });
    }

    ctx.putImageData(imageData, 0, 0);
}

function parseColor(color) {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, 1, 1);
    const data = ctx.getImageData(0, 0, 1, 1).data;
    return {
        r: data[0],
        g: data[1],
        b: data[2],
        a: data[3]
    };
}

function saveState() {
    console.log(canvasStates.length);
    if (canvasStates.length >= maxStates) {
        canvasStates.shift();
    }
    canvasStates.push(canvas.toDataURL());
}

function restoreState() {
    if (canvasStates.length > 0) {
        let canvasPic = new Image();
        canvasPic.src = canvasStates.pop();
        canvasPic.onload = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(canvasPic, 0, 0);
        }
    }
}

function download() {
    console.log('download');
    const canvas = document.getElementById('canvas');
    const link = document.createElement('a');
    link.href = canvas.toDataURL('image/png');
    link.download = 'MYIMAGE.png';
    link.click();
}

document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'z') {
        restoreState();
    }
});
