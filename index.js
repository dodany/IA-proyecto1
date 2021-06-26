const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 3000

var turno;  //ENTRADA
var estado; //ENTRADA
var respuesta; //RESPUESTA
var board = [];  //tablero
var dir = [1, -1];  // ARRAY EN DOS DIRECCIONES
var checkPlay = { 'w': 1, 'b': -1, ' ': 0 }  // CONVIERTE EL COLOR DEL JUGADOR EN NÚMERO. PARA ENCONTRAR PIEZAS ENEMIGAS
var gameMode = 1;  // 1 - 1player
var passCount = 0;  // CUANTAS VECES CONSECUTIVAS PASA
var player;  // JUGADOR

express()
    .use(express.static(path.join(__dirname, 'public')))
    .get('/', function (req, res) {
        turno = req.query.turno; //TURNO
        estado = req.query.estado; //ESTADO
        newGame()
        res.send(String(respuesta));  //RESPONSE
    })
    .listen(PORT, () => console.log(`Listening on ${PORT}`))

//OBTIENE LA MATRIZ DE LA ENTRADA 
function convertArray(estado) {
    console.log("converArreglo(estado");
    var tablero = [];     //DECLARAR LA MATRIZ
    for (var i = 0; i < 64; i = i + 8) {
        tablero.push(row_(estado.slice(i, i + 8)));  //INSERTA CADA 8   
    }
    return tablero; //DEVUELVE LA MATRIZ
}

//OBTIENE LA FILA DE LA ENTRADA
function row_(slice_) {
    var fila = [];  //DECLARA LA FILA
    for (var i = 0; i < 8; i = i + 1) {
        fila.push(letter(slice_.slice(i, i + 1)));
    }
    return fila;  //DEVUELVE LA FILA
}

//OBTIENE LA LETRA EN JUEGO DEL ESTADO 
function letter(value) {
    if (value == '0') { //NEGRO
        return 'b';
    } else if (value == '1') { //BLANCO
        return 'w';
    } else {
        return ' '; // VACÍO =2
    }
}

//NUEVO TURNO 
function newGame() {    
    player = letter(turno); //EL JUEGADOR
    board = convertArray(estado); //EL TABLERO    
    
    /* CREO UNA MATRIZ ASÍ
    [[' ',' ',' ',' ',' ',' ',' ',' '],
    [' ',' ',' ',' ',' ',' ',' ',' '],
    [' ',' ',' ',' ',' ',' ',' ',' '],
    [' ',' ',' ','b','w',' ',' ',' '],
    [' ',' ',' ','w','b',' ',' ',' '],
    [' ',' ',' ',' ',' ',' ',' ',' '],
    [' ',' ',' ',' ',' ',' ',' ',' '],
    [' ',' ',' ',' ',' ',' ',' ',' ']]*/

    renderBoard(); //REVISAR EL TABLERO
    console.log("fin- newGame"); //FIN
}

//REVISAR EL TABLERO 
function renderBoard() {      
    var gameOver = true, idealMove = [0, []];  //VERIFICA LA PUNTUACIÓN DE LOS MOVIMIENTOS IDEALES
    board.forEach((row, r) => {  // LOOP DE LAS FILAS
        row.forEach((square, c) => {  // LOOP DE LAS COLUMNAS
            var direction = checkMove(board, r, c, player);  // COMPRUEBA LOS MOVIMIENTOS DISPONIBLES
            if (board[r][c] == ' ' && direction.reduce((a, b) => a + b) != 0) {  // SI ESTA VACÍO PUEDE HACER UN MOVIMIENTO EN ELLA
                gameOver = false;  // NO SE TERMINA EL JUEGO
                if (gameMode != 2) {  // MODO IA 
                    var score = direction.reduce(function (a, b) { return a + b }, 0);  // OBTIENE LA SUMA DE CADA DIRECCION                    
                    if (score > idealMove[0]) {  // EL MOVIMIENTO PUNTUA MEJOR QUE LA OPCIÓN ANTERIOR
                        idealMove[0] = score;  // ASIGNA EL PRIMER ELEMENTO DE LA MATRIZ MÁS ALTA
                        idealMove[1] = [[r, c, direction]] 
                    } else if (score == idealMove[0]) {  // SI LA PUNTUACIÓN ES IGUAL A LA ANTERIOR
                        idealMove[1].push([r, c, direction]);  // AGREGA OTRA FILA Y COLUMNA Y DIRECCION AL OTRO ELEMENTO DE LA MATRIZ
                    }
                }                
            }
        });
    });

    var find = findTotal(board);   // VERIFICA SI EL JUEGO NO SE HA TERMINADO 
    if (!gameOver) { //NO TERMINA EL JUEGO 
        passCount = 0;  //RESETEO LA VARIABLE PARA CONTAR LOS PASOS
        if (gameMode == 1) {  // MODO DE JUEGO IA                           
                placePiece(...idealMove[1][Math.floor(Math.random() * idealMove[1].length)].slice());  //VALOR DE LA FILA Y LA COLUMNA          
        } 
    } else if (!find) {  // SI TODAVÍA HAY ESPACIOS DISPONIBLES PARA JUGAR 
        setTimeout(function () { pass() }, 1);  
    }
}

//LA RESPUESTA DEL JUEGO
function placePiece(r, c, direction) {
    console.log("RESPUESTA r: ->" + r + " c: -> " + c + " direccion -> " + direction);    
    respuesta = r.toString() + c.toString();    //CONCATENAR LA FILA Y COLUMNA
    return respuesta;  //ESTA ES LA RESPUESTA DEL JUEGO 
}

//VERIFICA LOS MOVIMIENTOS
function checkMove(board, r, c, player) {  // TABLERO, FILA , COLUMNA , JUGADOR
    var direction = [0, 0, 0, 0, 0, 0, 0, 0]; // TOP, BOTTOM, LEFT, RIGHT ...
    for (var i = 0; i < 8; i++) {  // loops over the directions
        if (i < 2) { var x = dir[i], y = 0; }  // CHEQUEO HORIZONTAL
        else if (i < 4) { var x = 0, y = dir[i - 2]; }  // CHEQUEO VERTICAL
        else if (i < 6) { var x = dir[i - 4], y = x; }  // CHEQUEO DIAGONAL
        else { var x = dir[i - 6], y = -x; }  // SINO LA OTRA DIAGONAL
        try {  
            while (checkPlay[board[r - x][c - y]] == checkPlay[player] * -1) {  // MIENTRAS HAYAN PIEZAS ENEMIGAS CONSECUTIVAS
                direction[i] += 1;  // AUMENTAMOS LA DIRECTION
                if (i < 2) { x += dir[i]; }  // INCREMENTO HORIZONTAL
                else if (i < 4) { y += dir[i - 2]; }  //INCREMENTO VERTICAL
                else if (i < 6) { x += dir[i - 4]; y = x; }  // INCREMENTO DIAGONAL
                else { x += dir[i - 6]; y = -x; }  // INCREMENTO EN LA OTRA DIAGONAL
            }
            if (board[r - x][c - y] != player) {  // SI LAS PIEZAS ENEMIGAS CONSECUTIVAS NO ESTÁN RODEADAS POR UNA PIEZA AMIGA
                direction[i] = 0;  // RESET A 0
            }
        } catch { //SI LA COORDENADA NO EXISTE
            direction[i] = 0;  // RESET A 0
        }
    }
    return direction  // RETURN
}

// OBTIENE EL TOTAL POR JUGADOR
function findTotal(board, end = false) {
    board = board.map(r => r.slice()); // TABLERO EN ARRAYS
    var blackTotal = 0, whiteTotal = 0;  //  RESET DE BLANCAS Y NEGRAS
    for (i = 0; i < board.length; i++) {  // LOOP POR ROWS
        for (j = 0; j < board[i].length; j++) {  // LOOP POR COLUMNAS
            if (board[i][j] == 'w') {  // SI LA PIEZA ES BLANCA
                whiteTotal += 1;  // AUMENTAMOS
            } else if (board[i][j] == 'b') {  // SINO ES NEGRA
                blackTotal += 1;  // AUMENTAMOS
            }
        }
    }
    if (whiteTotal + blackTotal == 64 || whiteTotal == 0 || blackTotal == 0 || end) {  //AQUÍ SE TERMINÓ EL JUEGO      
        return true  // EL JUEGO TERMINÓ , GAME IS OVER 
    }
    return false  // EL JUEGO NO TERMINA
}

// CUENTA LOS PASES DE LOS JUGADORES
function pass() {
    if (gameMode != 2 && passCount < 2) {  // MENOS DE 2 PASOS CONSECUTIVOS
        passCount += 1;  // INCREMENTO 
        player = (player == 'w') ? 'b' : 'w';  // CAMBIO DE JUGADOR
        renderBoard();  // REVISAMOS EL TABLERO
    } else if (passCount >= 2) {  // NO SE PUEDE HACER ESTE MOVIMIENTO
        findTotal(board, true);  // MANDAMOS A TERMINAR EL JUEGO
    }
}