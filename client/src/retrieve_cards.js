import {winWidth, winHeight, const_ctx} from "./canvas";
import cardSize from './card_dimensions';

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
        }
        passBtn.src = 'client/images/pass_button.png';

        // Show the play button.
        let playBtn = new Image();
        playBtn.onload = function () {
            const_ctx.drawImage(playBtn, winWidth - 123, cardSize.vPos - 50, 93, 43);
        }
        playBtn.src = 'client/images/play_button.png';

        console.log("dealing cards");
        let playerData = [data.playerCards, data.playerID, data.roomName];
        resolve(playerData);
    });
})


export {socket, promiseDeal};
