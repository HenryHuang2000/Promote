import {winWidth, winHeight, ctx} from "./canvas";

var socket = io();

let promiseDeal = new Promise(function(resolve, reject) {
    socket.on('dealCards', function(data) {
        // Show the pass button.
        document.getElementById('game').style.display = 'inline-block';
        ctx.clearRect(0, 0, winWidth, 280);
        console.log("dealing cards");
        ctx.textAlign = 'center';
        ctx.fillText('player 1 to play', winWidth / 2, winHeight / 2);
        let playerData = [data.playerCards, data.playerID, data.roomName];
        resolve(playerData);
    });
})


export {socket, promiseDeal};
