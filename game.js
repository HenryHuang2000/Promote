(function () {
  'use strict';

  function dealCards (numDecks) {

      // Create an array of all possible cards.
      let cards = [];
      // Add all cards exculding jokers.
      for (let i = 0; i < 52; i++) {
          // Push once per deck.
          for (let j = 0; j < numDecks; j++) {
              cards.push(i + 1);
          }
      }

      // Shuffle the cards using the Fisher-Yates shuffle.
      cards = shuffle(cards);

      // Distribute the cards amongst the players.
      const players = [];
      for (let i = 0; i < 4; i++) {
          players[i] = cards.slice(i * 52 * numDecks / 4, (i + 1) * 52 * numDecks / 4);
      }
      return players;
  }


  function shuffle(array) {
      var m = array.length, t, i;
      // While there remain elements to shuffle…
      while (m) {
    
          // Pick a remaining element…
          i = Math.floor(Math.random() * m--);
      
          // And swap it with the current element.
          t = array[m];
          array[m] = array[i];
          array[i] = t;
      }
    
      return array;
  }

  let numPlayers = 4;

  function server_connections(socket, io, ROOM_LIST, SOCKET_LIST) {
      // Handling new connections to home page.
      console.log('New home page connection assigned as player ' + socket.id);
      SOCKET_LIST[socket.id] = socket;
      to_lobby(socket, 'sendToLobby');


      // Handling new room request.
      socket.on('createNewRoom', function(room) {
          ROOM_LIST.push(room);
          to_lobby(io, 'refreshLobby');
      });


      // Joining a room.
      socket.on('roomJoined', function(room) {
          
          // Make sure that the room actually has space. 
          if (room_players(room.name) >= 4) {
              return;
          } else {
              socket.emit('joinRoom', {
                  name: room.name,
                  username: room.username
              });
              console.log(room.name + ' has been joined by ' + socket.id);
              socket.join(room.name);
              to_lobby(socket.broadcast, 'refreshLobby');
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

      function to_lobby(target, message) {
          target.emit(message, {
              roomList: ROOM_LIST,
              roomPlayers: ROOM_LIST.map(roomName => room_players(roomName.name))
          });
      }

      // Handling disconnects.
      socket.on('disconnect', function() {
          delete SOCKET_LIST[socket.id];
          to_lobby(socket.broadcast, 'refreshLobby');
          console.log('player ' + (socket.id) + ' disconnected');
      });
      return [SOCKET_LIST, ROOM_LIST];
  }

  function big_two_logic(socket, io, gameData) {

      socket.on('cardsPlayed', function(playerAction) {

          let cards = playerAction.selectedCards;
          // Check if it is player's turn to play..
          let mustPlay = (gameData.numCards == -1 && cards.length == 0);
          let legalTurn = (playerAction.playerID == gameData.playerTurn);
          let legalLength = (gameData.numCards == -1 || cards.length == gameData.numCards);
          
          // If pass.
          if (legalTurn && cards.length == 0 && !mustPlay) pass_logic();
          // If right turn and number of cards check that the cards are larger than prev.
          else if (legalTurn && legalLength && size_checker(gameData, cards) && cards.length != 0)
              legal_logic();
          // Process illegal plays.
          else {
              let reasons = [legalTurn, !mustPlay, legalLength, 
                             combo_checker(cards), size_checker(gameData, cards)];
                             
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

          function legal_logic() {
              // Tell the client move was legal.
              socket.emit('legalMove', {cards: cards});

              // Check if the player has won.
              if (gameData.cardCounter[gameData.playerTurn] - cards.length == 0) {
                  io.in(playerAction.roomName).emit('playerWon', {
                      winner: gameData.playerTurn
                  });
              }
              
              // Update gameData.
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



  function size_checker(gameData, cards) {
      if(!combo_checker(cards)) return false;

      // If first card to be played.
      if (gameData.numCards == -1) return true;
      // For singles, doubles and triples.
      if (cards.length <= 3 && (cards[0] > gameData.prevCards[0])) return true;

      // For 5 card combos.
      else if (cards.length == 5 && (combo_size(cards) > combo_size(gameData.prevCards))) 
          return true;

      return false;
  }

  function combo_checker(cards) {
      if (cards.length == 1) return true;
      // Keep an array of cardsNums.
      let cardNums = cards.map(card => card_to_num(card));

      // For doubles and triples.
      if (cards.length == 2 || cards.length == 3) {
          // Make sure the cards are the same number.
          for (let i = 0; i < cards.length - 1; i++) {
              if (cardNums[i] != cardNums[i + 1]) return false;
          }
          return true;
      }
      // For 5 card combos.
      else if (cards.length == 5 && combo_type(cards) != 0) return true;
      
      return false;
  }

  function card_to_num(card) {
      return Math.floor((card - 1) / 4);
  }

  function card_to_suit(card) {
      return (card - 1) % 4;
  }

  function combo_type(cards) {

      // Keep an array of cardsNums and cardSuits.
      let cardNums = cards.map(card => card_to_num(card));
      let cardSuits = cards.map(card => card_to_suit(card));

      // bomb, house, flush and straight represented in bits respectively.
      let comboType = 0xF;

      // Temporary arrays for houses and bombs.
      let cardNum1 = 0;
      let cardNum2 = 1;

      for (let i = 0; i < cards.length - 1; i++) {
          // Check for straights.
          if (cardNums[i] + 1 != cardNums[i + 1]) comboType &= 0xE;
          // Check for flushes.
          if (cardSuits[i] != cardSuits[i + 1]) comboType &= 0xD;
          // Sort for houses and bombs.
          if (cardNums[i] == cardNums[0]) cardNum1++;
          if (cardNums[i] == cardNums[cards.length - 1]) cardNum2++;
      }
      // Check for houses and bombs.
      if (cardNum1 + cardNum2 == 5) {
          // Check for houses.
          if (!(cardNum1 == 2 || cardNum2 == 2)) comboType &= 0xB;
          // Check for bombs.
          if (!(cardNum1 == 4 || cardNum2 == 4)) comboType &= 7;
      } else comboType &= 3;
      return comboType;
  }

  function combo_size(cards) {

      let comboType = combo_type(cards);
      // Make straight flushes the biggest.
      if (comboType == 3) comboType *= 3;
      // Create a size ranking first by comboType then within each combo.
      let comboSize = comboType * 52 + cards[cards.length - 1];

      // Flushes prioritise suit over number.
      if (comboType == 2) {
          let offset = card_to_suit(cards[4]) * 13 + card_to_num(cards[4]);
          comboSize = comboType * 52 + offset;
      }

      return comboSize;
  }

  var express = require('express');
  var app = express();
  var serv = require('http').Server(app);
  app.get('/',function(req, res) {
      res.sendFile(__dirname + '/client/index.html');
  });
  app.use('/client',express.static(__dirname + '/client'));
  serv.listen(process.env.PORT || 2000);
  console.log('Server started.');

  // Keeps a list of all connected players.
  var SOCKET_LIST = {};
  // Keeps a list of all rooms.
  let default_room = {
      name: 'Default room',
      gameMode: 'Big Two',
      password: ''
  };

  let ROOM_LIST = [default_room];

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
