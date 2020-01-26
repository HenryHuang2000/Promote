import {socket, promiseDeal} from "./retrieve_cards";
import draw_cards from './card_interface';
import './card_interactions';
import './waiting_room';
import './game_room';
import draw_shared, {print_info} from './shared_cards';


// Initial drawing of the cards when hand is dealt.
promiseDeal.then(function (playerData) {
    draw_cards(playerData);
    socket.on('initGame', data => print_info(playerData[1], data.firstPlayer + 1, 13));    
});
// Every time a card is played, update the shared canvas.
socket.on('cardPlayed', playedCards => draw_shared(playedCards));