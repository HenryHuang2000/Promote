import {winHeight, winWidth, ctx} from './canvas';
import { socket } from './retrieve_cards';

socket.on ('joinRoom', function(room) {

    document.getElementById('homepage').style.display = 'none';
    ctx.clearRect(0, 0, winWidth, winHeight);

    // Shows what room you are in.
    ctx.font = "60px Arial";
    ctx.textAlign = 'left';
    ctx.fillText('You are waiting for players', 100, 100);
    ctx.fillText('room name: ' + room.name, 100, 180);
})
