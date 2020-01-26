import {socket, promiseDeal} from './retrieve_cards';
import cardSize from './card_dimensions';
import draw_cards from './card_interface';
import {winWidth, winHeight, const_ctx, int_canvas, ctx} from './canvas';
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
    int_canvas.addEventListener("click", event => clicked(event, playerData));

    // If the played card was legal, 
    // redraw the client screen with the cards removed.
    socket.on('legalMove', function(played) {
        // Remove common elements.
        playerData[0] = playerData[0].filter(val => !played.cards.includes(val));

        const_ctx.clearRect(0, cardSize.vPos, winWidth, winHeight);
        draw_cards([playerData[0], playerData[1]]);
    });


    // If the played card was illegal, tell the user why.
    socket.on('illegalMove', function(data) {
        // reasons = [legalTurn, legalLength, combo_checker(cards), size_checker(cards)];
        let reason = data.reasons.indexOf(false);
        switch (reason) {
            case 0:
                alert('It is not your turn to play.');
                break;
            case 1:
                alert('You have played the wrong number of cards.');
                break;
            case 2:
                alert('You have played an invalid combo.');
                break;
            case 3:
            default:
                alert('The cards you play must be larger than the previous player.');
                break;
        }

    });
});


