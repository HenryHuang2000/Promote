import {socket} from './retrieve_cards';
import {winHeight, winWidth, const_ctx, int_canvas} from './canvas';
import new_room from './create_new_room';

socket.on('sendToLobby', function(rooms) {


    console.log(rooms);
    // Background blur.
    const_ctx.fillStyle = 'rgba(255, 255, 255, 0.3)'
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
        let newRoomButton = new Image();
        newRoomButton.onload = function () {
            const_ctx.drawImage(newRoomButton, 130, 290, 169, 50);
        }
        newRoomButton.src = 'client/images/create_room_button.png';

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
            
        }
    }
    background.src = 'client/images/home_background.jpg';

    // Handle Clicks.
    int_canvas.addEventListener("click", function() {
        let x = event.clientX;
        let y = event.clientY;
    
        130, 290, 169, 50
        // If create room is clicked.
        if (x > 130 && x < 300 && y > 290 && y < 340) {
            console.log('new room');
            new_room();
        }
    
    
        // If a room is clicked.
        if (x > 125 && x < winWidth - 225 && y > 350 && y < 350 + 30 * rooms.roomList.length) {
    
            // Check which room was clicked.
            let roomNum = Math.floor((y - 350) / 30);
    
            // Tell the server which room to join.
            socket.emit('roomJoined', {
                name: rooms.roomList[roomNum],
                roomNum: roomNum
            })
        }
    });
})


