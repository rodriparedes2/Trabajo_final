const mainMenu = document.getElementById('main-menu');
const gameScreens = document.querySelectorAll('.game-screen');
const menuOptions = document.querySelectorAll('.menu-option');

// Función para mostrar una pantalla y ocultar las demás
function showScreen(screenId) {
    gameScreens.forEach(screen => {
        screen.style.display = 'none';
    });
    const targetScreen = document.getElementById(screenId);
    targetScreen.style.display = 'block';

    if (screenId === 'graffiti-dodge') {
        startGame(); // Iniciar juego al mostrar la pantalla
    }
}

// Función para mostrar el menú principal
function showMenu() {
    gameScreens.forEach(screen => {
        screen.style.display = 'none';
    });
    mainMenu.style.display = 'block';
}

// Event listeners para las opciones del menú
menuOptions.forEach(option => {
    option.addEventListener('click', () => {
        const target = option.getAttribute('data-target');
        showScreen(target);
    });
});

// Mostrar el menú principal al cargar la página
showMenu();


// ===============================
// Código del juego Graffiti-Dodge
// ===============================
let canvas, ctx;
let x, y;
let left = false;
let right = false;

// Iniciar variables del juego
function initGraffitiDodge() {
    canvas = document.getElementById('dodgeCanvas');
    ctx = canvas.getContext('2d');
    x = 140;
    y = 450;
    left = false;
    right = false;
}

// Dibujar jugador
function drawPlayer() {
    ctx.fillStyle = '#0ff';
    ctx.fillRect(x, y, 20, 20);
}

// Limpiar pantalla
function clearCanvas() {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// Bucle principal
function gameLoop() {
    clearCanvas();
    drawPlayer();

    if (left && x > 0) x -= 4;
    if (right && x < canvas.width - 20) x += 4;

    requestAnimationFrame(gameLoop);
}

// Inicia el juego desde cero
function startGame() {
    initGraffitiDodge();
    gameLoop();
}

// Controles de teclado
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') left = true;
    if (e.key === 'ArrowRight') right = true;
});
document.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowLeft') left = false;
    if (e.key === 'ArrowRight') right = false;
});
