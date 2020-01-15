import {socket} from './retrieve_cards';
import {winHeight, winWidth, ctx} from './canvas';

socket.on('waitingRoom', function(rooms) {

    let newRoom  = document.getElementById('new-room');
    let roomName = document.getElementById('roomName');
    newRoom.onsubmit = function(e) {
        e.preventDefault();
        console.log(roomName.value);
    }

    // Background.
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)'
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
    }
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
            })
            
        }
    }  
})

