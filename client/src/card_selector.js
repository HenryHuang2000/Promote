import cardSize from './card_dimensions';
import {winWidth, winHeight, int_ctx} from './canvas';
import {socket} from './retrieve_cards';

let clickedCards = [];

export default function clicked(event, playerData) {

    let playerCards = playerData[0];
    let x = event.clientX;
    let y = event.clientY;
    // If a card is clicked.
    let trayWidth = 10 + cardSize.width * (playerCards.length + 1) / 2;
    // Check for button clicks.
    let buttonClick = (x > 30 && x < 123) || (x > winWidth - 123 && x < winWidth - 30);
    if (x > 10 && x < trayWidth && y > cardSize.vPos) {
        
        let selectWidth = cardSize.width / 2;
        // Check which card was clicked.
        let cardIndex = Math.floor(2 * (x - 10) / cardSize.width);
        // Last card is double width.
        if (cardIndex == playerCards.length) cardIndex--;
        if (cardIndex == playerCards.length - 1) selectWidth *= 2;

        let selectPos = 10 + cardSize.width * cardIndex / 2;
        
        // If clicked, unclick.
        if (clickedCards[cardIndex] == 1) {
            int_ctx.clearRect(selectPos, cardSize.vPos, selectWidth, cardSize.height);
            clickedCards[cardIndex] = 0;
        } 
        // Show which card was clicked.
        else {
            clickedCards[cardIndex] = 1;
            int_ctx.fillStyle = 'rgb(0, 191, 255, 0.55)';
            int_ctx.fillRect(selectPos, cardSize.vPos, selectWidth, cardSize.height);
        }
    }
    else if (buttonClick && y > cardSize.vPos - 53 && y < cardSize.vPos - 10) {
        
        // Unselect the selected cards.
        int_ctx.clearRect(0, cardSize.vPos, winWidth, winHeight);
        let selectedCards = [];

        // If play button clicked.
        if (x > winWidth - 123 && x < winWidth - 30) {
            // Convert clicked cards into actual cards selected.
            for (let i = 0; i < clickedCards.length; i++) {
                if (clickedCards[i] == 1) {
                    selectedCards.push(playerCards[i]);
                }
            }
        }
        // Clear the clicked cards array.
        clickedCards = [];

        // Tell the server which card was played.
        socket.emit('cardsPlayed', {
            playerID: playerData[1],
            selectedCards: selectedCards,
            roomName: playerData[2]
        })
    }
}