import './style.css'

type CellToken = 'X' | 'O';
type CellValue = CellToken | null;
let current: CellToken = 'X';

let grid_size: number;

enum LineTypes { HORIZONTAL, VERTICAL, DAGLEFT, DAGRIGHT }
type LineType = LineTypes.HORIZONTAL | LineTypes.VERTICAL | LineTypes.DAGLEFT | LineTypes.DAGRIGHT;

type LineMatch = {
  type: LineType;
  index: number;
}

// Keep 2D array reference of grid
let cellArr: CellValue[][];

let won = false;
let scoreX = 0;
let scoreO = 0;

// DOM Elements
let grid: HTMLDivElement;
let cells: NodeListOf<HTMLDivElement>;
let currentDiv: HTMLDivElement;
let endCard: HTMLDivElement;
let scoreCard: HTMLDivElement;

function onCellClicked(cell: HTMLDivElement, index: number) {
  if (won || cell.innerText) {
    return; // Prevent overwriting
  }

  cell.innerText = current;
  fillCellArr(index);

  const lineMatch: LineMatch | undefined | null = checkWin();

  if (lineMatch || lineMatch === undefined) {
    onWin(lineMatch);
  } else {
    switchCurrent();
  }
}

function fillCellArr(index: number): void {
  const row = Math.floor(index / grid_size);
  const col = index % grid_size;
  cellArr[row][col] = current;
}

function generateEmptyCellArray() {
  cellArr = Array.from({ length: grid_size }, () => Array(grid_size).fill(null));
}

function switchCurrent(): void {
  current == 'X' ? current = 'O' : current = 'X';
  currentDiv.innerText = current;
};

function checkFull(): boolean {
  return !cellArr.some(row => row.some(cell => cell === null));
}

function checkLine(arr: CellValue[]): boolean {
  return !arr.includes(null) && Array.from(new Set(arr)).length === 1;
}

function checkRow(): LineMatch | null {
  for (let rowIndex = 0; rowIndex < cellArr.length; rowIndex++) {
    const row = cellArr[rowIndex];
    if (checkLine(row)) {
      return {
        type: LineTypes.HORIZONTAL,
        index: rowIndex,
      };
    }
  }
  return null;
};

function checkColumn(): LineMatch | null {
  for (let colIndex = 0; colIndex < grid_size; colIndex++) {
    const col: CellValue[] = [];

    for (let rowIndex = 0; rowIndex < grid_size; rowIndex++) {
      col.push(cellArr[rowIndex][colIndex]);
    }

    if (checkLine(col)) {
      return {
        type: LineTypes.VERTICAL,
        index: colIndex,
      };
    }
  }
  return null;
};

function checkDiagonal(): LineMatch | null {
  const dagLeft: CellValue[] = [];
  const dagRight: CellValue[] = [];

  for (let i = 0; i < grid_size; i++) {
    dagLeft.push(cellArr[i][i]);
    dagRight.push(cellArr[i][grid_size - i - 1]);
  }

  if (checkLine(dagLeft)) {
    return {
      type: LineTypes.DAGLEFT,
      index: 0,
    };
  }

  if (checkLine(dagRight)) {
    return {
      type: LineTypes.DAGRIGHT,
      index: 2,
    };
  }

  return null;
}

function checkWin(): LineMatch | undefined | null {

  // ROWS
  const row = checkRow();
  if (row) {
    return row;
  }

  // COLUMNS
  const col = checkColumn();
  if (col) {
    return col;
  }

  // DIAGONALS
  const dag = checkDiagonal();
  if (dag) {
    return dag;
  }

  // FULL
  const full = checkFull();
  if (full) {
    return undefined;
  }

  return null;

}

function showGameOver(winner: CellToken | undefined) {
  const message: string = winner ? winner + ' won!' : "It's a tie!";
  endCard.querySelector('p')!.innerText = message;
  endCard.style.visibility = 'visible';
}

function drawLine(lineMatch: LineMatch) {
  const lineElement: HTMLDivElement = document.createElement('div');

  const className: string = getLineClass(lineMatch.type);
  lineElement.className = `line ${className}`;

  const offsetPercentage: number = Number((100.0 / (grid_size * 2.0)).toFixed(2));
  const totalOffset = offsetPercentage + (offsetPercentage * 2) * lineMatch.index;

  switch (lineMatch.type) {
    case LineTypes.VERTICAL: {
      lineElement.style.left = `${totalOffset}%`;
      break;
    }
    case LineTypes.HORIZONTAL: {
      lineElement.style.top = `${totalOffset}%`;
      break;
    }
    default: break;
  }

  document.querySelector('.game-container')!.appendChild(lineElement);

}

const getLineClass = (lineType: LineType): string => {
  if (lineType === LineTypes.HORIZONTAL) {
    return "hline";
  } else if (lineType === LineTypes.VERTICAL) {
    return "vline";
  } else if (lineType === LineTypes.DAGLEFT) {
    return "dag dagleft";
  } else if (lineType === LineTypes.DAGRIGHT) {
    return "dag dagright";
  } else {
    throw new TypeError("Invalid line type");
  }
}

function onWin(lineMatch: LineMatch | undefined): void {
  won = true;
  let winner: CellToken | undefined;

  if (lineMatch === undefined) {
    winner = undefined;
    scoreX++;
    scoreO++;
  } else {
    drawLine(lineMatch);
    winner = current;
    winner === 'X' ? scoreX++ : scoreO++;
  }

  scoreCard.querySelector('.scoreX')!.innerHTML = scoreX.toString();
  scoreCard.querySelector('.scoreO')!.innerHTML = scoreO.toString();

  grid.classList.add('disabled');
  showGameOver(winner);
}

function reset() {
  // Clear cells
  cells.forEach((cell) => cell.innerText = '');
  generateEmptyCellArray();

  // Clear win line
  document.querySelector('.line')?.remove();

  // Reset variables
  current = 'X';
  won = false;

  // Hide end card
  endCard.style.visibility = 'hidden';

  // Reneable game
  grid.classList.remove('disabled');

}

document.addEventListener("DOMContentLoaded", () => {

  if (document.querySelector('.grid') === null) {
    throw new ReferenceError('No grid defined in HTML.');
  }

  grid = document.querySelector('.grid')!;
  cells = grid.querySelectorAll('div');
  grid_size = Math.sqrt(cells.length);

  generateEmptyCellArray();
  cells.forEach((cell: HTMLDivElement, index: number) => {
    cell && cell.addEventListener('click', () => onCellClicked(cell, index))
  });

  currentDiv = document.querySelector('.current')!;
  currentDiv.innerText = current;

  scoreCard = document.querySelector('.score')!;

  endCard = document.querySelector('.endCard')!;
  endCard.querySelector('button')?.addEventListener('click', (e) => {
    e.preventDefault();
    reset();
  });
});