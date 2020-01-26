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

        socket.on('cardsPlayed', function(playerAction) {

            let cards = playerAction.selectedCards;
            // Check if it is player's turn to play..
            let legalTurn = (playerAction.playerID == gameData.playerTurn);
            let legalLength = (gameData.numCards == -1 || cards.length == gameData.numCards);
            // If right turn and number of cards check that the cards are larger than prev.
            if (legalTurn && legalLength && size_checker(cards)) legal_logic();
            // If pass.
            else if (legalTurn && cards.length == 0) pass_logic();
            // Ignore illegal plays.
            else {
                let reasons = [legalTurn, legalLength, combo_checker(cards), size_checker(cards)];
                socket.emit('illegalMove', {reasons: reasons});
                return;
            }

            gameData.playerTurn %= 4;
            // Print the card played into the client side.
            io.in(playerAction.roomName).emit('cardPlayed', {
                cards: cards,
                playerID: playerAction.playerID + 1,
                playerTurn: gameData.playerTurn + 1,
                cardCounter: gameData.cardCounter
            });


            function size_checker(cards) {
                if(!combo_checker(cards)) return false;

                // If first card to be played.
                if (gameData.numCards == -1) return true;
                // For singles, doubles and triples
                let larger = Math.max.apply(null, cards) > Math.max.apply(null, gameData.prevCards);
                if (cards.length <= 3 && larger) return true;

                return false;
            }

            function combo_checker(cards) {
                // For doubles
                if (cards.length == 2 || cards.length == 3) {
                    // Make sure the cards are the same number.
                    for (let i = 0; i < cards.length - 1; i++) {
                        if (Math.floor((cards[i] - 1) / 4) != Math.floor((cards[i + 1] - 1) / 4)) return false;
                    }
                }
                return true;
            }
            
            function legal_logic() {

                // Tell the client move was legal.
                socket.emit('legalMove', {cards: cards});

                // Check if the player has won.
                if (gameData.cardCounter[gameData.playerTurn] - cards.length == 0) {
                    io.in(playerAction.roomName).emit('playerWon', {winner: gameData.playerTurn});
                }
                
                // Update gameData.
                console.log('legal move');
                gameData.cardCounter[gameData.playerTurn] -= cards.length;
                gameData.playerTurn++;
                gameData.prevCards = cards;
                gameData.numCards = cards.length;
                gameData.passCounter = 0;

                
                
            }

            function pass_logic() {
                gameData.passCounter++;
                gameData.playerTurn++;
                // If someone has won the round.
                if (gameData.passCounter >= 3) {
                    //Reset gameData.
                    gameData.passCounter = 0;
                    gameData.prevCards = [];
                    gameData.numCards = -1;
                    // The winner can now play.
                    gameData.playerTurn = playerAction.playerID + 1;
                    // Clear the table.
                    cards = 'clear_table';
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
        prevCards: [],
        numCards: -1,
        passCounter: 0,
        cardCounter: [13, 13, 13, 13]
    };

    var io = require('socket.io')(serv,{});
    io.sockets.on('connection', function(socket){


        let lists = server_connections(socket, io, ROOM_LIST, SOCKET_LIST);
        SOCKET_LIST = lists[0];
        ROOM_LIST   = lists[1];

        gameData.ROUND_CARDS = [];
        gameData.playerTurn = 0;
        gameData.prevCards = [];
        gameData.numCards = -1;
        gameData.passCounter = 0;
        gameData.cardCounter = [13, 13, 13, 13];

        // Determine who will play first.
        socket.on('firstToPlay', function(data) {
            gameData.playerTurn = data.player;
            io.in(data.roomName).emit('initGame', {firstPlayer: data.player});
        });

        gameData = big_two_logic(socket, io, gameData);
    });

}());
