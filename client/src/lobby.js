import {socket} from './retrieve_cards';
import {winHeight, winWidth, const_ctx} from './canvas';
import new_room, { join_room_info } from './lobby_rooms';
import draw_image from './drawing_tools';

socket.on('sendToLobby', function(rooms) {

    const_ctx.clearRect(0, 0, winWidth, winHeight);
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
        draw_image('create_room_button.png', const_ctx, 130, 290, 169, 50);

        // Rooms box.
        const_ctx.fillStyle = 'grey';
        const_ctx.shadowBlur = 3;
        const_ctx.fillRect(125, 350, winWidth - 350, winHeight - 500);

        show_rooms(rooms);
    }
    background.src = 'client/images/home_background.jpg';
})

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