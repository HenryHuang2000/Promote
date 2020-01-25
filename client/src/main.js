import {socket, promiseDeal} from "./retrieve_cards";
import drawCards from './card_interface';
import './card_interactions';
import './waiting_room';
import './game_room';
import draw_shared from './shared_cards';


// Initial drawing of the cards when hand is dealt.
promiseDeal.then(playerData => drawCards(playerData));
// Every time a card is played, update the shared canvas.
draw_shared();
socket.on('cardPlayed', playedCards => draw_shared(playedCards));