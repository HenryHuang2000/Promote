(function () {
    'use strict';

    // Setup canvas in proportion to the window.
    const canvas$1 = document.getElementById("canvas");
    const ctx = canvas$1.getContext('2d');

    const winWidth  = window.innerWidth;
    const winHeight = window.innerHeight;

    canvas$1.width  = winWidth;
    canvas$1.height = winHeight;

    var socket = io();

    let promiseDeal = new Promise(function(resolve, reject) {
        socket.on('dealCards', function(data) {
            // Show the pass button.
            document.getElementById('game').style.display = 'inline-block';
            ctx.clearRect(0, 0, winWidth, 280);
            console.log("dealing cards");
            ctx.textAlign = 'center';
            ctx.fillText('player 1 to play', winWidth / 2, winHeight / 2);
            let playerData = [data.playerCards, data.playerID, data.roomName];
            resolve(playerData);
        });
    });

    // Find suitable card dimensions.
    const maxCardHeight = (winWidth - 20) * 1.452 / 13.5;
    const cardHeight = maxCardHeight > winHeight / 5 ? winHeight / 5 : maxCardHeight;
    const cardWidth  = cardHeight / 1.452;
    const vPos = winHeight - cardHeight - 10;

    var cardSize = {
            height: cardHeight,
            width: cardWidth,
            vPos: vPos
    };

    // Interface for the cards. Every player has 26 cards.

    function drawCards (playerData) {
        console.log('drawing cards');
        let playerCards = playerData[0];
        // Sort the cards for better readability.
        playerCards.sort((a, b) => a - b);
        // Draw the cards.
        draw_cards(playerCards);

        // Shows your player number.
        print_player_number(playerData);
        
    }

    function draw_cards (playerCards) {
        // Load the cards.
        function loadCard(cardName) {
            return new Promise((resolve, reject) => {
                let cardImg = new Image();
                cardImg.addEventListener("load", () => {
                    resolve(cardImg);
                });
                cardImg.addEventListener("error", (err) => {
                    reject(err);
                });
                cardImg.src = 'client/images/cards/' + cardName + '.png';
            });
        }
        // If all the cards are loaded, draw the cards.
        Promise
            .all(playerCards.map(cardName => loadCard(cardName)))
            .then((card) => {
                card.forEach(function(card, i) {
                    let hPos = (cardSize.width / 2) * i + 10;
                    ctx.drawImage(card, hPos, cardSize.vPos, cardSize.width, cardSize.height);
                });
            }).catch((err) => {
                console.error(err);
            });
    }

    function print_player_number(playerData) {
        let playerID = playerData[1] + 1;
        let playerNumber = 'You are player ' + playerID + ' / 4';
        ctx.font = "60px Arial";
        ctx.textAlign = 'left';
        ctx.fillText(playerNumber, 100, 100);
    }

    promiseDeal.then(function(playerData) {

        // Implement passing.
        let gameForm = document.getElementById('gameForm');
        let passButton = document.getElementById('pass');
        gameForm.onsubmit = function(e) {
            e.preventDefault();
            passButton.onclick = socket.emit('cardClicked', {
                playerID: playerData[1],
                clickedCard: -1,
                roomName: playerData[2]
            });
        };

        let playerCards = playerData[0];
        // Implement card clicks.
        canvas.addEventListener("click", clicked);
        function clicked(event) {
            let x = event.clientX;
            let y = event.clientY;
            // If a card is clicked.
            let trayWidth = 10 + cardSize.width * (playerCards.length + 1) / 2;
            if ((x > 10 && x < trayWidth && y > cardSize.vPos)) {
                // Check which card was clicked.
                let cardIndex = Math.floor(2 * (x - 10) / cardSize.width);
                // Last card is double width.
                if (cardIndex == playerCards.length) cardIndex--;
                // Tell the server which card was played.
                socket.emit('cardClicked', {
                    playerID: playerData[1],
                    clickedCard: playerCards[cardIndex],
                    index: cardIndex,
                    roomName: playerData[2]
                });
            }
        }

        // If the played card was legal, 
        // redraw the client screen with the card removed.
        socket.on('legalMove', function(card) {
            playerCards.splice(card.index, 1);
            ctx.clearRect(0, cardSize.vPos, winWidth, winHeight);
            drawCards([playerCards, playerData[1]]);
        });
    });

    socket.on('waitingRoom', function(rooms) {

        let newRoom  = document.getElementById('new-room');
        let roomName = document.getElementById('roomName');
        newRoom.onsubmit = function(e) {
            e.preventDefault();
            console.log(roomName.value);
        };

        // Background.
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fillRect(0, 0, winWidth, winHeight);
        ctx.shadowColor = 'black';
        ctx.shadowBlur  = 15;
        ctx.fillRect(100, 100, winWidth - 200, winHeight - 200);

        let background = new Image();
        background.onload = function () {
            // Blue background.
            ctx.drawImage(background, 100, 100, winWidth - 200, winHeight - 200);

            // Text.
            ctx.font = "60px Arial";
            ctx.textAlign = "center";
            ctx.fillStyle = 'black';
            ctx.shadowBlur = 2;
            ctx.fillText('Welcome to Promote', winWidth / 2, 200);
            ctx.font = "bold 20px Arial";
            ctx.textAlign = "left";
            ctx.shadowBlur = 0;
            ctx.fillText('Create a room: ', 150, 300);

            // Rooms box.
            ctx.fillStyle = 'grey';
            ctx.shadowBlur = 3;
            ctx.fillRect(125, 350, winWidth - 350, winHeight - 500);

            // Show existing rooms.
            let numRooms = rooms.roomList.length;
            for (let i = 0; i < numRooms; i++) {
            
            // Create new row.
            ctx.fillStyle = '#909090';
            ctx.shadowBlur = 3;
            ctx.fillRect(125, 350 + 30 * i, winWidth - 350, 30);

            // Print the room name.
            ctx.font = "bold 20px Arial";
            ctx.textAlign = "left";
            ctx.shadowBlur = 0;
            ctx.fillStyle = 'black';
            ctx.fillText(rooms.roomList[i], 150, 372 + 30 * i);

            // Print number of players in room.
            ctx.textAlign = "right";
            ctx.fillText(rooms.roomPlayers[i] + ' / 4', winWidth - 280, 372 + 30 * i);
            
        }
        };
        background.src = 'client/images/home_background.jpg';

        // Join a room.
        canvas.addEventListener("click", clicked);
        function clicked(event) {
            let x = event.clientX;
            let y = event.clientY;

            // If a room is clicked.
            if (x > 125 && x < winWidth - 225 && 
                y > 350 && y < 350 + 30 * rooms.roomList.length)
            {
                
                // Check which room was clicked.
                let roomNum = Math.floor((y - 350) / 30);

                // Tell the server which room to join.
                socket.emit('roomJoined', {
                    name: rooms.roomList[roomNum],
                    roomNum: roomNum
                });
                
            }
        }  
    });

    socket.on ('joinRoom', function(room) {

        document.getElementById('homepage').style.display = 'none';
        ctx.clearRect(0, 0, winWidth, winHeight);

        // Shows what room you are in.
        ctx.font = "60px Arial";
        ctx.textAlign = 'left';
        ctx.fillText('You are waiting for players', 100, 100);
        ctx.fillText('room name: ' + room.name, 100, 180);
    });

    function draw_shared (playedCard) {

        promiseDeal.then(function(playerData) {

            let position = playedCard.playerID - playerData[1] - 1;

            // If everyone has passed, clear the table.
            if (playedCard.card == -2) {
                ctx.clearRect(0, 0, winWidth, cardSize.vPos);
            }
            // Case if passed.
            else if (playedCard.card == -1)
                print_pass(position);
            // Otherwise draw the played card.
            else {
                print_card(playedCard.card, position);
            }

            display_turn(playedCard.playerTurn);
        });
    }

    function print_pass(position) {
        let coord = position_to_coord(position, 'card');
        ctx.clearRect(coord[0], coord[1], cardSize.width, cardSize.height);
        ctx.textAlign = 'center';
        coord = position_to_coord(position, 'text');
        ctx.fillText('Pass', coord[0], coord[1]);
    }

    function print_card(cardNum, position) {
        let coord = position_to_coord(position, 'card');
        let cardImg = new Image();
        cardImg.onload = function () {
            ctx.drawImage(cardImg, coord[0], coord[1], cardSize.width, cardSize.height);
        };
        cardImg.src = 'client/images/cards/' + cardNum + '.png';
    }

    function display_turn(turn) {
        // Display player turn.
        ctx.clearRect(winWidth / 2 - 25, winHeight / 2 - 45, 35, 50);
        ctx.textAlign = 'center';
        ctx.fillText('player ' + turn + ' to play', winWidth / 2, winHeight / 2);
    }

    function position_to_coord(position, type) {
        var coord = [];
        if (position < 0) position += 4;

        if (type == 'card') {
            if (position == 0) {
                coord[0] = (winWidth - cardSize.width) / 2;
                coord[1] = cardSize.vPos - cardSize.height - 10;
            } else if (position == 1) {
                coord[0] = 10;
                coord[1] = (winHeight - cardSize.height) / 2;
            } else if (position == 2) {
                coord[0] = (winWidth - cardSize.width) / 2;
                coord[1] = 10;
            } else {
                coord[0] = winWidth - cardSize.width - 10;
                coord[1] = (winHeight - cardSize.height) / 2;
            }
        }
        else if (type == 'text') {
            if (position == 0) {
                coord[0] = winWidth / 2;
                coord[1] = cardSize.vPos - 50;
            } else if (position == 1) {
                coord[0] = 100;
                coord[1] = winHeight / 2;
            } else if (position == 2) {
                coord[0] = winWidth / 2;
                coord[1] = 60;
            } else {
                coord[0] = winWidth - 100;
                coord[1] = winHeight / 2;
            }
        } 
        return coord;
    }

    // Initial drawing of the cards when hand is dealt.
    promiseDeal.then(playerData => drawCards(playerData));
    // Every time a card is played, update the shared canvas.
    socket.on('cardPlayed', playedCard => draw_shared(playedCard));

}());
