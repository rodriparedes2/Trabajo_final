const mainMenu = document.getElementById('main-menu');
const gameScreens = document.querySelectorAll('.game-screen');
const menuOptions = document.querySelectorAll('.menu-option');

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

    if (screenId === 'buscaminas') {
        initBuscaminas();
        displayBestTimes();
    } else if (screenId === 'flappybird') {
        startFlappybird();
    } else if (screenId === 'Neon Dices'){
        startNeonDices();
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
let username = "Anónimo";

function initBuscaminas() {
    document.getElementById("best-time-input-container").style.display = "none";
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
        handleNewBestTime(seconds);
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

 
// Función para manejar un nuevo récord de Buscaminas
function handleNewBestTime(newTime) {
    // Muestra el input para el nombre
    const bestTimeInputContainer = document.getElementById('best-time-input-container');
    bestTimeInputContainer.style.display = 'block';

    const bestTimeNameInput = document.getElementById('best-time-name-input');
    bestTimeNameInput.value = localStorage.getItem('lastUsername') || "Anónimo"; // Sugiere el último nombre usado
    bestTimeNameInput.focus();

    // Guardar el tiempo y el nombre cuando el usuario haga clic en "Guardar Récord"
    const saveRecordBtn = document.getElementById('save-minesweeper-record-btn');
    saveRecordBtn.onclick = () => {
        const enteredName = bestTimeNameInput.value.trim();
        username = enteredName || "Anónimo"; // Usa el nombre ingresado o "Anónimo"
        localStorage.setItem('lastUsername', username); // Guarda el último nombre para futuras sugerencias

        // Actualiza los mejores tiempos con el nombre
        updateBestTimesInternal(newTime, username);

        bestTimeInputContainer.style.display = 'none'; // Oculta el input
        displayBestTimes(); // Actualiza la lista de récords para mostrar el nuevo
    };
}

// Función interna para actualizar los mejores tiempos
function updateBestTimesInternal(newTime, user) {
    let bestTimes = JSON.parse(localStorage.getItem('minesweeperBestTimes')) || []; 
    bestTimes.push({ time: newTime, user: user }); // Guarda el tiempo y el usuario
    bestTimes.sort((a, b) => a.time - b.time); // Ordena por tiempo

    if (bestTimes.length > MAX_BEST_TIMES) {
        bestTimes = bestTimes.slice(0, MAX_BEST_TIMES);
    }
    localStorage.setItem('minesweeperBestTimes', JSON.stringify(bestTimes)); // Guarda la lista actualizada
}
 
function displayBestTimes() {
    const bestTimes = JSON.parse(localStorage.getItem('minesweeperBestTimes')) || []; // Carga desde la clave específica
    const bestTimesList = document.getElementById('minesweeper-best-times-list');
    bestTimesList.innerHTML = ''; // Limpiar la lista

    if (bestTimes.length === 0) {
        bestTimesList.innerHTML = '<li>No hay récords aún.</li>';
    } else {
          bestTimes.forEach((record, index) => {
                const listItem = document.createElement('li');

                const rankAndName = document.createElement('span');
                rankAndName.textContent = `${index + 1}. ${record.user}`;

                const timeValue = document.createElement('span');
                timeValue.textContent = `${record.time} segundos`;

                listItem.appendChild(rankAndName);
                listItem.appendChild(timeValue); // Asegura que haya dos elementos hijos en el <li>

                if (index === 0) {
                    listItem.classList.add('record');
                }
                bestTimesList.appendChild(listItem);
            });
    }
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
-------------------------------------FLAPPY GRAFFITI--------------------------------------
###############################################################################################*/

function startFlappybird() {
  const canvas = document.getElementById("flappy-canvas");
  const ctx = canvas.getContext("2d");

  const gravity = 0.6;
  const jumpForce = -10;
  const pipeSpeed = 2;
  const pipeIntervalFrames = 120; 
  const gap = 140;
  const birdSize = 30;

  let bird = { x: 50, y: canvas.height / 2, velocity: 0, width: birdSize, height: birdSize };
  let pipes = [];
  let score = 0;
  let bestFlappyScore = parseInt(localStorage.getItem('bestFlappyScore')) || 0;
  let frameCount = 0;
  let gameOver = false;
  let animationFrameId;

  function resetGame() {
    bird.y = canvas.height / 2;
    bird.velocity = 0;
    pipes = [];
    score = 0;
    frameCount = 0;
    gameOver = false;
    loop();
  }

    function drawBird() {
        ctx.fillStyle = "#00FFFF"; // celeste neón
        ctx.shadowBlur = 0;
        ctx.shadowColor = "#00FFFF";
        ctx.fillRect(bird.x, bird.y, bird.width, bird.height);
        ctx.shadowBlur = 0;
    }

  function drawPipes() {
      ctx.fillStyle = "#00FFFF"; // celeste neón
      ctx.shadowBlur = 5;
      ctx.shadowColor = "#00FFFF";

      pipes.forEach(pipe => {
          ctx.fillRect(pipe.x, 0, pipe.width, pipe.top); // tubo superior
          ctx.fillRect(pipe.x, canvas.height - pipe.bottom, pipe.width, pipe.bottom); // tubo inferior
      });

      ctx.shadowBlur = 0;
  }

function drawScore() {
    // Guarda el estado actual del canvas
    ctx.save();

    ctx.font = "25px 'Courier New'";

    ctx.strokeStyle = "black"; // Color del contorno: negro
    ctx.lineWidth = 2; 

    // Configuración para el texto principal
    ctx.fillStyle = "#FFFF00"; 
    ctx.shadowBlur = 10;
    ctx.shadowColor = "black"; 

    ctx.strokeText(`Puntaje: ${score}`, 10, 30);
    ctx.fillText(`Puntaje: ${score}`, 10, 30);
    ctx.strokeText(`🏆 Récord: ${bestFlappyScore}`, 10, 60);
    ctx.fillText(`🏆 Récord: ${bestFlappyScore}`, 10, 60);

    // Restaura el estado del canvas para que otros dibujos no se vean afectados
    ctx.shadowBlur = 0; // Resetea la sombra para el resto de dibujos
    ctx.restore();
}

  function update() {
    if (gameOver) return;

    frameCount++;
    bird.velocity += gravity;
    bird.y += bird.velocity;

    if (frameCount % pipeIntervalFrames === 0) {
      const minPipeHeight = 40;
      const maxPipeHeight = canvas.height - gap - minPipeHeight;
      const topPipeHeight = Math.floor(Math.random() * (maxPipeHeight - minPipeHeight + 1)) + minPipeHeight;
      const bottomPipeHeight = canvas.height - topPipeHeight - gap;

      pipes.push({
        x: canvas.width,
        width: 40,
        top: topPipeHeight,
        bottom: bottomPipeHeight,
        scored: false
      });
    }

    pipes.forEach(pipe => {
      pipe.x -= pipeSpeed;

      if (
        bird.x < pipe.x + pipe.width &&
        bird.x + bird.width > pipe.x &&
        (bird.y < pipe.top || bird.y + bird.height > canvas.height - pipe.bottom)
      ) {
        endGame();
      }

      if (!pipe.scored && pipe.x + pipe.width < bird.x) {
        score++;
        pipe.scored = true;
      }
    });

    pipes = pipes.filter(pipe => pipe.x + pipe.width > 0);

    if (bird.y < 0 || bird.y + bird.height > canvas.height) {
      endGame();
    }
  }

  function draw() {
    ctx.fillStyle = "#000000"; // fondo negro
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawBird();
    drawPipes();
    drawScore();
  }

  function loop() {
    update();
    draw();
    if (!gameOver) {
      animationFrameId = requestAnimationFrame(loop);
    }
  }

  function endGame() {
    gameOver = true;
    cancelAnimationFrame(animationFrameId);

    if (score > bestFlappyScore) {
      bestFlappyScore = score;
      localStorage.setItem('bestFlappyScore', bestFlappyScore);
    }

    ctx.fillStyle = "#FF00FF"; // fucsia
    ctx.font = "22px 'Courier New'";
    ctx.shadowBlur = 10;
    ctx.shadowColor = "#FF00FF";
    ctx.fillText(`💥 Perdiste. Puntaje final: ${score}`, 30, canvas.height / 2);
    ctx.fillText(`🏆 Récord: ${bestFlappyScore}`, 30, canvas.height / 2 + 40);
    ctx.shadowBlur = 0;
  }

  document.addEventListener("keydown", e => {
    if (e.code === "Space" && !gameOver) {
      bird.velocity = jumpForce;
    }
  });

  canvas.addEventListener("click", () => {
    if (!gameOver) {
      bird.velocity = jumpForce;
    }
  });

  resetGame();
}

/*#############################################################################################
-------------------------------------------Neon Dices--------------------------------------
###############################################################################################*/


let diceValues = [0, 0, 0, 0, 0];
let frozen = [false, false, false, false, false];
let rollCount = 0;
let turnEnded = false;

function rollDice() {
    if (rollCount >= 3 || turnEnded) {
        alert("¡Debes elegir una casilla antes de continuar!");
        return;
    }

    const diceElements = [1, 2, 3, 4, 5].map(i => document.getElementById(`d${i}`));

    diceElements.forEach((el, index) => {
        if (frozen[index]) return;

        let count = 0;
        const interval = setInterval(() => {
            const temp = Math.floor(Math.random() * 6) + 1;
            el.textContent = temp;
            count++;
            if (count > 10) {
                clearInterval(interval);
                const finalValue = Math.floor(Math.random() * 6) + 1;
                el.textContent = finalValue;
                diceValues[index] = finalValue;
            }
        }, 50);
    });

    rollCount++;
    if (rollCount === 3) {
        alert("Último tiro. Debes elegir una casilla.");
    }
}

function toggleFreeze(index) {
    frozen[index] = !frozen[index];
    const el = document.getElementById(`d${index + 1}`);
    if (frozen[index]) {
        el.style.backgroundColor = "#ccfaff"; // color hielo
        el.style.color = "#000"; // texto negro
        el.style.boxShadow = "0 0 15px #99eeff";
    } else {
        el.style.backgroundColor = "#111";
        el.style.color = "#0ff";
        el.style.boxShadow = "0 0 10px #0ff";
    }
}

// Agregar listeners para congelar dados
[0, 1, 2, 3, 4].forEach(i => {
    document.getElementById(`d${i + 1}`).addEventListener("click", () => toggleFreeze(i));
});

// Permitir hacer clic en una casilla de puntuación
document.querySelectorAll("#neon-dice-score td:nth-child(2)").forEach(td => {
    td.addEventListener("click", () => {
        if (turnEnded) return;

        if (td.textContent !== "") {
            alert("Esta casilla ya está usada.");
            return;
        }

        const score = calculateScore(td.previousSibling.textContent.trim());
        td.textContent = score;
        turnEnded = true;
        resetTurn();
    });
});

function resetTurn() {
    diceValues = [0, 0, 0, 0, 0];
    frozen = [false, false, false, false, false];
    rollCount = 0;
    turnEnded = false;

    [1, 2, 3, 4, 5].forEach(i => {
        const el = document.getElementById(`d${i}`);
        el.textContent = "?";
        el.style.backgroundColor = "#111";
        el.style.color = "#0ff";
        el.style.boxShadow = "0 0 10px #0ff";
    });
}

// Calcula la puntuación según la categoría elegida
function calculateScore(category) {
    const counts = [0, 0, 0, 0, 0, 0];
    diceValues.forEach(val => counts[val - 1]++);

    switch (category.toLowerCase()) {
        case "unos": return counts[0] * 1;
        case "doses": return counts[1] * 2;
        case "treses": return counts[2] * 3;
        case "cuatros": return counts[3] * 4;
        case "cincos": return counts[4] * 5;
        case "seis": return counts[5] * 6;
        case "escalera": return isStraight() ? 25 : 0;
        case "full": return counts.includes(3) && counts.includes(2) ? 30 : 0;
        case "póker": return counts.includes(4) ? 40 : 0;
        case "neon dice": return counts.includes(5) ? 50 : 0;
        case "doble neon dice": return counts.includes(5) ? 100 : 0;
        case "total": return diceValues.reduce((a, b) => a + b, 0);
        default: return 0;
    }
}

function isStraight() {
    const sorted = [...new Set(diceValues)].sort((a, b) => a - b);
    const straights = [
        [1, 2, 3, 4, 5],
        [2, 3, 4, 5, 6]
    ];
    return straights.some(seq => seq.every((val, i) => val === sorted[i]));
}
