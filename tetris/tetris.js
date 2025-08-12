const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');
context.scale(30, 30); // 30px per block

const nextCanvas = document.getElementById('next-piece');
const nextContext = nextCanvas.getContext('2d');
nextContext.scale(20, 20); // Smaller scale for preview

const COLS = 10, ROWS = 20;
let arena = createMatrix(COLS, ROWS);

let score = 0;
document.getElementById('score').innerText = score;

const colors = [
  null,
  '#FF0D72',
  '#0DC2FF',
  '#0DFF72',
  '#F538FF',
  '#FF8E0D',
  '#FFE138',
  '#3877FF'
];

function createMatrix(w, h) {
  const matrix = [];
  while (h--) {
    matrix.push(new Array(w).fill(0));
  }
  return matrix;
}

function createPiece(type) {
  if (type === 'T') return [[0,1,0],[1,1,1],[0,0,0]];
  if (type === 'O') return [[2,2],[2,2]];
  if (type === 'L') return [[0,3,0],[0,3,0],[0,3,3]];
  if (type === 'J') return [[0,4,0],[0,4,0],[4,4,0]];
  if (type === 'I') return [[0,5,0,0],[0,5,0,0],[0,5,0,0],[0,5,0,0]];
  if (type === 'S') return [[0,6,6],[6,6,0],[0,0,0]];
  if (type === 'Z') return [[7,7,0],[0,7,7],[0,0,0]];
}

function drawMatrix(matrix, offset, ctx = context) {
  matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        ctx.fillStyle = colors[value];
        ctx.fillRect(x + offset.x, y + offset.y, 1, 1);
      }
    });
  });
}

function merge(arena, player) {
  player.matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value !== 0) {
        arena[y + player.pos.y][x + player.pos.x] = value;
      }
    });
  });
}

function collide(arena, player) {
  const m = player.matrix;
  const o = player.pos;
  for (let y = 0; y < m.length; ++y) {
    for (let x = 0; x < m[y].length; ++x) {
      if (m[y][x] !== 0 &&
          (arena[y + o.y] &&
           arena[y + o.y][x + o.x]) !== 0) {
        return true;
      }
    }
  }
  return false;
}

function arenaSweep() {
  let rowCount = 1;
  for (let y = arena.length - 1; y >= 0; --y) {
    if (arena[y].every(value => value !== 0)) {
      const row = arena.splice(y, 1)[0].fill(0);
      arena.unshift(row);
      ++y;
      score += rowCount * 10;
      rowCount *= 2;
    }
  }
  document.getElementById('score').innerText = score;
}

function playerDrop() {
  player.pos.y++;
  if (collide(arena, player)) {
    player.pos.y--;
    merge(arena, player);
    playerReset();
    arenaSweep();
  }
  dropCounter = 0;
}

function playerMove(dir) {
  player.pos.x += dir;
  if (collide(arena, player)) {
    player.pos.x -= dir;
  }
}

function playerRotate(dir) {
  const pos = player.pos.x;
  let offset = 1;
  rotate(player.matrix, dir);
  while (collide(arena, player)) {
    player.pos.x += offset;
    offset = -(offset + (offset > 0 ? 1 : -1));
    if (offset > player.matrix[0].length) {
      rotate(player.matrix, -dir);
      player.pos.x = pos;
      return;
    }
  }
}

function rotate(matrix, dir) {
  for (let y = 0; y < matrix.length; ++y) {
    for (let x = 0; x < y; ++x) {
      [matrix[x][y], matrix[y][x]] = [matrix[y][x], matrix[x][y]];
    }
  }
  if (dir > 0) {
    matrix.forEach(row => row.reverse());
  } else {
    matrix.reverse();
  }
}

function playerReset() {
  player.matrix = nextPiece; // Use previewed piece
  player.pos.y = 0;
  player.pos.x = (COLS / 2 | 0) - (player.matrix[0].length / 2 | 0);
  nextPiece = createPiece(pieces[pieces.length * Math.random() | 0]); // Generate next
  drawNextPiece();
  if (collide(arena, player)) {
    arena.forEach(row => row.fill(0));
    score = 0;
    document.getElementById('score').innerText = score;
  }
}

function drawNextPiece() {
  nextContext.clearRect(0, 0, nextCanvas.width, nextCanvas.height);
  drawMatrix(nextPiece, {x: 1, y: 1}, nextContext);
}

function draw() {
  context.fillStyle = '#000';
  context.fillRect(0, 0, canvas.width, canvas.height);
  drawMatrix(arena, {x: 0, y: 0});
  drawMatrix(player.matrix, player.pos);
}

let dropCounter = 0;
let dropInterval = 1000;
let lastTime = 0;

function update(time = 0) {
  const deltaTime = time - lastTime;
  lastTime = time;

  dropCounter += deltaTime;
  if (dropCounter > dropInterval) {
    playerDrop();
  }

  draw();
  requestAnimationFrame(update);
}

const pieces = 'TJLOSZI'.split('');

let player = {
  pos: {x: 0, y: 0},
  matrix: null
};
let nextPiece = createPiece(pieces[pieces.length * Math.random() | 0]);

playerReset();
drawNextPiece();
update();

// Continuous movement
let moveInterval = null;
let moveDirection = 0;

document.addEventListener('keydown', event => {
  if (['ArrowLeft', 'ArrowRight', 'ArrowDown', 'ArrowUp'].includes(event.code)) {
    event.preventDefault(); // Prevent scrolling on arrow keys
  }

  if (event.code === 'ArrowLeft') {
    if (moveDirection !== -1) {
      moveDirection = -1;
      playerMove(-1);
      moveInterval = setInterval(() => playerMove(-1), 100);
    }
  } else if (event.code === 'ArrowRight') {
    if (moveDirection !== 1) {
      moveDirection = 1;
      playerMove(1);
      moveInterval = setInterval(() => playerMove(1), 100);
    }
  } else if (event.code === 'ArrowDown') {
    if (moveDirection !== 2) {
      moveDirection = 2;
      playerDrop();
      moveInterval = setInterval(() => playerDrop(), 50);
    }
  } else if (event.code === 'KeyQ') {
    playerRotate(-1);
  } else if (event.code === 'KeyW') {
    playerRotate(1);
  }
});

document.addEventListener('keyup', event => {
  if ((event.code === 'ArrowLeft' && moveDirection === -1) ||
      (event.code === 'ArrowRight' && moveDirection === 1)) {
    clearInterval(moveInterval);
    moveInterval = null;
    moveDirection = 0;
  }
});

