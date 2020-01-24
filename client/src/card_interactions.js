import {socket, promiseDeal} from './retrieve_cards';
import cardSize from './card_dimensions';
import drawCards from './card_interface';
import {winWidth, winHeight, const_ctx, int_canvas} from './canvas';
import clicked from './card_selector';

promiseDeal.then(function(playerData) {

    // // Implement passing.
    // let gameForm = document.getElementById('gameForm');
    // let passButton = document.getElementById('pass');
    // let passed = false;
    // gameForm.onsubmit = function(e) {
    //     e.preventDefault();
    //     passButton.onclick = socket.emit('cardClicked', {
    //         playerID: playerData[1],
    //         clickedCard: -1,
    //         roomName: playerData[2]
    //     })
    // }

    // Implement card selection.
    let playerCards = playerData[0];
    int_canvas.addEventListener("click", event => clicked(event, playerCards));

    // If the played card was legal, 
    // redraw the client screen with the card removed.
    socket.on('legalMove', function(card) {
        playerCards.splice(card.index, 1);
        const_ctx.clearRect(0, cardSize.vPos, winWidth, winHeight);
        drawCards([playerCards, playerData[1]]);
    });
});


