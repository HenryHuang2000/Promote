// Interface for the cards. Every player has 26 cards.
import cardSize from './card_dimensions';
import {const_ctx} from './canvas';

export default function draw_cards (playerData) {
    console.log('drawing cards');
    let playerCards = playerData[0];
    // Sort the cards for better readability.
    playerCards.sort((a, b) => a - b);
    // Draw the cards.
    generic_draw_cards(playerCards, 0, cardSize.vPos);    
}

export function generic_draw_cards(playerCards, xPos, yPos) {

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
                let hPos = xPos + (cardSize.width / 2) * i + 10;
                const_ctx.drawImage(card, hPos, yPos, cardSize.width, cardSize.height);
            });
        }).catch((err) => {
            console.error(err);
        });
}