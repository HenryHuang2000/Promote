import {lobby_canvas, lobby_ctx, winWidth, winHeight} from './canvas';
import { socket } from './retrieve_cards';
import draw_image from './drawing_tools';


let lobby_div = document.getElementById("lobby_div");
let roomName = document.getElementById("roomName");
let gameMode = document.getElementById("gameMode");
let password = document.getElementById("password");
let submitButton = document.getElementById("submitButton");


export default function new_room() {

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


    }
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
            }
            socket.emit('createNewRoom', newRoom);
            clear_canvas();
        }
    }
}



export function join_room_info(room) {

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
    }
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