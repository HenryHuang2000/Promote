(function () {
        'use strict';

        // Setup canvas in proportion to the window.
        const const_canvas = document.getElementById("const_canvas");
        const const_ctx = const_canvas.getContext('2d');

        const lobby_canvas = document.getElementById("lobby_canvas");
        const lobby_ctx = lobby_canvas.getContext("2d");

        const int_canvas = document.getElementById("int_canvas");
        const int_ctx = int_canvas.getContext("2d");

        const win_canvas = document.getElementById("win_canvas");
        const win_ctx = win_canvas.getContext("2d");

        const winWidth  = window.innerWidth;
        const winHeight = window.innerHeight;

        // Setting up canvas dimensions.
        const_canvas.width  = winWidth;
        const_canvas.height = winHeight;

        lobby_canvas.width  = winWidth;
        lobby_canvas.height = winHeight;

        int_canvas.width  = winWidth;
        int_canvas.height = winHeight;

        win_canvas.width  = winWidth;
        win_canvas.height = winHeight;

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
            generic_draw_cards(playerCards, 0, cardSize.vPos);    
        }

        function generic_draw_cards(playerCards, xPos, yPos) {

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
                        let hPos = xPos + (cardSize.width / 2) * i + 10;
                        const_ctx.drawImage(card, hPos, yPos, cardSize.width, cardSize.height);
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
            // Check for button clicks.
            let buttonClick = (x > 30 && x < 123) || (x > winWidth - 123 && x < winWidth - 30);
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
                    int_ctx.clearRect(selectPos, cardSize.vPos, selectWidth, cardSize.height);
                    clickedCards[cardIndex] = 0;
                } 
                // Show which card was clicked.
                else {
                    clickedCards[cardIndex] = 1;
                    int_ctx.fillStyle = 'rgb(0, 191, 255, 0.55)';
                    int_ctx.fillRect(selectPos, cardSize.vPos, selectWidth, cardSize.height);
                }
            }
            else if (buttonClick && y > cardSize.vPos - 53 && y < cardSize.vPos - 10) {
                
                // Unselect the selected cards.
                int_ctx.clearRect(0, cardSize.vPos, winWidth, winHeight);
                let selectedCards = [];

                // If play button clicked.
                if (x > winWidth - 123 && x < winWidth - 30) {
                    // Convert clicked cards into actual cards selected.
                    for (let i = 0; i < clickedCards.length; i++) {
                        if (clickedCards[i] == 1) {
                            selectedCards.push(playerCards[i]);
                        }
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
                // reasons = [legalTurn, !mustPlay, legalLength, combo_checker(cards), size_checker(cards)];
                let reason = data.reasons.indexOf(false);
                switch (reason) {
                    case 0:
                        alert('It is not your turn to play.');
                        break;
                    case 1:
                        alert('It is your turn to play any card.');
                        break;
                    case 2:
                        alert('You have played the wrong number of cards.');
                        break;
                    case 3:
                        alert('You have played an invalid combo.');
                        break;
                    case 4:
                    default:
                        alert('The cards you play must be larger than the previous player.');
                        break;
                }

            });
        });

        function draw_image(name, ctx, x, y, w, h) {

            let img = new Image();
            img.onload = function () {
                ctx.drawImage(img, x, y, w, h);
            };
            img.src = 'client/images/' + name;
        }

        let lobby_div = document.getElementById("lobby_div");
        let roomName = document.getElementById("roomName");
        let gameMode = document.getElementById("gameMode");
        let password = document.getElementById("password");
        let submitButton = document.getElementById("submitButton");


        function new_room() {

            lobby_ctx.clearRect(0, 0, winWidth, winHeight);
            lobby_div.style.display = 'inline';
            let background = new Image();
            background.onload = function () {
                
                // Buttons.
                draw_image('back_button.png', lobby_ctx, winWidth / 4 + 90, 3/4 * winHeight, 204, 84);
                draw_image('confirm_create_room.png', lobby_ctx, winWidth * 3/4 - 320, 3/4 * winHeight, 204, 84);

                // Background.
                lobby_ctx.fillStyle = 'rgb(0, 0, 0, 0.7)';
                lobby_ctx.fillRect(0, 0, winWidth, winHeight);
                lobby_ctx.shadowColor = 'black';
                lobby_ctx.shadowBlur = 50;
                lobby_ctx.fillRect(winWidth / 4, 150, winWidth / 2, winHeight * 3 / 4);
                lobby_ctx.drawImage(background, winWidth / 4, 150, winWidth / 2, winHeight * 3 / 4);

                // Title.
                lobby_ctx.font = "bold 60px Arial";
                lobby_ctx.textAlign = "center";
                lobby_ctx.shadowBlur = 0;
                lobby_ctx.fillStyle = 'black';
                lobby_ctx.fillText('Create a new Room', winWidth / 2, 220);

                // Room name text.
                lobby_ctx.font = "bold 30px Arial";
                lobby_ctx.textAlign = "left";
                lobby_ctx.fillText('Enter a room name: ', winWidth / 4 + 40, 320);

                // Select gamemode.
                lobby_ctx.fillText('Select a gamemode: ', winWidth / 4 + 40, 420);

                // Enter password.
                lobby_ctx.fillText('Enter a password: ', winWidth / 4 + 40, 520);
                lobby_ctx.fillText('(optional)', winWidth / 4 + 40, 550);
                
                // Room name box.
                roomName.style.display = 'block';
                roomName.style.left = winWidth / 2 + 'px';

                // game Select Dropdown
                gameMode.style.display = 'block';
                gameMode.style.left = winWidth / 2 + 'px';

                // Room name box.
                password.style.display = 'block';
                password.style.left = winWidth / 2 + 'px';


            };
            background.src = 'client/images/new_room_background.jpg';

            // Clicking buttons.
            lobby_canvas.addEventListener("click", newRoom_clicked);
        }


        function newRoom_clicked() {
            let x = event.clientX;
            let y = event.clientY;
            // Check click height.
            if (y > 3/4 * winHeight && y < 3/4 * winHeight + 84) {
                // Check if back clicked.
                if (x > winWidth / 4 + 90 && x < winWidth / 4 + 294) {
                    clear_canvas();
                }
                        
                else if (x > winWidth * 3/4 - 320 && x <  winWidth * 3/4 - 116) {
                    let newRoom = {
                        name: roomName.value,
                        gameMode: gameMode.value,
                        password: password.value
                    };
                    socket.emit('createNewRoom', newRoom);
                    clear_canvas();
                }
            }
        }



        function join_room_info(room) {

            // Hide old elements.    
            roomName.style.display = 'none';lobby_ctx.clearRect(0, 0, winWidth, winHeight);
            gameMode.style.display = 'none';
            password.style.display = 'none';
            lobby_ctx.clearRect(0, 0, winWidth, winHeight);
            lobby_div.style.display = 'inline';


            let background = new Image();
            background.onload = function () {
                // Background.
                lobby_ctx.fillStyle = 'rgb(0, 0, 0, 0.7)';
                lobby_ctx.fillRect(0, 0, winWidth, winHeight);
                lobby_ctx.shadowColor = 'black';
                lobby_ctx.shadowBlur = 50;
                lobby_ctx.fillRect(winWidth / 2 - 250, winHeight / 2 - 100, 500, 200);
                lobby_ctx.drawImage(background, winWidth / 2 - 250, winHeight / 2 - 100, 500, 200);


                // Enter username.
                lobby_ctx.font = "bold 30px Arial";
                lobby_ctx.textAlign = "left";
                lobby_ctx.fillText('Enter a username: ', winWidth / 2 - 200, winHeight / 2 - 50);

                // Password (optional).

                lobby_ctx.fillText('Password: ', winWidth / 2 - 200, winHeight / 2 + 25);

                // username box.
                roomName.style.display = 'block';
                roomName.style.top = winHeight / 2 - 35 + 'px';
                roomName.style.left = winWidth / 2 - 200 + 'px';

                // password box.
                console.log(room.password);
                if (room.password == '') {
                    password.disabled = true;
                }
                password.style.display = 'block';
                password.style.top = winHeight / 2 + 35 + 'px';
                password.style.left = winWidth / 2 - 200 + 'px';

                // Submit button.
                submitButton.style.display = 'block';
                submitButton.style.top = winHeight / 2 + 20 + 'px';
                submitButton.style.left = winWidth / 2 + 100 + 'px';
                submitButton.addEventListener("click", function() {
                    if (roomName.value == '') {
                        alert('Enter a username');
                    } else if (password.value == room.password) {
                        socket.emit('roomJoined', {
                            name: room.name,
                            username: roomName.value
                        });
                        clear_canvas();
                    } else {
                        alert('The password is incorrect');
                    }
                });



                // X button.
                draw_image('x_button.png', lobby_ctx, winWidth / 2 + 215, winHeight / 2 - 95, 30, 30);
            };
            background.src = 'client/images/new_room_background.jpg';

            lobby_canvas.addEventListener("click", joinRoom_clicked);
        }


        function joinRoom_clicked() {
            let x = event.clientX;
            let y = event.clientY;
            // Check click height.
            if (x > winWidth / 2 + 215 && x < winWidth / 2 + 245 
                && y > winHeight / 2 - 95 && y < winHeight / 2 - 65)
            {
                clear_canvas();    
            }
        }



        function clear_canvas() {

            roomName.style.top = 300 + 'px';
            password.style.top = 500 + 'px';
            submitButton.style.display = 'none';
            // Remove event listener.
            lobby_canvas.removeEventListener("click", newRoom_clicked);
            lobby_canvas.removeEventListener("click", joinRoom_clicked);
            // Clear the fields.
            roomName.value = '';
            password.value = '';
            // Clear canvas.
            lobby_ctx.clearRect(0, 0, winWidth, winHeight);
            lobby_div.style.display = 'none';
        }

        socket.on('sendToLobby', function(rooms) {

            const_ctx.clearRect(0, 0, winWidth, winHeight);
            console.log(rooms);
            // Background blur.
            const_ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            const_ctx.fillRect(0, 0, winWidth, winHeight);
            const_ctx.shadowColor = 'black';
            const_ctx.shadowBlur  = 15;
            const_ctx.fillRect(100, 100, winWidth - 200, winHeight - 200);

            let background = new Image();
            background.onload = function () {
                // Blue background.
                const_ctx.drawImage(background, 100, 100, winWidth - 200, winHeight - 200);

                // Title.
                const_ctx.font = "60px Arial";
                const_ctx.textAlign = "center";
                const_ctx.fillStyle = 'black';
                const_ctx.shadowBlur = 2;
                const_ctx.fillText('Welcome to Cardsparty', winWidth / 2, 200);

                // Create room button.
                draw_image('create_room_button.png', const_ctx, 130, 290, 169, 50);

                // Rooms box.
                const_ctx.fillStyle = 'grey';
                const_ctx.shadowBlur = 3;
                const_ctx.fillRect(125, 350, winWidth - 350, winHeight - 500);

                show_rooms(rooms);
            };
            background.src = 'client/images/home_background.jpg';
        });

        socket.on('refreshLobby', show_rooms);

        function show_rooms(rooms) {
            // Show existing rooms.
            let numRooms = rooms.roomList.length;
            for (let i = 0; i < numRooms; i++) {
            
                // Create new row.
                const_ctx.clearRect(125, 350 + 30 * i, winWidth - 350, 30);
                const_ctx.fillStyle = '#909090';
                const_ctx.fillRect(125, 350 + 30 * i, winWidth - 350, 30);
                // Draw separator.
                const_ctx.fillStyle = 'black';
                const_ctx.fillRect(125, 349.5 + 30 * (i + 1), winWidth - 350, 0.5);

                // Print the game mode.
                const_ctx.font = "bold 20px Arial";
                const_ctx.textAlign = "left";
                const_ctx.shadowBlur = 0;
                const_ctx.fillStyle = 'black';
                const_ctx.fillText(rooms.roomList[i].gameMode + ': ', 150, 372 + 30 * i);
                // Print the room name.
                const_ctx.fillText(rooms.roomList[i].name, 250, 372 + 30 * i);

                // Print number of players in room.
                const_ctx.textAlign = "right";
                const_ctx.fillText(rooms.roomPlayers[i] + ' / 4', winWidth - 280, 372 + 30 * i);

                // Print locked icon for locked rooms.
                if (rooms.roomList[i].password != '') {
                    console.log('test');
                    draw_image('locked_icon.png', const_ctx, winWidth - 265, 351 + 30 * i, 25, 25);
                }
            }
            click_handler(rooms);
        }

        function click_handler(rooms) {
           
            // Clear all previous event listeners.
            let old_element = document.getElementById("int_canvas");
            let new_element = old_element.cloneNode(true);
            old_element.parentNode.replaceChild(new_element, old_element);

            new_element.addEventListener("click", clicked);
            function clicked() {
                console.log('click');
                let x = event.clientX;
                let y = event.clientY;
            
                // If create room is clicked.
                if (x > 130 && x < 300 && y > 290 && y < 340) {
                    new_room();
                }
            
                // If a room is clicked.
                if (x > 125 && x < winWidth - 225 && y > 350 && y < 350 + 30 * rooms.roomList.length) {
                    
                    // int_canvas.removeEventListener("click", clicked);
                    // Check which room was clicked.
                    let roomNum = Math.floor((y - 350) / 30);
                    join_room_info(rooms.roomList[roomNum]);
                    // Tell the server which room to join.
                    //socket.emit('roomJoined', {name: rooms.roomList[roomNum].name});
                }
            }
        }

        socket.on ('joinRoom', function(room) {

            socket.off('sendToLobby');
            socket.off('refreshLobby');
            document.getElementById('lobby_canvas').style.display = 'none';
            const_ctx.clearRect(0, 0, winWidth, winHeight);


            console.log(room.username);
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
                print_info(playerData[1], playedCards.playerTurn, playedCards.cardCounter);
                // If everyone has passed, clear the table.
                if (playedCards.cards == 'clear_table') {
                    const_ctx.clearRect(115, 115, winWidth - 230, sharedHeight - 120);
                    return;
                }

                // Otherwise draw the played card.   
                print_cards(playedCards, playerData);
            });
        }



        function print_info(curPlayer, playerTurn, numCards) {

            if (numCards.length == 0) numCards = [13, 13, 13, 13];
            console.log(numCards);

            const_ctx.shadowBlur = 3;
            for (let position = 0; position < 4; position++) {
                
                let absPlayer = (curPlayer + position) % 4;
                // Indicate player turn.
                const_ctx.fillStyle = 'grey';
                if (absPlayer + 1 == playerTurn) const_ctx.fillStyle = 'orange';
                if (position == 0) {
                    const_ctx.fillRect(150, cardSize.vPos - 50, winWidth - 300, 40);
                }
                else if (position == 1) {     
                    const_ctx.fillRect(80, sharedHeight / 4, 30, sharedHeight / 2);
                }
                else if (position == 2) {
                    const_ctx.fillRect(winWidth / 2 - sharedHeight / 4, 80, sharedHeight / 2, 30);
                }
                else if (position == 3) {
                    const_ctx.fillRect(winWidth - 110, sharedHeight / 4, 30, sharedHeight / 2);
                }

                // Show how many cards each player has.
                if (position == 2) {
                    
                    let cardBack = new Image();
                    cardBack.onload = function () {
                        // Clear original cards.
                        const_ctx.clearRect(0, 0, winWidth, 75);
                        let startPos = (winWidth - (numCards[absPlayer] + 1) * 25) / 2;
                        for (let i = 0; i < numCards[absPlayer]; i++) {
                            const_ctx.drawImage(cardBack, startPos + i * 25, 5, 50, 70);
                        }
                    };
                    cardBack.src = 'client/images/cards/card_back_vertical.png';
                }
                else if (position != 0) {
                    let xPos = 0;
                    if (position == 3) xPos = winWidth - 75;
                    let cardBack = new Image();
                    cardBack.onload = function () {
                        // Clear original cards.
                        const_ctx.clearRect(xPos, 0, xPos + 75, sharedHeight);
                        let startPos = (sharedHeight - (numCards[absPlayer] + 1) * 25) / 2;
                        for (let i = 0; i < numCards[absPlayer]; i++) {
                            const_ctx.drawImage(cardBack, xPos, startPos + i * 25, 70, 50);
                        }
                    };
                    cardBack.src = 'client/images/cards/card_back_horizontal.png';
                }
                
            }
            
        }

        function print_cards(playedCards, playerData) {

            let position = playedCards.playerID - playerData[1] - 1;
            let cards = playedCards.cards;
            let coord = position_to_coord(position, cards.length, 'card');

            // Check for pass.
            if (cards.length == 0) return;

            generic_draw_cards(cards, coord[0], coord[1]);
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
                    coord[0] = 110;
                    coord[1] = (sharedHeight - cardSize.height) / 2;
                } else if (position == 2) {
                    coord[0] = (winWidth - offset) / 2;
                    coord[1] = 120;
                } else {
                    coord[0] = winWidth - offset - 130;
                    coord[1] = (sharedHeight - cardSize.height) / 2;
                }
            }
            return coord;
        }

        function win_screen(winner) {

            // Show the win canvas.
            win_canvas.style.display = "inline";

            // Draw the table.
            let table = new Image();
            table.onload = function() {

                win_ctx.drawImage(table, 0, 0, winWidth, winHeight);
                win_ctx.fillStyle = 'black';
                win_ctx.font = "bold 100px Arial";
                win_ctx.textAlign = "center";
                win_ctx.shadowBlur = 0;
                win_ctx.fillText('Player ' + winner + ' has won!', winWidth / 2, winHeight / 2);
            };
            table.src = "client/images/table.jpg";    
        }

        // Initial drawing of the cards when hand is dealt.
        promiseDeal.then(function (playerData) {
            draw_cards(playerData);
            socket.on('initGame', data => print_info(playerData[1], data.firstPlayer + 1, []));    
        });
        // Every time a card is played, update the shared canvas.
        socket.on('cardPlayed', playedCards => draw_shared(playedCards));

        // Listen for a winner.
        socket.on('playerWon', data => win_screen(data.winner + 1));

}());
