module.exports =
function solveSudoku(matrix) {
  const sudokuSolved = new Array(9);
  for (var i = 0; i < 9; i++) {
    sudokuSolved[i] = new Array(9);
  }
  for (let i = 0; i < 9; i++) {
    for (var j = 0; j < 9; j++) {
      const value = matrix[i][j];
      const solved = matrix[i][j] ? true : false;
      let solutions = [];
      if ( !solved ) {
        solutions = [1, 2, 3, 4, 5, 6, 7, 8, 9];
      }
      sudokuSolved[i][j] = { value, solved, solutions };
    }
  }

  let changes = 0;
  do {
    changes = 0;
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        if ( !(sudokuSolved[i][j].solved) ) {
          changes += checkCell(sudokuSolved, i, j);
          changes += checkHidenCell(sudokuSolved, i, j);
          changes += checkCandidatRepeat(sudokuSolved, i, j);
          changes += algorithm4(sudokuSolved, i, j);
        }
      }
    }
  } while ( changes );

  if (!isSolved(sudokuSolved)) {
    recursiveAlgorithm(sudokuSolved);
  }

  let result = new Array(9);
  for (var i = 0; i < 9; i++) {
    result[i] = new Array(9);
  }
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      result[i][j] = sudokuSolved[i][j].value;
    }
  }
  return result;
}

function copySudoku(sudokuCopy, sudoku){
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      sudokuCopy[i][j] = {};
      sudokuCopy[i][j].value = sudoku[i][j].value;
      sudokuCopy[i][j].solved = sudoku[i][j].solved;
      sudokuCopy[i][j].solutions = [];
      for (let s = 0; s < sudoku[i][j].solutions.length; s++) {
        sudokuCopy[i][j].solutions.push(sudoku[i][j].solutions[s]);
      }
    }
  }
}

function recursiveAlgorithm(sudoku) {
  let changes = 0;
  do {
    changes = 0;
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        if ( !(sudoku[i][j].solved) ) {
          changes += checkCell(sudoku, i, j);
          changes += checkHidenCell(sudoku, i, j);
          changes += checkCandidatRepeat(sudoku, i, j);
          changes += algorithm4(sudoku, i, j);
        }
      }
    }
  } while ( changes );


  if (isSolved(sudoku)) {
    return true;
  }

  const sudokuCopy = new Array(9);
  for (var i = 0; i < 9; i++) {
    sudokuCopy[i] = new Array(9);
  }

  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      for (var f = 2; f < 9; f++) { //ne5
        if ( !(sudoku[i][j].solved) && sudoku[i][j].solutions.length == f ) {
          let n = 0;
          do {
            copySudoku(sudokuCopy, sudoku);
            sudokuCopy[i][j].value = sudoku[i][j].solutions[n];
            sudokuCopy[i][j].solved = true;
            n++;
            if (n == f) break;
          } while ( !recursiveAlgorithm(sudokuCopy) );

          copySudoku(sudoku, sudokuCopy);
        }
        if (isSolved(sudoku)) return true;
      }
    }
  }

  return isSolved(sudoku);
}


function isSolved(sudoku) {
  for (let i = 0; i < 9; i++) {
    for (var j = 0; j < 9; j++) {
      if (!sudoku[i][j].solved) return false;
    }
  }
  return true;
}


function checkCell(sudoku, i, j) {
  let changes = 0;

  changes += checkRow(sudoku, i, j);
  changes += checkCol(sudoku, i, j);
  changes += checkBlock(sudoku, i, j);

  if (sudoku[i][j].solutions.length == 1) {
    sudoku[i][j].value = sudoku[i][j].solutions[0];
    sudoku[i][j].solved = true;
  }

  return changes;
}

function checkRow(sudoku, i, j) {
  let changes = 0;

  for (let k = 0; k < sudoku[i][j].solutions.length; k++) {
    for (let p = 0; p < 9; p++) {
      if ( sudoku[i][p].value == sudoku[i][j].solutions[k] ) {
        sudoku[i][j].solutions.splice(k, 1);
        k--;
        changes++;
        break;
      }
    }
  }

  return changes;
}
function checkCol(sudoku, i, j) {
  let changes = 0;

  for (let k = 0; k < sudoku[i][j].solutions.length; k++) {
    for (let p = 0; p < 9; p++) {
      if ( sudoku[p][j].value == sudoku[i][j].solutions[k] ) {
        sudoku[i][j].solutions.splice(k, 1);
        k--;
        changes++;
        break;
      }
    }
  }

  return changes;
}
function checkBlock(sudoku, i, j) {
  let changes = 0;

  //проверяем, в каком блоке находится ячейка, находим координаты (p, k) её левого верхнего угла
  let p = 0;
  if ( Math.floor( i / 3 ) == 1 ) p = 3;
  if ( Math.floor( i / 3 ) == 2 ) p = 6;

  let k = 0;
  if ( Math.floor( j / 3 ) == 1 ) k = 3;
  if ( Math.floor( j / 3 ) == 2 ) k = 6;

  for (let t = 0; t < sudoku[i][j].solutions.length; t++) {
    for (let temp1 = p; temp1 < p + 3; temp1++) {
      for (let temp2 = k; temp2 < k + 3; temp2++) {
        if ( sudoku[temp1][temp2].value == sudoku[i][j].solutions[t] ) {
          sudoku[i][j].solutions.splice(t, 1);
          t--;
          changes++;
          break;
        }
      }
    }
  }

  return changes;
}



function checkHidenCell(sudoku, i, j) {
  let changes = 0;

  for (let k = 0; k < sudoku[i][j].solutions.length; k++) {
    if ( isCandidatSingleInRow(sudoku, i, j, sudoku[i][j].solutions[k]) ||
         isCandidatSingleInCol(sudoku, i, j, sudoku[i][j].solutions[k]) ||
         isCandidatSingleInBlock(sudoku, i, j, sudoku[i][j].solutions[k]) ) {
      sudoku[i][j].value = sudoku[i][j].solutions[k];
      sudoku[i][j].solved = true;
      changes++;
      break;
    }
  }

  return changes;
}

function isCandidatSingleInRow(sudoku, i, j, candidat) {
  for (var k = 0; k < 9; k++) {
    if (k == j) {
      continue;
    }

    for (var p = 0; p < sudoku[i][k].solutions.length; p++) {
      if ( sudoku[i][k].solutions[p] == candidat ) {
        return false;
      }
    }
  }
  return true;
}
function isCandidatSingleInCol(sudoku, i, j, candidat) {
  for (var k = 0; k < 9; k++) {
    if (k == i) {
      continue;
    }

    for (var p = 0; p < sudoku[k][j].solutions.length; p++) {
      if ( sudoku[k][j].solutions[p] == candidat ) {
        return false;
      }
    }
  }
  return true;
}
function isCandidatSingleInBlock(sudoku, i, j, candidat) {
  //проверяем, в каком блоке находится ячейка, находим координаты (p, k) её левого верхнего угла
  let p = 0;
  if ( Math.floor( i / 3 ) == 1 ) p = 3;
  if ( Math.floor( i / 3 ) == 2 ) p = 6;

  let k = 0;
  if ( Math.floor( j / 3 ) == 1 ) k = 3;
  if ( Math.floor( j / 3 ) == 2 ) k = 6;

  const temp1 = p + 3; //(максимальное - 1) значение p в блоке
  const temp2 = k + 3; //(максимальное - 1) значение k в блоке

  for (; p < temp1; p++) {
    for (; k < temp2; k++) {
      if (p == i && j == k) {
        continue;
      }
      for (var t = 0; t < sudoku[p][k].solutions.length; t++) {
        if ( sudoku[p][k].solutions[t] == candidat ) {
          return false;
        }
      }
    }
    k -= 3;
  }

  return true;
}


function checkCandidatRepeat(sudoku, i, j) {
  let changes = 0;
  if (sudoku[i][j].solutions.length > 1) {
    changes += checkRepeatInRow(sudoku, i, j);
    changes += checkRepeatInCol(sudoku, i, j);
    changes += checkRepeatInBlock(sudoku, i, j);
  }
  return changes;
}

function checkRepeatInRow(sudoku, i, j) {
  let changes = 0;
  const arraySameCandidatsCells = [];

  for (let k = 0; k < 9; k++) {
    if (k == j) {
      continue;
    }
    if (sudoku[i][k].solutions.length == sudoku[i][j].solutions.length) {
      for (let p = 0; p < sudoku[i][j].solutions.length; p++) {
        if (sudoku[i][k].solutions[p] != sudoku[i][j].solutions[p]) {
          break;
        }
        if (p == (sudoku[i][j].solutions.length - 1) ) {
          arraySameCandidatsCells.push(k);
        }
      }
    }
  }

  if (arraySameCandidatsCells.length == sudoku[i][j].solutions.length - 1) {
    outer: for (let t = 0; t < 9; t++) {
      for (let m = 0; m < arraySameCandidatsCells.length; m++) {
        if (t == arraySameCandidatsCells[m] || t == j) {
          continue outer;
        }
      }

      for (let p = 0; p < sudoku[i][t].solutions.length; p++) {
        for (let f = 0; f < sudoku[i][j].solutions.length; f++) {
          let ind = sudoku[i][t].solutions.indexOf(sudoku[i][j].solutions[f]);
          if (ind >= 0) {
            sudoku[i][t].solutions.splice(ind, 1);
            changes++;
          }
        }
      }
    }
  }

  return changes;
}
function checkRepeatInCol(sudoku, i, j) {
  let changes = 0;
  const arraySameCandidatsCells = [];

  for (let k = 0; k < 9; k++) {
    if (k == i) {
      continue;
    }
    if (sudoku[k][j].solutions.length == sudoku[i][j].solutions.length) {
      for (let p = 0; p < sudoku[i][j].solutions.length; p++) {
        if (sudoku[k][j].solutions[p] != sudoku[i][j].solutions[p]) {
          break;
        }
        if (p == (sudoku[i][j].solutions.length - 1) ) {
          arraySameCandidatsCells.push(k);
        }
      }
    }
  }

  if (arraySameCandidatsCells.length == sudoku[i][j].solutions.length - 1) {
    outer: for (let t = 0; t < 9; t++) {
      for (let m = 0; m < arraySameCandidatsCells.length; m++) {
        if (t == arraySameCandidatsCells[m] || t == i) {
          continue outer;
        }
      }

      for (let p = 0; p < sudoku[t][j].solutions.length; p++) {
        for (let f = 0; f < sudoku[i][j].solutions.length; f++) {
          let ind = sudoku[t][j].solutions.indexOf(sudoku[i][j].solutions[f]);
          if (ind >= 0) {
            sudoku[t][j].solutions.splice(ind, 1);
            changes++;
          }
        }
      }
    }
  }

  return changes;
}
function checkRepeatInBlock(sudoku, i, j) {
  let changes = 0;
  const arraySameCandidatsCells = [];
  //проверяем, в каком блоке находится ячейка, находим координаты (p, k) её левого верхнего угла
  let p = 0;
  if ( Math.floor( i / 3 ) == 1 ) p = 3;
  if ( Math.floor( i / 3 ) == 2 ) p = 6;

  let k = 0;
  if ( Math.floor( j / 3 ) == 1 ) k = 3;
  if ( Math.floor( j / 3 ) == 2 ) k = 6;

  for (let temp1 = p; temp1 < p + 3; temp1++) {
    for (let temp2 = k; temp2 < k + 3; temp2++) {
      if (temp1 == i && temp2 == j) {
        continue;
      }
      if (sudoku[temp1][temp2].solutions.length == sudoku[i][j].solutions.length) {
        for (let p = 0; p < sudoku[i][j].solutions.length; p++) {
          if (sudoku[temp1][temp2].solutions[p] != sudoku[i][j].solutions[p]) {
            break;
          }
          if (p == (sudoku[i][j].solutions.length - 1) ) {
            arraySameCandidatsCells.push( { temp1, temp2 } );
          }
        }
      }
    }
  }


  if (arraySameCandidatsCells.length == sudoku[i][j].solutions.length - 1) {
    for (let i2 = p; i2 < p + 3; i2++) {
      outer: for (let j2 = k; j2 < k + 3; j2++) {
        if (i2 == i && j2 == j) {
          continue;
        }
        for (let h = 0; h < arraySameCandidatsCells.length; h++) {
          if (i2 == arraySameCandidatsCells[h].temp1 && j2 == arraySameCandidatsCells[h].temp2) {
            continue outer;
          }
        }


        for (let r = 0; r < sudoku[i][j].solutions.length; r++) {
          let ind = sudoku[i2][j2].solutions.indexOf(sudoku[i][j].solutions[r]);
          if (ind >= 0) {
            sudoku[i2][j2].solutions.splice(ind, 1);
            changes++;
          }
        }

      }
    }
  }

  return changes;
}



function algorithm4(sudoku, i, j) {
  let changes = 0;

  changes += algorithm4_1(sudoku, i, j);
  changes += algorithm4_2(sudoku, i, j);
  changes += algorithm4_3(sudoku, i, j);

  return changes;
}

function algorithm4_1(sudoku, i, j) {
  let changes = 0;
  //проверяем, в каком блоке находится ячейка, находим координаты (p, k) её левого верхнего угла
  let iBlockFirst = 0;
  if ( Math.floor( i / 3 ) == 1 ) iBlockFirst = 3;
  if ( Math.floor( i / 3 ) == 2 ) iBlockFirst = 6;

  let jBlockFirst = 0;
  if ( Math.floor( j / 3 ) == 1 ) jBlockFirst = 3;
  if ( Math.floor( j / 3 ) == 2 ) jBlockFirst = 6;

  for (let k = 0; k < sudoku[i][j].solutions.length; k++) {
    let tempArray = [];
    for (let i2 = iBlockFirst; i2 < iBlockFirst + 3; i2++) {
      for (let j2 = jBlockFirst; j2 < jBlockFirst + 3; j2++) {
        if (i2 == i && j2 == j) {
          continue;
        }
        for (s = 0; s < sudoku[i2][j2].solutions.length; s++) {
          if (sudoku[i2][j2].solutions[s] == sudoku[i][j].solutions[k]) {
            tempArray.push( { i2, j2 } );
            break;
          }
        }
      }
    }

    if (tempArray.length > 0 && tempArray.length < 3) {

      for (let p = 0; p < tempArray.length; p++) {
        if (tempArray[p].i2 != i) {
          break;
        }
        if (p == tempArray.length - 1) {
          for (let t = 0; t < 9; t++) {
            if (t >= jBlockFirst && t < (jBlockFirst + 3)) {
              continue;
            }

            let ind = sudoku[i][t].solutions.indexOf(sudoku[i][j].solutions[k]);
            if (ind > -1) {
              sudoku[i][t].solutions.splice(ind, 1);
              changes++;
            }
          }
        }
      }

      for (let p = 0; p < tempArray.length; p++) {
        if (tempArray[p].j2 != j) {
          break;
        }
        if (p == tempArray.length - 1) {
          for (let t = 0; t < 9; t++) {
            if (t >= iBlockFirst && t < (iBlockFirst + 3)) {
              continue;
            }

            let ind = sudoku[t][j].solutions.indexOf(sudoku[i][j].solutions[k]);
            if (ind > -1) {
              sudoku[t][j].solutions.splice(ind, 1);
              changes++;
            }
          }
        }
      }

    }
  }

  return changes;
}
function algorithm4_2(sudoku, i, j) {
  let changes = 0;
  let tempArray = [];

  let iBlockFirst = 0;
  if ( Math.floor( i / 3 ) == 1 ) iBlockFirst = 3;
  if ( Math.floor( i / 3 ) == 2 ) iBlockFirst = 6;

  let jBlockFirst = 0;
  if ( Math.floor( j / 3 ) == 1 ) jBlockFirst = 3;
  if ( Math.floor( j / 3 ) == 2 ) jBlockFirst = 6;

  for (let k = 0; k < sudoku[i][j].solutions.length; k++) {
    for (let j2 = 0; j2 < 9; j2++) {
      if (j2 == j) {
        continue;
      }
      for (let s = 0; s < sudoku[i][j2].solutions.length; s++) {
        if (sudoku[i][j2].solutions[s] == sudoku[i][j].solutions[k]) {
          tempArray.push(j2);
        }
      }
    }

    if (tempArray > 0 && tempArray < 3) {
      for (let f = 0; f < tempArray.length; f++) {
        if ( (tempArray[f] < jBlockFirst) || (tempArray[f] >= jBlockFirst + 3) ) {
          break;
        }
        if (f == tempArray.length - 1) {
          for (let i1 = iBlockFirst; i1 < iBlockFirst + 3; i1++) {
            for (let j1 = jBlockFirst; j1 < jBlockFirst + 3; j1++) {
              if (i1 == i) {
                continue;
              }

              let ind = sudoku[i1][j1].solutions.indexOf(sudoku[i][j].solutions[k]);
              if (ind > -1) {
                sudoku[i1][j1].solutions.splice(ind, 1);
                changes++;
              }

            }
          }
        }
      }
    }

  }

  return changes;
}
function algorithm4_3(sudoku, i, j) {
  let changes = 0;
  let tempArray = [];

  let iBlockFirst = 0;
  if ( Math.floor( i / 3 ) == 1 ) iBlockFirst = 3;
  if ( Math.floor( i / 3 ) == 2 ) iBlockFirst = 6;

  let jBlockFirst = 0;
  if ( Math.floor( j / 3 ) == 1 ) jBlockFirst = 3;
  if ( Math.floor( j / 3 ) == 2 ) jBlockFirst = 6;

  for (let k = 0; k < sudoku[i][j].solutions.length; k++) {
    for (let i2 = 0; i2 < 9; i2++) {
      if (i2 == i) {
        continue;
      }
      for (let s = 0; s < sudoku[i2][j].solutions.length; s++) {
        if (sudoku[i2][j].solutions[s] == sudoku[i][j].solutions[k]) {
          tempArray.push(i2);
        }
      }
    }

    if (tempArray > 0 && tempArray < 3) {
      for (let f = 0; f < tempArray.length; f++) {
        if ( (tempArray[f] < iBlockFirst) || (tempArray[f] >= iBlockFirst + 3) ) {
          break;
        }
        if (f == tempArray.length - 1) {
          for (let i1 = iBlockFirst; i1 < iBlockFirst + 3; i1++) {
            for (let j1 = jBlockFirst; j1 < jBlockFirst + 3; j1++) {
              if (j1 == j) {
                continue;
              }

              let ind = sudoku[i1][j1].solutions.indexOf(sudoku[i][j].solutions[k]);
              if (ind > -1) {
                sudoku[i1][j1].solutions.splice(ind, 1);
                changes++;
              }

            }
          }
        }
      }
    }

  }

  return changes;
}
