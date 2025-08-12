const canvas = document.getElementById('board');
const ctx = canvas.getContext('2d');
const ROWS = 20;
const COLS = 12;
const BLOCK_SIZE = 20;

const COLORS = [
  null,
  'cyan',    // I
  'blue',    // J
  'orange',  // L
  'yellow',  // O
  'green',   // S
  'purple',  // T
  'red'      // Z
];

// Tetromino shapes
const SHAPES = [
  [],
  [[1,1,1,1]],         // I
  [[2,0,0],[2,2,2]],   // J
  [[0,0,3],[3,3,3]],   // L
  [[4,4],[4,4]],       // O
  [[0,5,5],[5,5,0]],   // S
  [[0,6,0],[6,6,6]],   // T
  [[7,7,0],[0,7,7]]    // Z
];

// Create empty matrix for the board
function createMatrix(w, h) {
  const matrix = [];
  while (h--) {
    matrix.push(new Array(w).fill(0));
  }
  return matrix;
}

// Draw a single block
function drawBlock(x, y, colorIndex) {
  ctx.fillStyle = COLORS[colorIndex];
  ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
  ctx.strokeStyle = '#222';
  ctx.lineWidth = 2;
  ctx.strokeRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE, BLOCK_SIZE);
}

// Draw the whole board
function drawMatrix(matrix, offset) {
  matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        drawBlock(x + offset.x, y + offset.y, value);
      }
    });
  });
}

// Check collision with board edges or filled cells
function collides(board, piece) {
  const [matrix, offset] = piece;
  for (let y = 0; y < matrix.length; y++) {
    for (let x = 0; x < matrix[y].length; x++) {
      if (matrix[y][x] !== 0 &&
         (board[y + offset.y] && board[y + offset.y][x + offset.x]) !== 0) {
        return true;
      }
    }
  }
  return false;
}

// Merge piece into board
function merge(board, piece) {
  const [matrix, offset] = piece;
  matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        board[y + offset.y][x + offset.x] = value;
      }
    });
  });
}

// Clear full lines
function clearLines() {
  let rowCount = 1;
  outer: for (let y = board.length - 1; y >= 0; y--) {
    for (let x = 0; x < board[y].length; x++) {
      if (board[y][x] === 0) {
        continue outer;
      }
    }
    const row = board.splice(y, 1)[0].fill(0);
    board.unshift(row);
    y++;
    // Could add scoring here using rowCount multiplier
    rowCount *= 2;
  }
}

// Rotate matrix clockwise
function rotate(matrix) {
  const rows = matrix.length;
  const cols = matrix[0].length;
  const result = [];
  for (let x = 0; x < cols; x++) {
    result[x] = [];
    for (let y = rows - 1; y >= 0; y--) {
      result[x][rows - 1 - y] = matrix[y][x] || 0;
    }
  }
  return result;
}

let board;
let currentPiece;
let dropCounter = 0;
let dropInterval = 1000;
let lastTime = 0;
let dropFast = false;
let animationFrameId = null;
let isPaused = false;

// Initialize or reset the game
function initGame() {
  board = createMatrix(COLS, ROWS);
  currentPiece = createPiece();
  dropCounter = 0;
  lastTime = 0;
  draw();
}

// Create random piece with starting position
function createPiece() {
  const typeId = (Math.floor(Math.random() * (SHAPES.length - 1)) + 1);
  const matrix = SHAPES[typeId].map(row => row.slice());
  return { matrix, pos: { x: Math.floor(COLS / 2) - Math.ceil(matrix[0].length / 2), y: 0 } };
}

// Draw everything
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawMatrix(board, { x:0, y:0 });
  drawMatrix(currentPiece.matrix, currentPiece.pos);
}

// Drop the piece by one row
function drop() {
  currentPiece.pos.y++;
  if (collides(board, [currentPiece.matrix, currentPiece.pos])) {
    currentPiece.pos.y--;
    merge(board, [currentPiece.matrix, currentPiece.pos]);
    clearLines();
    currentPiece = createPiece();
    if (collides(board, [currentPiece.matrix, currentPiece.pos])) {
      alert("Game Over! Resetting...");
      initGame();
    }
  }
  dropCounter = 0;
}

// Move piece left or right
function move(dir) {
  currentPiece.pos.x += dir;
  if (collides(board, [currentPiece.matrix, currentPiece.pos])) {
    currentPiece.pos.x -= dir;
  }
}

// Rotate piece with collision check and wall kicks
function rotatePiece() {
  const rotated = rotate(currentPiece.matrix);
  const posX = currentPiece.pos.x;
  let offset = 1;
  currentPiece.matrix = rotated;

  while (collides(board, [currentPiece.matrix, currentPiece.pos])) {
    currentPiece.pos.x += offset;
    offset = -(offset + (offset > 0 ? 1 : -1));
    if (offset > currentPiece.matrix[0].length) {
      // rotate back ccw (3 clockwise rotations)
      currentPiece.matrix = rotate(rotate(rotate(currentPiece.matrix)));
      currentPiece.pos.x = posX;
      return;
    }
  }
}

// Game loop
function update(time = 0) {
  if (isPaused) return;

  const deltaTime = time - lastTime;
  lastTime = time;

  dropCounter += deltaTime;

  const interval = dropFast ? 50 : dropInterval;

  if (dropCounter > interval) {
    drop();
  }

  draw();
  animationFrameId = requestAnimationFrame(update);
}

function pauseGame() {
  isPaused = true;
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
}

function resumeGame() {
  if (!isPaused) return;
  isPaused = false;
  lastTime = 0;
  dropCounter = 0;
  update();
}

document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    pauseGame();
  } else {
    resumeGame();
  }
});

window.addEventListener('blur', pauseGame);
window.addEventListener('focus', resumeGame);

document.addEventListener('keydown', event => {
  if (event.repeat) return;
  if (event.key === 'ArrowLeft') {
    move(-1);
  } else if (event.key === 'ArrowRight') {
    move(1);
  } else if (event.key === 'ArrowDown') {
    dropFast = true;
  } else if (event.key === 'ArrowUp') {
    rotatePiece();
  }
});

document.addEventListener('keyup', event => {
  if (event.key === 'ArrowDown') {
    dropFast = false;
  }
});

document.getElementById('startBtn').addEventListener('click', () => {
  initGame();
  update();
});

document.getElementById('resetBtn').addEventListener('click', () => {
  initGame();
});




