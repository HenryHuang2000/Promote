import {winWidth, winHeight, const_ctx} from "./canvas";
import cardSize from './card_dimensions';

var socket = io();

let promiseDeal = new Promise(function(resolve, reject) {
    socket.on('dealCards', function(data) {
        
        const_ctx.clearRect(0, 0, winWidth, 280);
        // Show the username bar.
        const_ctx.fillStyle = 'grey';
        const_ctx.shadowBlur = 3;
        const_ctx.fillRect(150, cardSize.vPos - 50, winWidth - 300, 40);

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
        const_ctx.textAlign = 'center';
        const_ctx.fillText('player 1 to play', winWidth / 2, winHeight / 2);
        let playerData = [data.playerCards, data.playerID, data.roomName];
        resolve(playerData);
    });
})


export {socket, promiseDeal};
