export default function big_two_logic(socket, io, gameData) {

    socket.on('cardsPlayed', function(playerAction) {

        let cards = playerAction.selectedCards;
        // Check if it is player's turn to play..
        let legalTurn = (playerAction.playerID == gameData.playerTurn);
        console.log(gameData.numCards);
        console.log(cards.length);
        let legalLength = (gameData.numCards == -1 || cards.length == gameData.numCards);
        // If right turn and number of cards check that the cards are larger than prev.
        if (legalTurn && legalLength && size_checker(cards)) legal_logic();

        // // If pass.
        // else if (legalTurn && card == -1) pass_logic();

        // Ignore illegal plays.
        else return;


        gameData.playerTurn %= 4;
        // Print the card played into the client side.
        io.in(playerAction.roomName).emit('cardPlayed', {
            cards: cards,
            playerID: playerAction.playerID + 1,
            playerTurn: gameData.playerTurn + 1
        });


        // let gameData = {
        //     ROUND_CARDS: [],
        //     playerTurn: 0,
        //     prevCards: [],
        //     numCards: -1
        // }


        function size_checker(cards) {
            // If first card to be played.
            if (gameData.numCards == -1) return 1;
            // For singles
            if (cards.length == 1 && 
                Math.max.apply(null, cards) > Math.max.apply(null, gameData.prevCards)) return 1;
        }
        
        function legal_logic() {

            // Tell the client move was legal.
            socket.emit('legalMove', {cards: cards});
            
            // Update gameData.
            console.log('legal move');
            gameData.playerTurn++;
            gameData.prevCards = cards;
            gameData.numCards = cards.length;
            
        }

        function pass_logic() {
            gameData.ROUND_CARDS[playerAction.playerID] = card;
            // Check if the round has been won.
            let counter = 0;
            for (let token of gameData.ROUND_CARDS) {
                if (token == -1) counter++;
            }
            // If someone has won the round.
            if (counter >= 3) {
                // Clear the array.
                gameData.ROUND_CARDS = [];
                // Reset prevCard.
                gameData.prevCard = -1;
                // The winner can now play.
                gameData.playerTurn = playerAction.playerID + 1;
                // Clear the table.
                card = -2;
            }
            // If the round is not won, next person plays.
            else {
                gameData.playerTurn++;
            }
        }
    })
    return gameData;
}