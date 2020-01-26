var express = require('express');
var app = express();
var serv = require('http').Server(app);
app.get('/',function(req, res) {
    res.sendFile(__dirname + '/client/index.html');
});
app.use('/client',express.static(__dirname + '/client'));
serv.listen(2000);
console.log('Server started.');

//********************************************************//

import server_connections from './server_connections';
import big_two_logic from './big_two_logic';

// Keeps a list of all connected players.
var SOCKET_LIST = {};
// Keeps a list of all rooms.
let ROOM_LIST = ['default_room'];

// Keep track of game Data.
let gameData = {
    ROUND_CARDS: [],
    playerTurn: 0,
    prevCards: [],
    numCards: -1
}

var io = require('socket.io')(serv,{});
io.sockets.on('connection', function(socket){


    let lists = server_connections(socket, io, ROOM_LIST, SOCKET_LIST);
    SOCKET_LIST = lists[0];
    ROOM_LIST   = lists[1];

    gameData.ROUND_CARDS = [];
    gameData.playerTurn = 0;
    gameData.prevCards = [];
    gameData.numCards = -1;

    // Determine who will play first.
    socket.on('firstToPlay', function(data) {
        gameData.playerTurn = data.player;
        io.in(data.roomName).emit('initGame', {firstPlayer: data.player});
    })

    gameData = big_two_logic(socket, io, gameData);
});