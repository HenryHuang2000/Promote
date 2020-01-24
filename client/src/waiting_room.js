import {socket} from './retrieve_cards';
import {winHeight, winWidth, const_ctx, int_canvas} from './canvas';

socket.on('waitingRoom', function(rooms) {

    let newRoom  = document.getElementById('new-room');
    let roomName = document.getElementById('roomName');
    newRoom.onsubmit = function(e) {
        e.preventDefault();
        console.log(roomName.value);
    }

    // Background.
    const_ctx.fillStyle = 'rgba(255, 255, 255, 0.3)'
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
    }
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
            })
            
        }
    }  
})

