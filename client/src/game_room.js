import {winHeight, winWidth, const_ctx} from './canvas';
import { socket } from './retrieve_cards';

socket.on ('joinRoom', function(room) {

    document.getElementById('homepage').style.display = 'none';
    const_ctx.clearRect(0, 0, winWidth, winHeight);

    // Shows what room you are in.
    const_ctx.font = "60px Arial";
    const_ctx.textAlign = 'left';
    const_ctx.fillText('You are waiting for players', 100, 100);
    const_ctx.fillText('room name: ' + room.name, 100, 180);
})
