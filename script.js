const BOARD_SIZE = 15;
const EMPTY = 0;
const BLACK = 1;
const WHITE = 2;

let board = [];
let currentPlayer = BLACK;
let gameOver = false;

// 初始化棋盘
function initBoard() {
  board = Array.from({ length: BOARD_SIZE }, () => 
    Array.from({ length: BOARD_SIZE }, () => EMPTY)
  );
  
  const boardElement = document.getElementById('board');
  boardElement.innerHTML = '';
  
  for (let i = 0; i < BOARD_SIZE; i++) {
    for (let j = 0; j < BOARD_SIZE; j++) {
      const cell = document.createElement('div');
      cell.classList.add('cell');
      cell.dataset.row = i;
      cell.dataset.col = j;
      cell.addEventListener('click', handleCellClick);
      boardElement.appendChild(cell);
    }
  }
}

// 处理玩家点击
function handleCellClick(e) {
  if (gameOver) return;
  
  const row = parseInt(e.target.dataset.row);
  const col = parseInt(e.target.dataset.col);
  
  if (board[row][col] !== EMPTY) return;
  
  placeStone(row, col, currentPlayer);
  if (checkWin(row, col, currentPlayer)) {
    endGame(currentPlayer === BLACK ? '玩家获胜！' : '电脑获胜！');
    return;
  }
  
  currentPlayer = WHITE;
  setTimeout(computerMove, 500);
}

// 落子
function placeStone(row, col, player) {
  board[row][col] = player;
  const cell = document.querySelector(`.cell[data-row='${row}'][data-col='${col}']`);
  cell.classList.add(player === BLACK ? 'black' : 'white');
}

// 电脑走棋
function computerMove() {
  let bestMove = findBestMove();
  if (!bestMove) return;
  
  const [row, col] = bestMove;
  placeStone(row, col, WHITE);
  
  if (checkWin(row, col, WHITE)) {
    endGame('电脑获胜！');
    return;
  }
  
  currentPlayer = BLACK;
}

// 棋型评分
const SCORES = {
  FIVE: 100000,
  FOUR: 10000,
  BLOCKED_FOUR: 1000,
  THREE: 1000,
  BLOCKED_THREE: 100,
  TWO: 100,
  BLOCKED_TWO: 10,
  ONE: 10,
  BLOCKED_ONE: 1
};

// 寻找最佳落子位置
function findBestMove() {
  let bestScore = -Infinity;
  let bestMoves = [];
  
  for (let i = 0; i < BOARD_SIZE; i++) {
    for (let j = 0; j < BOARD_SIZE; j++) {
      if (board[i][j] !== EMPTY) continue;
      
      // 计算当前点的得分
      let score = evaluatePoint(i, j, WHITE);
      score += evaluatePoint(i, j, BLACK) * 0.8; // 防守权重
      
      if (score > bestScore) {
        bestScore = score;
        bestMoves = [[i, j]];
      } else if (score === bestScore) {
        bestMoves.push([i, j]);
      }
    }
  }
  
  if (bestMoves.length > 0) {
    // 如果有多个最佳位置，随机选择一个
    return bestMoves[Math.floor(Math.random() * bestMoves.length)];
  }
  
  return null;
}

// 评估一个点的得分
function evaluatePoint(x, y, player) {
  let totalScore = 0;
  
  // 四个方向评估
  const directions = [
    [1, 0],  // 垂直
    [0, 1],  // 水平
    [1, 1],  // 主对角线
    [1, -1]  // 副对角线
  ];
  
  for (const [dx, dy] of directions) {
    let score = 0;
    let count = 0;      // 连续棋子数
    let block = 0;      // 被阻挡数
    let empty = 0;      // 空位
    let tempX = x - dx;
    let tempY = y - dy;
    
    // 反向检查
    while (tempX >= 0 && tempX < BOARD_SIZE && tempY >= 0 && tempY < BOARD_SIZE) {
      if (board[tempX][tempY] === player) {
        count++;
        tempX -= dx;
        tempY -= dy;
      } else if (board[tempX][tempY] === EMPTY) {
        empty++;
        break;
      } else {
        block++;
        break;
      }
    }
    
    // 正向检查
    tempX = x + dx;
    tempY = y + dy;
    while (tempX >= 0 && tempX < BOARD_SIZE && tempY >= 0 && tempY < BOARD_SIZE) {
      if (board[tempX][tempY] === player) {
        count++;
        tempX += dx;
        tempY += dy;
      } else if (board[tempX][tempY] === EMPTY) {
        empty++;
        break;
      } else {
        block++;
        break;
      }
    }
    
    // 计算棋型得分
    if (count >= 4) {
      score += SCORES.FIVE;
    } else if (count === 3) {
      if (empty === 2) {
        score += SCORES.FOUR;  // 活四
      } else if (empty === 1) {
        score += SCORES.BLOCKED_FOUR;  // 冲四
      }
    } else if (count === 2) {
      if (empty === 2) {
        score += SCORES.THREE;  // 活三
      } else if (empty === 1) {
        score += SCORES.BLOCKED_THREE;  // 冲三
      }
    } else if (count === 1) {
      if (empty === 2) {
        score += SCORES.TWO;  // 活二
      } else if (empty === 1) {
        score += SCORES.BLOCKED_TWO;  // 冲二
      }
    }
    
    totalScore += score;
  }
  
  return totalScore;
}

// 检查是否获胜
function checkWin(row, col, player) {
  const directions = [
    [1, 0],  // 垂直
    [0, 1],  // 水平
    [1, 1],  // 主对角线
    [1, -1]  // 副对角线
  ];

  for (const [dx, dy] of directions) {
    let count = 1;
    
    // 正向检查
    let x = row + dx;
    let y = col + dy;
    while (x >= 0 && x < BOARD_SIZE && y >= 0 && y < BOARD_SIZE && board[x][y] === player) {
      count++;
      x += dx;
      y += dy;
    }
    
    // 反向检查
    x = row - dx;
    y = col - dy;
    while (x >= 0 && x < BOARD_SIZE && y >= 0 && y < BOARD_SIZE && board[x][y] === player) {
      count++;
      x -= dx;
      y -= dy;
    }
    
    if (count >= 5) {
      return true;
    }
  }
  
  return false;
}

// 结束游戏
function endGame(message) {
  gameOver = true;
  document.querySelector('.status').textContent = message;
}

// 初始化游戏
initBoard();
