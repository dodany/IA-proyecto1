const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 3000

var turno;  //ENTRADA
var estado; //ENTRADA
var respuesta; //RESPUESTA
var board = [];  //tablero
var dir = [1, -1];  // ARRAY EN DOS DIRECCIONES
var checkPlay = { 'w': 1, 'b': -1, ' ': 0 }  // converts player colour into a number. This alows enemy pieces to be found by multiplying current by -1
var gameMode = 1;  // 0 - AIvsAI, 1 - 1player, 2 - 2player 
var passCount = 0;  // how many consecutive passes have occured
var player;  // jugador
var move;  // stores a reference to the timeout function which allows it to be cleared on new game

express()
    .use(express.static(path.join(__dirname, 'public')))
    .get('/', function (req, res) {
        turno = req.query.turno
        estado = req.query.estado
        newGame()

        res.send(String(respuesta));
    })
    .listen(PORT, () => console.log(`Listening on ${PORT}`))

//OBTIENE LA MATRIZ DE LA ENTRADA 
function convertArreglo(estado) {
    console.log("converArreglo(estado");
    var tablero = [];     //DECLARAR LA MATRIZ
    for (var i = 0; i < 64; i = i + 8) {
        tablero.push(fila_(estado.slice(i, i + 8)));  //INSERTA CADA 8   
    }
    return tablero; //DEVUELVE LA MATRIZ
}

//OBTIENE LA FILA DE LA ENTRADA
function fila_(slice_) {
    var fila = [];
    for (var i = 0; i < 8; i = i + 1) {
        fila.push(letter(slice_.slice(i, i + 1)));
    }
    return fila
}

function letter(value) {
    if (value == '0') {
        return 'b';
    } else if (value == '1') {
        return 'w';
    } else {
        return ' ';
    }
}

function newGame() {
    console.log("newGame(init=false)");
    player = letter(turno);
    board = convertArreglo(estado);
    renderBoard();
    console.log("fin");
}

function renderBoard() {  // renders the board
    console.log("renderBoard(init=false)");
    var gameOver = true, idealMove = [0, []];  // the score of the current ideal (highest capture) moves, followed by all the possible choices (row, col, direction)
    board.forEach((row, r) => {  // loops over board rows
        row.forEach((square, c) => {  // loops over the squares in the row
            var direction = checkMove(board, r, c, player);  // checks the available moves for the board
            if (board[r][c] == ' ' && direction.reduce((a, b) => a + b) != 0) {  // if the square is empty and a move can be made on it            
                gameOver = false;  // the game isnt over as moves can be made
                if (gameMode != 2) {  // if one of the ai options is enabled
                    var score = direction.reduce(function (a, b) { return a + b }, 0);  // gets the sum of all captures in each direction
                    console.log("score -> " + score);
                    if (score > idealMove[0]) {  // if this move scores better than the previous option
                        idealMove[0] = score;  // assigns the first item in the array to the new high score
                        idealMove[1] = [[r, c, direction]]  // assigns the row, column and direction of the move to the second item in the array

                    } else if (score == idealMove[0]) {  // if the score is equal to the previous
                        idealMove[1].push([r, c, direction]);  // add another row, column and direction to the second item of the array
                    }
                }
                if (gameMode == 2 || (gameMode == 1 && player == '0')) {
                    console.log("acá no entra nunca");
                    boardSquare.onclick = () => placePiece(r, c, direction);  // if its a humans move, allow the player to click the squares
                }
            }
        });
    });

    var find = findTotal(board);
    console.log("find ->" + find);
    if (!gameOver) {
        passCount = 0;  // reset pass count as a move has occured
        if (gameMode == 1) {  // if the game mode is 1player
            console.log("Aqui es");
            console.log("idealMove -> " + idealMove);
            if (player == 'w') { // if the current player is the AI then pick a random ideal move from the array of moves in 700 milliseconds
                placePiece(...idealMove[1][Math.floor(Math.random() * idealMove[1].length)].slice())
            }
        } else if (gameMode == 0) {  // else if the game mode is AI vs AI            
            move = setTimeout(function () { placePiece(...idealMove[1][Math.floor(Math.random() * idealMove[1].length)].slice()) }, e.options[e.selectedIndex].value);  // if the current player is the AI then pick a random ideal move from the array of moves after the dealy defined by the html dropdown
        } else if (gameMode == 2) {  // else if the game mode is 2 player
        }
    } else if (!find) {  // if there are still empty spaces available to play
        setTimeout(function () { pass() }, 1);  // pass the current players go automatically
    }
}


function placePiece(r, c, direction) {
    console.log("placePiece r: ->" + r + " c: -> " + c + "direccion -> " + direction)
    var fila = r.toString();
    var columna = c.toString();
    respuesta = fila + columna;
    console.log("respuesta -> " + respuesta);
    return respuesta;
}

function capture(board, r, c, direction) {
    console.log("capture");

    for (var i = 0; i <= direction.length; i++) {  // loop over direction
        for (var z = 1; z <= direction[i]; z++) {  // loop over amount in current direction
            if (i < 2) { var x = dir[i] * z, y = 0; }  // first capture horizontal pieces...
            else if (i < 4) { var x = 0, y = dir[i - 2] * z; }  // then vertical pieces...
            else if (i < 6) { var x = dir[i - 4] * z, y = x; }  // then diagonal...
            else { var x = dir[i - 6] * z, y = -x; }  // then the other diagonal
            board[r - x][c - y] = player.toLowerCase();  // set current piece to players colour
        }
    }
}

function checkMove(board, r, c, player) {  // board, row, column, player
    var direction = [0, 0, 0, 0, 0, 0, 0, 0]; // top bottom left right topLeft bottomRight BottomLeft TopRight
    for (var i = 0; i < 8; i++) {  // loops over the directions
        if (i < 2) { var x = dir[i], y = 0; }  // first checks horizontal...
        else if (i < 4) { var x = 0, y = dir[i - 2]; }  // then vertical...
        else if (i < 6) { var x = dir[i - 4], y = x; }  // then diagonal...
        else { var x = dir[i - 6], y = -x; }  // ..then the other diagonal
        try {  // try because it may be referencing a coordinate that doesn't exist (off the board)
            while (checkPlay[board[r - x][c - y]] == checkPlay[player] * -1) {  // while there are consecutive enemy peices
                direction[i] += 1;  // increases the count of direction
                if (i < 2) { x += dir[i]; }  // first incriments the horizontal...
                else if (i < 4) { y += dir[i - 2]; }  // then the vertical...
                else if (i < 6) { x += dir[i - 4]; y = x; }  // then diagonal...
                else { x += dir[i - 6]; y = -x; }  // then the other diagonal
            }
            if (board[r - x][c - y] != player) {  // if consective enemy pieces aren't surrounded by a friendly piece
                direction[i] = 0;  // reset this direction to 0
            }
        } catch { // if the coordinate doesn't exist
            direction[i] = 0;  // reset this direction to 0
        }
    }
    return direction  // return the result
}

// finds the total for each player
function findTotal(board, end = false) {
    board = board.map(r => r.slice()); // deep clone of array
    var blackTotal = 0, whiteTotal = 0;  // reset totals
    for (i = 0; i < board.length; i++) {  // loop over board rows
        for (j = 0; j < board[i].length; j++) {  // loop over row squares
            if (board[i][j] == 'w') {  // if current square has a white piece on it
                whiteTotal += 1;  // incriment the white total
            } else if (board[i][j] == 'b') {  // if current square has a black piece on it
                blackTotal += 1;  // incriment black total
            }
        }
    }
    if (whiteTotal + blackTotal == 64 || whiteTotal == 0 || blackTotal == 0 || end) {  // if the game is over
        if (whiteTotal > blackTotal) {  // if white scored higher
        } else if (blackTotal > whiteTotal) {  // if black scored higher           
        } else {  // if neither scored higher            
        }
        return true  // true as game is over
    }
    return false  // false as game is not over yet
}


// passes the current players go
function pass() {
    if (gameMode != 2 && passCount < 2) {  // if game mode is not 2 player and less than 2 consecutive passes have occured
        passCount += 1;  // incriment pass count
        player = (player == 'w') ? 'b' : 'w';  // switch current player
        renderBoard();  // render changes
    } else if (passCount >= 2) {  // no moves can be made as 2 passes occured (neither player can make a move)
        findTotal(board, true);  // find the total as the game is over
    }
}
