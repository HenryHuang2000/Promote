// Interface for the cards. Every player has 26 cards.
import cardSize from './card_dimensions';
import {const_ctx} from './canvas';

export default function draw_cards (playerData) {
    console.log('drawing cards');
    let playerCards = playerData[0];
    // Sort the cards for better readability.
    playerCards.sort((a, b) => a - b);
    // Draw the cards.
    _draw_cards(playerCards);    
}

function _draw_cards (playerCards) {

    // Load the cards.
    function loadCard(cardName) {
        return new Promise((resolve, reject) => {
            let cardImg = new Image();
            cardImg.addEventListener("load", () => {
                resolve(cardImg);
            });
            cardImg.addEventListener("error", (err) => {
                reject(err);
            });
            cardImg.src = 'client/images/cards/' + cardName + '.png';
        });
    }
    // If all the cards are loaded, draw the cards.
    Promise
        .all(playerCards.map(cardName => loadCard(cardName)))
        .then((card) => {
            card.forEach(function(card, i) {
                let hPos = (cardSize.width / 2) * i + 10;
                const_ctx.drawImage(card, hPos, cardSize.vPos, cardSize.width, cardSize.height);
            });
        }).catch((err) => {
            console.error(err);
        });
}