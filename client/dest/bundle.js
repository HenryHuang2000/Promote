(function () {
        'use strict';

        // Setup canvas in proportion to the window.
        const const_canvas = document.getElementById("const_canvas");
        const const_ctx = const_canvas.getContext('2d');

        var int_canvas = document.getElementById("int_canvas");
        var ctx = int_canvas.getContext("2d");
        int_canvas.style.background = "none";

        const winWidth  = window.innerWidth;
        const winHeight = window.innerHeight;

        const_canvas.width  = winWidth;
        const_canvas.height = winHeight;

        int_canvas.width  = winWidth;
        int_canvas.height = winHeight;

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

        var socket = io();

        let promiseDeal = new Promise(function(resolve, reject) {
            socket.on('dealCards', function(data) {
                
                const_ctx.clearRect(0, 0, winWidth, 280);
                const_ctx.fillStyle = 'grey';

                // If player holds diamond 3, tell server.
                if (data.playerCards.includes(1)) {
                    console.log(data);
                    socket.emit('firstToPlay', {player: data.playerID, roomName: data.roomName});
                    const_ctx.fillStyle = 'orange';
                }

                // Show the pass button.
                let passBtn = new Image();
                passBtn.onload = function () {
                    const_ctx.drawImage(passBtn, 30, cardSize.vPos - 50, 93, 43);
                };
                passBtn.src = 'client/images/pass_button.png';

                // Show the play button.
                let playBtn = new Image();
                playBtn.onload = function () {
                    const_ctx.drawImage(playBtn, winWidth - 123, cardSize.vPos - 50, 93, 43);
                };
                playBtn.src = 'client/images/play_button.png';

                console.log("dealing cards");
                let playerData = [data.playerCards, data.playerID, data.roomName];
                resolve(playerData);
            });
        });

        // Interface for the cards. Every player has 26 cards.

        function draw_cards (playerData) {
            console.log('drawing cards');
            let playerCards = playerData[0];
            // Sort the cards for better readability.
            playerCards.sort((a, b) => a - b);
            // Draw the cards.
            _draw_cards(playerCards);    
        }

        function _draw_cards (playerCards) {

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
                        const_ctx.drawImage(card, hPos, cardSize.vPos, cardSize.width, cardSize.height);
                    });
                }).catch((err) => {
                    console.error(err);
                });
        }

        let clickedCards = [];

        function clicked(event, playerData) {


            


            let playerCards = playerData[0];
            let x = event.clientX;
            let y = event.clientY;
            // If a card is clicked.
            let trayWidth = 10 + cardSize.width * (playerCards.length + 1) / 2;
            if (x > 10 && x < trayWidth && y > cardSize.vPos) {
                
                let selectWidth = cardSize.width / 2;
                // Check which card was clicked.
                let cardIndex = Math.floor(2 * (x - 10) / cardSize.width);
                // Last card is double width.
                if (cardIndex == playerCards.length) cardIndex--;
                if (cardIndex == playerCards.length - 1) selectWidth *= 2;

                let selectPos = 10 + cardSize.width * cardIndex / 2;
                
                // If clicked, unclick.
                if (clickedCards[cardIndex] == 1) {
                    ctx.clearRect(selectPos, cardSize.vPos, selectWidth, cardSize.height);
                    clickedCards[cardIndex] = 0;
                } 
                // Show which card was clicked.
                else {
                    clickedCards[cardIndex] = 1;
                    ctx.fillStyle = 'rgb(0, 191, 255, 0.55)';
                    ctx.fillRect(selectPos, cardSize.vPos, selectWidth, cardSize.height);
                }
            }

            // If play button is clicked.
            else if (x > winWidth - 123 && x < winWidth - 30 && y > cardSize.vPos - 53 && y < cardSize.vPos - 10) {
                
                // Unselect the selected cards.
                ctx.clearRect(0, cardSize.vPos, winWidth, winHeight);

                let selectedCards = [];
                // Convert clicked cards into actual cards selected.
                for (let i = 0; i < clickedCards.length; i++) {
                    if (clickedCards[i] == 1) {
                        selectedCards.push(playerCards[i]);
                    }
                }
                // Clear the clicked cards array.
                clickedCards = [];
                // Tell the server which card was played.
                socket.emit('cardsPlayed', {
                    playerID: playerData[1],
                    selectedCards: selectedCards,
                    roomName: playerData[2]
                });
            }
        }

        promiseDeal.then(function(playerData) {

            // // Implement passing.
            // let gameForm = document.getElementById('gameForm');
            // let passButton = document.getElementById('pass');
            // let passed = false;
            // gameForm.onsubmit = function(e) {
            //     e.preventDefault();
            //     passButton.onclick = socket.emit('cardClicked', {
            //         playerID: playerData[1],
            //         clickedCard: -1,
            //         roomName: playerData[2]
            //     })
            // }

            // Implement card selection.
            int_canvas.addEventListener("click", event => clicked(event, playerData));

            // If the played card was legal, 
            // redraw the client screen with the cards removed.
            socket.on('legalMove', function(played) {
                // Remove common elements.
                playerData[0] = playerData[0].filter(val => !played.cards.includes(val));

                const_ctx.clearRect(0, cardSize.vPos, winWidth, winHeight);
                draw_cards([playerData[0], playerData[1]]);
            });


            // If the played card was illegal, tell the user why.
            socket.on('illegalMove', function(data) {
                
                let reason = data.reasons.indexOf(false);
                switch (reason) {
                    case 0:
                        alert('It is not your turn to play.');
                        break;
                    case 1:
                        alert('You have played the wrong number of cards.');
                        break;
                    case 2:
                    default:
                        alert('The cards you play must be larger than the previous player.');
                        break;
                }

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
            const_ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            const_ctx.fillRect(0, 0, winWidth, winHeight);
            const_ctx.shadowColor = 'black';
            const_ctx.shadowBlur  = 15;
            const_ctx.fillRect(100, 100, winWidth - 200, winHeight - 200);

            let background = new Image();
            background.onload = function () {
                // Blue background.
                const_ctx.drawImage(background, 100, 100, winWidth - 200, winHeight - 200);

                // Text.
                const_ctx.font = "60px Arial";
                const_ctx.textAlign = "center";
                const_ctx.fillStyle = 'black';
                const_ctx.shadowBlur = 2;
                const_ctx.fillText('Welcome to Promote', winWidth / 2, 200);
                const_ctx.font = "bold 20px Arial";
                const_ctx.textAlign = "left";
                const_ctx.shadowBlur = 0;
                const_ctx.fillText('Create a room: ', 150, 300);


                // Rooms box.
                const_ctx.fillStyle = 'grey';
                const_ctx.shadowBlur = 3;
                const_ctx.fillRect(125, 350, winWidth - 350, winHeight - 500);

                // Show existing rooms.
                let numRooms = rooms.roomList.length;
                for (let i = 0; i < numRooms; i++) {
                
                    // Create new row.
                    const_ctx.fillStyle = '#909090';
                    const_ctx.shadowBlur = 3;
                    const_ctx.fillRect(125, 350 + 30 * i, winWidth - 350, 30);

                    // Print the room name.
                    const_ctx.font = "bold 20px Arial";
                    const_ctx.textAlign = "left";
                    const_ctx.shadowBlur = 0;
                    const_ctx.fillStyle = 'black';
                    const_ctx.fillText(rooms.roomList[i], 150, 372 + 30 * i);

                    // Print number of players in room.
                    const_ctx.textAlign = "right";
                    const_ctx.fillText(rooms.roomPlayers[i] + ' / 4', winWidth - 280, 372 + 30 * i);
                    
                }
            };
            background.src = 'client/images/home_background.jpg';

            // Join a room.
            int_canvas.addEventListener("click", clicked);
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
            const_ctx.clearRect(0, 0, winWidth, winHeight);

            // Shows what room you are in.
            const_ctx.font = "60px Arial";
            const_ctx.textAlign = 'left';
            const_ctx.fillText('You are waiting for players', 100, 100);
            const_ctx.fillText('room name: ' + room.name, 100, 180);
        });

        const sharedHeight = cardSize.vPos - 50;

        function draw_shared (playedCards) {

            promiseDeal.then(function(playerData) {

                // Display info.
                print_info(playerData[1], playedCards.playerTurn, 13);

                let position = playedCards.playerID - playerData[1] - 1;
                // // If everyone has passed, clear the table.
                // if (playedCards.card == -2) {
                //     const_ctx.clearRect(0, 0, winWidth, cardSize.vPos);
                // } 
                // // Case if passed.
                // else if (playedCards.card == -1)
                //     print_pass(position);

                // Otherwise draw the played card.
                print_cards(playedCards.cards, position);
            });
        }



        function print_info(curPlayer, playerTurn, numCards) {

            const_ctx.shadowBlur = 3;
            for (let position = 0; position < 4; position++) {
                
                // Indicate player turn.
                const_ctx.fillStyle = 'grey';
                if ((curPlayer + position) % 4 + 1 == playerTurn) const_ctx.fillStyle = 'orange';
          
                if (position == 0) {
                    const_ctx.fillRect(150, cardSize.vPos - 50, winWidth - 300, 40);
                }
                // Load cardbacks.
                else if (position == 2) {
                    let cardBack = new Image();
                    cardBack.onload = function () {
                        let startPos = (winWidth - (numCards + 1) * 25) / 2;
                        for (let i = 0; i < numCards; i++) {
                            const_ctx.drawImage(cardBack, startPos + i * 25, 5, 50, 70);
                        }
                    };
                    cardBack.src = 'client/images/cards/card_back_vertical.png';
                    // Print playerTurn bar.
                    const_ctx.fillRect(winWidth / 2 - sharedHeight / 4, 80, sharedHeight / 2, 30);
                }
                else {
                    let xPos = 5;
                    if (position == 1) {     
                        const_ctx.fillRect(80, sharedHeight / 4, 30, sharedHeight / 2);
                    }
                    else if (position == 3) {
                        const_ctx.fillRect(winWidth - 110, sharedHeight / 4, 30, sharedHeight / 2);
                        xPos = winWidth - 75;
                    }
                    let cardBack = new Image();
                    cardBack.onload = function () {
                        let startPos = (sharedHeight - (numCards + 1) * 25) / 2;
                        for (let i = 0; i < numCards; i++) {
                            const_ctx.drawImage(cardBack, xPos, startPos + i * 25, 70, 50);
                        }
                    };
                    cardBack.src = 'client/images/cards/card_back_horizontal.png';
                }
            }
            
        }

        function print_cards(cards, position) {
            let coord = position_to_coord(position, cards.length, 'card');
            let cardImg = new Image();
            cardImg.onload = function () {
                const_ctx.drawImage(cardImg, coord[0], coord[1], cardSize.width, cardSize.height);
            };
            cardImg.src = 'client/images/cards/' + cards[0] + '.png';
        }

        function position_to_coord(position, numCards, type) {
            var coord = [];
            if (position < 0) position += 4;

            let offset = cardSize.width * (numCards + 1) / 2;

            if (type == 'card') {
                if (position == 0) {
                    coord[0] = (winWidth - offset) / 2;
                    coord[1] = sharedHeight - cardSize.height - 10;
                } else if (position == 1) {
                    coord[0] = 120;
                    coord[1] = (sharedHeight - cardSize.height) / 2;
                } else if (position == 2) {
                    coord[0] = (winWidth - offset) / 2;
                    coord[1] = 120;
                } else {
                    coord[0] = winWidth - offset - 120;
                    coord[1] = (sharedHeight - cardSize.height) / 2;
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
        promiseDeal.then(function (playerData) {
            draw_cards(playerData);
            socket.on('initGame', data => print_info(playerData[1], data.firstPlayer + 1, 13));    
        });
        // Every time a card is played, update the shared canvas.
        socket.on('cardPlayed', playedCards => draw_shared(playedCards));

}());
