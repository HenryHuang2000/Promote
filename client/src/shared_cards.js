import {promiseDeal} from "./retrieve_cards";
import cardSize from './card_dimensions';
import {winWidth, winHeight, const_ctx} from './canvas';

const sharedHeight = cardSize.vPos - 50;

export default function draw_shared (playedCards) {

    promiseDeal.then(function(playerData) {

        // Display info.
        print_info(playerData[1], playedCards.playerTurn, 13);

        let position = playedCards.playerID - playerData[1] - 1;
        // // If everyone has passed, clear the table.
        // if (playedCards.card == -2) {
        //     const_ctx.clearRect(0, 0, winWidth, cardSize.vPos);
        // } 
        // // Case if passed.
        // else if (playedCards.card == -1)
        //     print_pass(position);

        // Otherwise draw the played card.
        print_cards(playedCards.cards, position);
    });
}



export function print_info(curPlayer, playerTurn, numCards) {

    const_ctx.shadowBlur = 3;
    for (let position = 0; position < 4; position++) {
        
        // Indicate player turn.
        const_ctx.fillStyle = 'grey';
        if ((curPlayer + position) % 4 + 1 == playerTurn) const_ctx.fillStyle = 'orange';
  
        if (position == 0) {
            const_ctx.fillRect(150, cardSize.vPos - 50, winWidth - 300, 40);
        }
        // Load cardbacks.
        else if (position == 2) {
            let cardBack = new Image();
            cardBack.onload = function () {
                let startPos = (winWidth - (numCards + 1) * 25) / 2;
                for (let i = 0; i < numCards; i++) {
                    const_ctx.drawImage(cardBack, startPos + i * 25, 5, 50, 70);
                }
            }
            cardBack.src = 'client/images/cards/card_back_vertical.png';
            // Print playerTurn bar.
            const_ctx.fillRect(winWidth / 2 - sharedHeight / 4, 80, sharedHeight / 2, 30);
        }
        else {
            let xPos = 5;
            if (position == 1) {     
                const_ctx.fillRect(80, sharedHeight / 4, 30, sharedHeight / 2);
            }
            else if (position == 3) {
                const_ctx.fillRect(winWidth - 110, sharedHeight / 4, 30, sharedHeight / 2);
                xPos = winWidth - 75;
            }
            let cardBack = new Image();
            cardBack.onload = function () {
                let startPos = (sharedHeight - (numCards + 1) * 25) / 2;
                for (let i = 0; i < numCards; i++) {
                    const_ctx.drawImage(cardBack, xPos, startPos + i * 25, 70, 50);
                }
            }
            cardBack.src = 'client/images/cards/card_back_horizontal.png';
        }
    }
    
}

function print_pass(position) {
    let coord = position_to_coord(position, 'card');
    const_ctx.clearRect(coord[0], coord[1], cardSize.width, cardSize.height);
    const_ctx.textAlign = 'center';
    coord = position_to_coord(position, 'text');
    const_ctx.fillText('Pass', coord[0], coord[1]);
}

function print_cards(cards, position) {
    let coord = position_to_coord(position, cards.length, 'card');
    let cardImg = new Image();
    cardImg.onload = function () {
        const_ctx.drawImage(cardImg, coord[0], coord[1], cardSize.width, cardSize.height);
    }
    cardImg.src = 'client/images/cards/' + cards[0] + '.png';
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
            coord[0] = 120;
            coord[1] = (sharedHeight - cardSize.height) / 2;
        } else if (position == 2) {
            coord[0] = (winWidth - offset) / 2;
            coord[1] = 120;
        } else {
            coord[0] = winWidth - offset - 120;
            coord[1] = (sharedHeight - cardSize.height) / 2;
        }
    }
    else if (type == 'text') {
        if (position == 0) {
            coord[0] = winWidth / 2;
            coord[1] = cardSize.vPos - 50;
        } else if (position == 1) {
            coord[0] = 100;
            coord[1] = winHeight / 2;
        } else if (position == 2) {
            coord[0] = winWidth / 2;
            coord[1] = 60;
        } else {
            coord[0] = winWidth - 100;
            coord[1] = winHeight / 2;
        }
    } 
    return coord;
}