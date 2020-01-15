import {socket, promiseDeal} from './retrieve_cards';
import cardSize from './card_dimensions';
import drawCards from './card_interface';
import {winWidth, winHeight, ctx} from './canvas';

promiseDeal.then(function(playerData) {

    // Implement passing.
    let gameForm = document.getElementById('gameForm');
    let passButton = document.getElementById('pass');
    let passed = false;
    gameForm.onsubmit = function(e) {
        e.preventDefault();
        passButton.onclick = socket.emit('cardClicked', {
            playerID: playerData[1],
            clickedCard: -1,
            roomName: playerData[2]
        })
    }

    let playerCards = playerData[0];
    // Implement card clicks.
    canvas.addEventListener("click", clicked);
    function clicked(event) {
        let x = event.clientX;
        let y = event.clientY;
        // If a card is clicked.
        let trayWidth = 10 + cardSize.width * (playerCards.length + 1) / 2;
        if ((x > 10 && x < trayWidth && y > cardSize.vPos)) {
            // Check which card was clicked.
            let cardIndex = Math.floor(2 * (x - 10) / cardSize.width);
            // Last card is double width.
            if (cardIndex == playerCards.length) cardIndex--;
            // Tell the server which card was played.
            socket.emit('cardClicked', {
                playerID: playerData[1],
                clickedCard: playerCards[cardIndex],
                index: cardIndex,
                roomName: playerData[2]
            })
        }
    }

    // If the played card was legal, 
    // redraw the client screen with the card removed.
    socket.on('legalMove', function(card) {
        playerCards.splice(card.index, 1);
        ctx.clearRect(0, cardSize.vPos, winWidth, winHeight);
        drawCards([playerCards, playerData[1]]);
    });
});


