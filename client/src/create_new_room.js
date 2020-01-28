import {lobby_canvas, lobby_ctx, winWidth, winHeight} from './canvas';
import { socket } from './retrieve_cards';

export default function new_room() {

    document.getElementById("lobby_div").style.display = 'inline';
    let background = new Image();
    background.onload = function () {
        
        // Buttons.
        let backButton = new Image();
        backButton.onload = function () {
            lobby_ctx.drawImage(backButton, winWidth / 4 + 90, 3/4 * winHeight, 204, 84);
        }
        backButton.src = 'client/images/back_button.png';
        let confirmButton = new Image();
        confirmButton.onload = function () {
            lobby_ctx.drawImage(confirmButton, winWidth * 3/4 - 320, 3/4 * winHeight, 204, 84);
        }
        confirmButton.src = 'client/images/confirm_create_room.png';

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
        document.getElementById("roomName").style.display = 'block';
        document.getElementById("roomName").style.left = winWidth / 2 + 'px';

        // game Select Dropdown
        document.getElementById("gameSelect").style.display = 'block';
        document.getElementById("gameSelect").style.left = winWidth / 2 + 'px';

        // Room name box.
        document.getElementById("password").style.display = 'block';
        document.getElementById("password").style.left = winWidth / 2 + 'px';


    }
    background.src = 'client/images/new_room_background.jpg';

    // Clicking buttons.
    lobby_canvas.addEventListener("click", function() {
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
                    name: document.getElementById("roomName").value,
                    gameMode: document.getElementById("roomName").value
                }
                socket.emit('createNewRoom', newRoom);
                clear_canvas();
            }
        }
    });
}

function clear_canvas() {
    // Clear the fields.
    document.getElementById("roomName").value = '';
    document.getElementById("password").value = '';
    // Clear canvas.
    lobby_ctx.clearRect(0, 0, winWidth, winHeight);
    document.getElementById("lobby_div").style.display = 'none';
}