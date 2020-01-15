import {promiseDeal} from "./retrieve_cards";
import cardSize from './card_dimensions';
import {winWidth, winHeight, ctx} from './canvas';

export default function draw_shared (playedCard) {

    promiseDeal.then(function(playerData) {

        let position = playedCard.playerID - playerData[1] - 1;

        // If everyone has passed, clear the table.
        if (playedCard.card == -2) {
            ctx.clearRect(0, 0, winWidth, cardSize.vPos);
        }
        // Case if passed.
        else if (playedCard.card == -1)
            print_pass(position);
        // Otherwise draw the played card.
        else {
            print_card(playedCard.card, position);
        }

        display_turn(playedCard.playerTurn);
    });
}

function print_pass(position) {
    let coord = position_to_coord(position, 'card');
    ctx.clearRect(coord[0], coord[1], cardSize.width, cardSize.height);
    ctx.textAlign = 'center';
    coord = position_to_coord(position, 'text');
    ctx.fillText('Pass', coord[0], coord[1]);
}

function print_card(cardNum, position) {
    let coord = position_to_coord(position, 'card');
    let cardImg = new Image();
    cardImg.onload = function () {
        ctx.drawImage(cardImg, coord[0], coord[1], cardSize.width, cardSize.height);
    }
    cardImg.src = 'client/images/cards/' + cardNum + '.png';
}

function display_turn(turn) {
    // Display player turn.
    ctx.clearRect(winWidth / 2 - 25, winHeight / 2 - 45, 35, 50);
    ctx.textAlign = 'center';
    ctx.fillText('player ' + turn + ' to play', winWidth / 2, winHeight / 2);
}

function position_to_coord(position, type) {
    var coord = [];
    if (position < 0) position += 4;

    if (type == 'card') {
        if (position == 0) {
            coord[0] = (winWidth - cardSize.width) / 2;
            coord[1] = cardSize.vPos - cardSize.height - 10;
        } else if (position == 1) {
            coord[0] = 10;
            coord[1] = (winHeight - cardSize.height) / 2;
        } else if (position == 2) {
            coord[0] = (winWidth - cardSize.width) / 2;
            coord[1] = 10;
        } else {
            coord[0] = winWidth - cardSize.width - 10;
            coord[1] = (winHeight - cardSize.height) / 2;
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