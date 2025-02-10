
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  
  function generateSequence() {
    const sequence = ['I', 'J', 'L', 'O', 'S', 'T', 'Z'];
    while (sequence.length) {
      const rand = getRandomInt(0, sequence.length - 1);
      const name = sequence.splice(rand, 1)[0];
      tetrominoSequence.push(name);
    }
  }
  
  function getNextTetromino() {
    if (tetrominoSequence.length === 0) {
      generateSequence();
    }
    const name = tetrominoSequence.pop();
    const matrix = tetrominos[name];
    const col = playfield[0].length / 2 - Math.ceil(matrix[0].length / 2);
    const row = name === 'I' ? -1 : -2;
    return { name, matrix, row, col };
  }
  
  function rotate(matrix) {
    const N = matrix.length - 1;
    return matrix.map((row, i) => row.map((_, j) => matrix[N - j][i]));
  }
  
  function isValidMove(matrix, cellRow, cellCol) {
    for (let row = 0; row < matrix.length; row++) {
      for (let col = 0; col < matrix[row].length; col++) {
        if (matrix[row][col] &&
            (cellCol + col < 0 ||
             cellCol + col >= playfield[0].length ||
             cellRow + row >= playfield.length ||
             playfield[cellRow + row][cellCol + col])) {
          return false;
        }
      }
    }
    return true;
  }


  const nextCanvas = document.getElementById('next');
  const nextContext = nextCanvas.getContext('2d');
  const previewGrid = 24; // Smaller grid size for preview

  function drawNextTetromino() {
    nextContext.clearRect(0, 0, nextCanvas.width, nextCanvas.height);

    if (!nextTetromino) return;

    nextContext.fillStyle = colors[nextTetromino.name];

    const matrix = nextTetromino.matrix;
    const size = matrix.length; // Get the size of the Tetromino (2x2, 3x3, 4x4)
    
    // Calculate the offset to center the piece
    const offsetX = Math.floor((nextCanvas.width - size * previewGrid) / 2);
    const offsetY = Math.floor((nextCanvas.height - size * previewGrid) / 2);

    for (let row = 0; row < size; row++) {
        for (let col = 0; col < size; col++) {
            if (matrix[row][col]) {
                nextContext.fillRect(
                    offsetX + col * previewGrid,
                    offsetY + row * previewGrid,
                    previewGrid - 1, previewGrid - 1
                );
            }
        }
    }
  }

  
  
  function placeTetromino() {
    for (let row = 0; row < tetromino.matrix.length; row++) {
        for (let col = 0; col < tetromino.matrix[row].length; col++) {
            if (tetromino.matrix[row][col]) {
                if (tetromino.row + row < 0) return showGameOver();
                playfield[tetromino.row + row][tetromino.col + col] = tetromino.name;
            }
        }
    }

    // Check for full rows and clear them
    for (let row = playfield.length - 1; row >= 0; ) {
        if (playfield[row].every(cell => !!cell)) {
            for (let r = row; r >= 0; r--) {
                for (let c = 0; c < playfield[r].length; c++) {
                    playfield[r][c] = playfield[r - 1][c];
                }
            }
        } else {
            row--;
        }
    }

    // Move the next Tetromino into play and generate a new next Tetromino
    tetromino = nextTetromino;
    nextTetromino = getNextTetromino();
}
  
  function showGameOver() {
    cancelAnimationFrame(rAF);
    gameOver = true;
    context.fillStyle = 'black';
    context.globalAlpha = 0.75;
    context.fillRect(0, canvas.height / 2 - 30, canvas.width, 60);
    context.globalAlpha = 1;
    context.fillStyle = 'white';
    context.font = '36px monospace';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText('wahahahahaha!', canvas.width / 2, canvas.height / 2);
  }
  
  const canvas = document.getElementById('game');
  const context = canvas.getContext('2d');
  const grid = 32;
  const tetrominoSequence = [];
  const playfield = [];
  
  for (let row = -2; row < 20; row++) {
    playfield[row] = Array(10).fill(0);
  }
  
  const tetrominos = {
    'I': [[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]],
    'J': [[1,0,0],[1,1,1],[0,0,0]],
    'L': [[0,0,1],[1,1,1],[0,0,0]],
    'O': [[1,1],[1,1]],
    'S': [[0,1,1],[1,1,0],[0,0,0]],
    'Z': [[1,1,0],[0,1,1],[0,0,0]],
    'T': [[0,1,0],[1,1,1],[0,0,0]]
  };
  
  const colors = {
    'I': getComputedStyle(document.documentElement).getPropertyValue('--color-I').trim(),
    'O': getComputedStyle(document.documentElement).getPropertyValue('--color-O').trim(),
    'T': getComputedStyle(document.documentElement).getPropertyValue('--color-T').trim(),
    'S': getComputedStyle(document.documentElement).getPropertyValue('--color-S').trim(),
    'Z': getComputedStyle(document.documentElement).getPropertyValue('--color-Z').trim(),
    'J': getComputedStyle(document.documentElement).getPropertyValue('--color-J').trim(),
    'L': getComputedStyle(document.documentElement).getPropertyValue('--color-L').trim()
};
  
  let count = 0;
  let tetromino = getNextTetromino();
  let rAF = null;
  let gameOver = false;
  
  function loop() {
    rAF = requestAnimationFrame(loop);
    context.clearRect(0, 0, canvas.width, canvas.height);

    // Draw existing playfield
    for (let row = 0; row < 20; row++) {
        for (let col = 0; col < 10; col++) {
            if (playfield[row][col]) {
                context.fillStyle = colors[playfield[row][col]];
                context.fillRect(col * grid, row * grid, grid - 1, grid - 1);
            }
        }
    }

    

    // Draw the shadow of the current tetromino
    if (tetromino) {
        drawShadow(tetromino.matrix, tetromino.col);  // Show where the block will land

        // Move the tetromino down every frame
        if (++count > 35) {
            tetromino.row++;
            count = 0;
            if (!isValidMove(tetromino.matrix, tetromino.row, tetromino.col)) {
                tetromino.row--;
                placeTetromino(); // Place the tetromino when it hits the ground
            }
        }

        // Draw the current tetromino on the playfield
        if (tetromino) {
          context.fillStyle = colors[tetromino.name];
  
          for (let row = 0; row < tetromino.matrix.length; row++) {
              for (let col = 0; col < tetromino.matrix[row].length; col++) {
                  if (tetromino.matrix[row][col]) {
                      context.fillRect(
                          (tetromino.col + col) * grid,
                          (tetromino.row + row) * grid,
                          grid - 1, grid - 1
                      );
                  }
              }
          }
      }

      // Draw the next Tetromino in the preview
    drawNextTetromino();

    }
  }
  // Function to drop the tetromino immediately 
  function dropTetromino() {
    while (isValidMove(tetromino.matrix, tetromino.row + 1, tetromino.col)){
      tetromino.row++
    }
    placeTetromino();
  }

  function getLandingRow(matrix, col) {
    let row = tetromino.row;
    while (isValidMove(matrix, row + 1, col)) {
        row++;
    }
    return row;
  }
  
  function drawShadow(matrix, col) {
    const landingRow = getLandingRow(matrix, col);
    context.fillStyle = 'rgba(255, 255, 255, 0.22)'; // Light color for the shadow (with transparency)
    
    for (let row = 0; row < matrix.length; row++) {
        for (let c = 0; c < matrix[row].length; c++) {
            if (matrix[row][c]) {
                const x = (col + c) * grid;
                const y = (landingRow + row) * grid;
                context.fillRect(x, y, grid, grid); // Draw the shadow in the landing position
            }
        }
    }
  }

  // Draw the shadow of the current tetromino
  if (tetromino) {
    drawShadow(tetromino.matrix, tetromino.col); //Show where the block will land

    // Draw the current tetromino on the playfield
    context.fillStyle = colors[tetromino.name];
    for (let row = 0; row < tetromino.matrix.length; row++) {
      for (let col = 0; col < tetromino.matrix[row].length; col++) {
        if (tetromino.matrix[row][col]) {
          context.fillRect((tetromino.col + col) * grid, (tetromino.row + row) * grid, grid - 1, grid - 1);
        }
      }
    }
  }
  document.addEventListener('keydown', function (e) {
    if (gameOver) return;

    // Left arrow Key
    if (e.which === 37 || e.which === 39) {
      const col = e.which === 37 ? tetromino.col - 1 : tetromino.col + 1;
      if (isValidMove(tetromino.matrix, tetromino.row, col)) {
        tetromino.col = col;
      }
    }

    // Up arrow Key (Rotate)
    if (e.which === 38) {
      const matrix = rotate(tetromino.matrix);
      if (isValidMove(matrix, tetromino.row, tetromino.col)) {
        tetromino.matrix = matrix;
      }
    }

    // Down arrow key (move down)
    if (e.which === 40) {
      const row = tetromino.row + 1;
      if (!isValidMove(tetromino.matrix, row, tetromino.col)) {
        tetromino.row = row - 1;
        placeTetromino();
        return;
      }
      tetromino.row = row;
    }

    // Spacebar (drop the tetromino instantly)
    if (e.which === 32) {
      dropTetromino();
    }
    
  });

  

  let nextTetromino = getNextTetromino(); // Store the next block
  
  rAF = requestAnimationFrame(loop);