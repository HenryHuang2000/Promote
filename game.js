(function () {
    'use strict';

    function dealCards (numDecks) {

        // Create an array of all possible cards.
        const cards = [];
        // No jokers for now.
        for (let i = 0; i < 52; i++) {
            // Push once per deck.
            for (let j = 0; j < numDecks; j++) {
                cards.push(i + 1);
            }
        }

        // Shuffle the cards.
        // Swap each card with a random card in the deck.
        let numShuffles = 10;
        for (let i = 0; i < cards.length * numShuffles; i++) {
            let randNum = Math.floor(Math.random() * 52 * numDecks);
            // Swap cards[i] with cards[randNum].
            let temp = cards[i % cards.length];
            cards[i % cards.length] = cards[randNum];
            cards[randNum] = temp;
        }

        // Distribute the cards amongst the players.
        const players = [];
        for (let i = 0; i < 4; i++) {
            players[i] = cards.slice(i * 52 * numDecks / 4, (i + 1) * 52 * numDecks / 4);
        }
        return players;
    }

    let numPlayers = 4;

    function server_connections(socket, io, ROOM_LIST, SOCKET_LIST) {
        // Handling new connections to home page.
        console.log('New home page connection assigned as player ' + socket.id);
        SOCKET_LIST[socket.id] = socket;
        socket.emit('waitingRoom', {
            roomList: ROOM_LIST,
            roomPlayers: ROOM_LIST.map(roomName => room_players(roomName))
        });
        // Joining a room.
        socket.on('roomJoined', function(room) {
            
            // Make sure that the room actually has space. 
            if (room_players(room.name) >= 4) {
                return;
            } else {
                socket.emit('joinRoom', {
                    name: room.name
                });
                console.log(room.name + ' has been joined by ' + socket.id);
                socket.join(room.name);
            }

            // If all players have joined, deal the cards.
            if (room_players(room.name) >= numPlayers) {
                console.log('all players joined.');
                deal_cards('big_two', room.name);
            }
            
        });


        function deal_cards(gameMode, roomName) {
            let numDecks = 1;
            if (gameMode != 'big_two') numDecks = 2;
            let players = dealCards(numDecks);
            let clients = io.nsps["/"].adapter.rooms[roomName];
            for (let i = 0; i < numPlayers; i++) {
                // Retrieve socket from socket list.
                SOCKET_LIST[Object.keys(clients.sockets)[i]].emit('dealCards', {
                    playerCards: players[i],
                    playerID: i,
                    roomName: roomName
                });
            }
        }

        function room_players(room) {
            let clients = io.nsps["/"].adapter.rooms[room];
            if (clients === undefined) return 0;
            return clients.length;
        }

        // Handling disconnects.
        socket.on('disconnect', function() {
            delete SOCKET_LIST[socket.id];
            console.log('player ' + (socket.id) + ' disconnected');
        });
        return [SOCKET_LIST, ROOM_LIST];
    }

    function big_two_logic(socket, io, gameData) {

        socket.on('cardClicked', function(playerAction) {

            let card = playerAction.clickedCard;
            // Check if playing the card is legal.
            let legal = (playerAction.playerID == gameData.playerTurn);
            // If legal and card is larger than previous.
            if (legal && card > gameData.prevCard) legal_logic();
            // If pass.
            else if (legal && card == -1) pass_logic();
            // Ignore illegal plays.
            else return;

            if (gameData.playerTurn == 4) gameData.playerTurn = 0;
            // Print the card played into the client side.
            io.in(playerAction.roomName).emit('cardPlayed', {
                card: card,
                playerID: playerAction.playerID + 1,
                playerTurn: gameData.playerTurn + 1
            });

            
            function legal_logic() {
                // Store the played card in the round list.
                gameData.ROUND_CARDS[playerAction.playerID] = card;
                socket.emit('legalMove', {index: playerAction.index});
                // Update prevCard.
                gameData.prevCard = card;
                gameData.playerTurn++;
            }

            function pass_logic() {
                gameData.ROUND_CARDS[playerAction.playerID] = card;
                // Check if the round has been won.
                let counter = 0;
                for (let token of gameData.ROUND_CARDS) {
                    if (token == -1) counter++;
                }
                // If someone has won the round.
                if (counter >= 3) {
                    // Clear the array.
                    gameData.ROUND_CARDS = [];
                    // Reset prevCard.
                    gameData.prevCard = -1;
                    // The winner can now play.
                    gameData.playerTurn = playerAction.playerID + 1;
                    // Clear the table.
                    card = -2;
                }
                // If the round is not won, next person plays.
                else {
                    gameData.playerTurn++;
                }
            }
        });
        return gameData;
    }

    var express = require('express');
    var app = express();
    var serv = require('http').Server(app);
    app.get('/',function(req, res) {
        res.sendFile(__dirname + '/client/index.html');
    });
    app.use('/client',express.static(__dirname + '/client'));
    serv.listen(2000);
    console.log('Server started.');

    // Keeps a list of all connected players.
    var SOCKET_LIST = {};
    // Keeps a list of all rooms.
    let ROOM_LIST = ['default_room'];

    // Keep track of game Data.
    let gameData = {
        ROUND_CARDS: [],
        playerTurn: 0,
        prevCard: -1
    };

    var io = require('socket.io')(serv,{});
    io.sockets.on('connection', function(socket){


        let lists = server_connections(socket, io, ROOM_LIST, SOCKET_LIST);
        SOCKET_LIST = lists[0];
        ROOM_LIST   = lists[1];

        gameData.ROUND_CARDS = [];
        gameData.playerTurn = 0;
        gameData.prevCard = -1;

        
        
        gameData = big_two_logic(socket, io, gameData);
    });

}());
