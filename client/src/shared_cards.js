import {promiseDeal} from "./retrieve_cards";
import cardSize from './card_dimensions';
import {winWidth, winHeight, const_ctx} from './canvas';
import {generic_draw_cards} from './card_interface';

const sharedHeight = cardSize.vPos - 50;

export default function draw_shared (playedCards) {

    promiseDeal.then(function(playerData) {

        // Display info.
        print_info(playerData[1], playedCards.playerTurn, playedCards.cardCounter);
        // If everyone has passed, clear the table.
        if (playedCards.cards == 'clear_table') {
            const_ctx.clearRect(115, 115, winWidth - 230, sharedHeight - 120);
            return;
        }

        // Otherwise draw the played card.   
        print_cards(playedCards, playerData);
    });
}



export function print_info(curPlayer, playerTurn, numCards) {

    if (numCards.length == 0) numCards = [13, 13, 13, 13];
    console.log(numCards);

    const_ctx.shadowBlur = 3;
    for (let position = 0; position < 4; position++) {
        
        let absPlayer = (curPlayer + position) % 4;
        // Indicate player turn.
        const_ctx.fillStyle = 'grey';
        if (absPlayer + 1 == playerTurn) const_ctx.fillStyle = 'orange';
        if (position == 0) {
            const_ctx.fillRect(150, cardSize.vPos - 50, winWidth - 300, 40);
        }
        else if (position == 1) {     
            const_ctx.fillRect(80, sharedHeight / 4, 30, sharedHeight / 2);
        }
        else if (position == 2) {
            const_ctx.fillRect(winWidth / 2 - sharedHeight / 4, 80, sharedHeight / 2, 30);
        }
        else if (position == 3) {
            const_ctx.fillRect(winWidth - 110, sharedHeight / 4, 30, sharedHeight / 2);
        }

        // Show how many cards each player has.
        if (position == 2) {
            
            let cardBack = new Image();
            cardBack.onload = function () {
                // Clear original cards.
                const_ctx.clearRect(0, 0, winWidth, 75);
                let startPos = (winWidth - (numCards[absPlayer] + 1) * 25) / 2;
                for (let i = 0; i < numCards[absPlayer]; i++) {
                    const_ctx.drawImage(cardBack, startPos + i * 25, 5, 50, 70);
                }
            }
            cardBack.src = 'client/images/cards/card_back_vertical.png';
        }
        else if (position != 0) {
            let xPos = 0;
            if (position == 3) xPos = winWidth - 75;
            let cardBack = new Image();
            cardBack.onload = function () {
                // Clear original cards.
                const_ctx.clearRect(xPos, 0, xPos + 75, sharedHeight);
                let startPos = (sharedHeight - (numCards[absPlayer] + 1) * 25) / 2;
                for (let i = 0; i < numCards[absPlayer]; i++) {
                    const_ctx.drawImage(cardBack, xPos, startPos + i * 25, 70, 50);
                }
            }
            cardBack.src = 'client/images/cards/card_back_horizontal.png';
        }
        
    }
    
}

function print_cards(playedCards, playerData) {

    let position = playedCards.playerID - playerData[1] - 1;
    let cards = playedCards.cards;
    let coord = position_to_coord(position, cards.length, 'card');

    // Check for pass.
    if (cards.length == 0) return;

    generic_draw_cards(cards, coord[0], coord[1]);
}

function display_turn(turn) {
    // Display player turn.
    const_ctx.clearRect(winWidth / 2 - 25, winHeight / 2 - 45, 35, 50);
    const_ctx.textAlign = 'center';
    const_ctx.fillText('player ' + turn + ' to play', winWidth / 2, winHeight / 2);
}

function position_to_coord(position, numCards, type) {
    var coord = [];
    if (position < 0) position += 4;

    let offset = cardSize.width * (numCards + 1) / 2;

    if (type == 'card') {
        if (position == 0) {
            coord[0] = (winWidth - offset) / 2;
            coord[1] = sharedHeight - cardSize.height - 10;
        } else if (position == 1) {
            coord[0] = 110;
            coord[1] = (sharedHeight - cardSize.height) / 2;
        } else if (position == 2) {
            coord[0] = (winWidth - offset) / 2;
            coord[1] = 120;
        } else {
            coord[0] = winWidth - offset - 130;
            coord[1] = (sharedHeight - cardSize.height) / 2;
        }
    }
    return coord;
}