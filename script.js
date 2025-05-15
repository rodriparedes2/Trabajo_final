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

// Llamar al iniciar pantalla de un juego
function showScreen(screenId) {
    gameScreens.forEach(screen => {
        screen.style.display = 'none';
    });
    const targetScreen = document.getElementById(screenId);
    targetScreen.style.display = 'block';
    mainMenu.style.display = 'none';

    if (screenId === 'graffiti-dodge') {
        startGame();
    } else if (screenId === 'buscaminas') {
        initBuscaminas();
        displayBestTimes();
    } else if (screenId === 'flappybird') {
        startFlappybird();
    }
}

/*#############################################################################################
-------------------------------------JUEGO DE BUSCAMINAS --------------------------------------
###############################################################################################*/

function startBuscaminas(rows = 10, cols = 10, mines = 10) {
    const container = document.getElementById('minesweeper');
    container.innerHTML = '';
    container.style.gridTemplateColumns = `repeat(${cols}, 30px)`;

    const grid = [];
    const minePositions = new Set();

    // Generar minas en posiciones aleatorias
    while (minePositions.size < mines) {
        minePositions.add(Math.floor(Math.random() * rows * cols));
    }

    // Crear celdas
    for (let i = 0; i < rows * cols; i++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        cell.dataset.index = i;
        container.appendChild(cell);
        grid.push(cell);

        cell.addEventListener('click', () => revealCell(i));
    }

    function revealCell(index) {
        const cell = grid[index];
        if (cell.classList.contains('revealed')) return;

        cell.classList.add('revealed');

        if (minePositions.has(index)) {
            cell.textContent = '💣';
            cell.classList.add('mine');
            alert('¡Boom! Perdiste.');
            revealAll();
        } else {
            const neighbors = getNeighbors(index);
            const mineCount = neighbors.filter(i => minePositions.has(i)).length;
            if (mineCount > 0) {
                cell.textContent = mineCount;
            } else {
                neighbors.forEach(revealCell);
            }
        }
    }

    function revealAll() {
        minePositions.forEach(index => {
            const cell = grid[index];
            cell.textContent = '💣';
            cell.classList.add('mine');
            cell.classList.add('revealed');
        });
    }

    function getNeighbors(index) {
        const res = [];
        const row = Math.floor(index / cols);
        const col = index % cols;

        for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
                if (dr === 0 && dc === 0) continue;
                const r = row + dr;
                const c = col + dc;
                if (r >= 0 && r < rows && c >= 0 && c < cols) {
                    res.push(r * cols + c);
                }
            }
        }
        return res;
    }
}

// VARIABLES:
const rows = 8;
const cols = 8;
const totalMines = 10;
let board = [];
let revealedCount = 0;
let gameOver = false;
// variables para el temporizador
let timerInterval;
let seconds = 0;
// variables para calcular los mejores tiempos
const MAX_BEST_TIMES = 5;
let bestTimes = JSON.parse(localStorage.getItem('bestTimes')) || []; // Cargar desde localStorage

function initBuscaminas() {
    document.getElementById("best-times-container").style.display = "none";
    const boardElement = document.getElementById("minesweeper-board");
    boardElement.innerHTML = "";
    boardElement.style.display = "grid";
    boardElement.style.gridTemplateColumns = `repeat(${cols}, 30px)`;
    boardElement.style.gap = "2px";

    board = [];
    revealedCount = 0;
    gameOver = false;
    document.getElementById("game-status").textContent = "";

    // Inicializar celdas
    for (let r = 0; r < rows; r++) {
        const row = [];
        for (let c = 0; c < cols; c++) {
            const cell = {
                hasMine: false,
                revealed: false,
                flagged: false,
                element: document.createElement("div"),
                row: r,
                col: c
            };

            cell.element.className = "cell";
            cell.element.addEventListener("click", () => revealCell(cell));
            cell.element.addEventListener("contextmenu", (e) => {
                e.preventDefault();
                toggleFlag(cell);
            });
            boardElement.appendChild(cell.element);
            row.push(cell);
        }
        board.push(row);
    }

    // Colocar minas aleatoriamente
    let placed = 0;
    while (placed < totalMines) {
        const r = Math.floor(Math.random() * rows);
        const c = Math.floor(Math.random() * cols);
        if (!board[r][c].hasMine) {
            board[r][c].hasMine = true;
            placed++;
        }
    }

    seconds = 0;
    updateTimerDisplay();
    startTimer();
}

function toggleFlag(cell) {
    if (cell.revealed || gameOver) return;
    cell.flagged = !cell.flagged;
    cell.element.textContent = cell.flagged ? "🚩" : "";
}

function revealCell(cell) {
    if (cell.revealed || cell.flagged || gameOver) return;

    cell.revealed = true;
    cell.element.classList.add("revealed");

    if (cell.hasMine) {
        cell.element.textContent = "💣";
        gameOver = true;
        document.getElementById("game-status").textContent = "💥 Perdiste.";
        revealAllMines();
        stopTimer();
        return;
    }

    revealedCount++;
    const minesAround = countMinesAround(cell.row, cell.col);
    if (minesAround > 0) {
        cell.element.textContent = minesAround;
    } else {
        getNeighbors(cell.row, cell.col).forEach(neigh => revealCell(neigh));
    }

    // Condición de victoria
    if (revealedCount === rows * cols - totalMines) {
        document.getElementById("game-status").textContent = "🎉 ¡Ganaste!";
        gameOver = true;
        stopTimer();
        updateBestTimes(seconds);
        displayBestTimes(seconds);
    }
}

function revealAllMines() {
    board.flat().forEach(cell => {
        if (cell.hasMine) {
            cell.element.textContent = "💣";
        }
    });
}

function countMinesAround(r, c) {
    return getNeighbors(r, c).filter(n => n.hasMine).length;
}

function getNeighbors(r, c) {
    const directions = [-1, 0, 1];
    const neighbors = [];

    directions.forEach(dr => {
        directions.forEach(dc => {
            if (dr === 0 && dc === 0) return;
            const nr = r + dr, nc = c + dc;
            if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
                neighbors.push(board[nr][nc]);
            }
        });
    });

    return neighbors;
}

function startTimer() {
    timerInterval = setInterval(() => {
    seconds++;
    updateTimerDisplay();
    }, 1000);
}
  
function stopTimer() {
    clearInterval(timerInterval);
}
   
function updateTimerDisplay() {
    document.getElementById('timer').textContent = `Tiempo: ${seconds} segundos`;
}

 
function updateBestTimes(time) {
    bestTimes.push(time);
    bestTimes.sort((a, b) => a - b); // Ordenar de menor a mayor
    if (bestTimes.length > MAX_BEST_TIMES) {
        bestTimes.pop(); // Eliminar el peor tiempo si hay más de 5
    }
    localStorage.setItem('bestTimes', JSON.stringify(bestTimes)); // Guardar en localStorage
    displayBestTimes();
}
 
function displayBestTimes(newTime = null) {
    const list = document.getElementById('best-times-list');
    const container = document.getElementById('best-times-container');
    list.innerHTML = '';
    container.style.display = 'block'; // Mostrar solo cuando se llama

    bestTimes.forEach((time, index) => {
        const li = document.createElement('li');
        li.textContent = `${time} segundos`;

        // Marcar como récord si es el nuevo y el mejor
        if (newTime !== null && time === newTime && index === 0) {
            li.classList.add('record');
        }

        list.appendChild(li);
    });
}

function toggleBestTimes() {
    const container = document.getElementById('best-times-container');
    if (container.style.display === 'none' || container.style.display === '') {
        displayBestTimes(); // Llenar la lista si está vacía
        container.style.display = 'block';
    } else {
        container.style.display = 'none';
    }
}

/*#############################################################################################
-------------------------------------JUEGO DEL PÁJARO SALTARÍN --------------------------------------
###############################################################################################*/

function startFlappybird() {
  const canvas = document.getElementById("flappy-canvas");
  const ctx = canvas.getContext("2d");

  let gravity = 1;
  let bird = { x: 50, y: 150, velocity: 0, width: 30, height: 30 };
  let pipes = [];
  let score = 0;
  let gameInterval;
  let gameOver = false;

  function resetGame() {
    bird.y = 150;
    bird.velocity = 0;
    pipes = [];
    score = 0;
    gameOver = false;
    clearInterval(gameInterval);
    gameInterval = setInterval(update, 20);
  }

  function drawBird() {
    ctx.fillStyle = "#FF0";
    ctx.fillRect(bird.x, bird.y, bird.width, bird.height);
  }

  function drawPipes() {
    ctx.fillStyle = "#0F0";
    pipes.forEach(pipe => {
      ctx.fillRect(pipe.x, 0, pipe.width, pipe.top);
      ctx.fillRect(pipe.x, canvas.height - pipe.bottom, pipe.width, pipe.bottom);
    });
  }

  function update() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    bird.velocity += gravity;
    bird.y += bird.velocity;

    if (bird.y < 0 || bird.y + bird.height > canvas.height) {
      endGame();
      return;
    }

      if (Math.random() < 0.02) {
          const gap = 160;
          const minPipeHeight = 50;
          const maxPipeHeight = canvas.height - gap - minPipeHeight;

          const topPipeHeight = Math.floor(Math.random() * (maxPipeHeight - minPipeHeight + 1)) + minPipeHeight;
          const bottomPipeHeight = canvas.height - topPipeHeight - gap;

          pipes.push({
              x: canvas.width,
              width: 40,
              top: topPipeHeight,
              bottom: bottomPipeHeight
          });
      }

    pipes.forEach(pipe => {
      pipe.x -= 2;

      // Colisión
      if (
        bird.x < pipe.x + pipe.width &&
        bird.x + bird.width > pipe.x &&
        (bird.y < pipe.top || bird.y + bird.height > canvas.height - pipe.bottom)
      ) {
        endGame();
      }

      // Puntaje
      if (pipe.x + pipe.width === bird.x) score++;
    });

    pipes = pipes.filter(pipe => pipe.x + pipe.width > 0);

    drawBird();
    drawPipes();
    ctx.fillStyle = "#FFF";
    ctx.font = "20px Arial";
    ctx.fillText(`Puntaje: ${score}`, 10, 20);
  }

  function endGame() {
    clearInterval(gameInterval);
    gameOver = true;
    document.getElementById("flappy-status").textContent = `💥 Perdiste. Puntaje final: ${score}`;
  }

  // Salto con clic o barra
  document.addEventListener("keydown", e => {
    if (e.code === "Space" && !gameOver) {
      bird.velocity = -10;
    }
  });

  document.getElementById("flappy-canvas").addEventListener("click", () => {
    if (!gameOver) {
      bird.velocity = -10;
    }
  });

  resetGame();
}