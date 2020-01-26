export default function big_two_logic(socket, io, gameData) {

    socket.on('cardsPlayed', function(playerAction) {

        let cards = playerAction.selectedCards;
        // Check if it is player's turn to play..
        let legalTurn = (playerAction.playerID == gameData.playerTurn);
        let legalLength = (gameData.numCards == -1 || cards.length == gameData.numCards);
        // If right turn and number of cards check that the cards are larger than prev.
        if (legalTurn && legalLength && size_checker(cards)) legal_logic();
        // If pass.
        else if (legalTurn && cards.length == 0) pass_logic();
        // Ignore illegal plays.
        else {
            let reasons = [legalTurn, legalLength, combo_checker(cards), size_checker(cards)];
            socket.emit('illegalMove', {reasons: reasons});
            return;
        }

        gameData.playerTurn %= 4;
        // Print the card played into the client side.
        io.in(playerAction.roomName).emit('cardPlayed', {
            cards: cards,
            playerID: playerAction.playerID + 1,
            playerTurn: gameData.playerTurn + 1,
            cardCounter: gameData.cardCounter
        });


        function size_checker(cards) {
            if(!combo_checker(cards)) return false;

            // If first card to be played.
            if (gameData.numCards == -1) return true;
            // For singles, doubles and triples
            let larger = Math.max.apply(null, cards) > Math.max.apply(null, gameData.prevCards);
            if (cards.length <= 3 && larger) return true;

            return false;
        }

        function combo_checker(cards) {
            // For doubles
            if (cards.length == 2 || cards.length == 3) {
                // Make sure the cards are the same number.
                for (let i = 0; i < cards.length - 1; i++) {
                    if (Math.floor((cards[i] - 1) / 4) != Math.floor((cards[i + 1] - 1) / 4)) return false;
                }
            }
            return true;
        }
        
        function legal_logic() {

            // Tell the client move was legal.
            socket.emit('legalMove', {cards: cards});

            // Check if the player has won.
            if (gameData.cardCounter[gameData.playerTurn] - cards.length == 0) {
                io.in(playerAction.roomName).emit('playerWon', {winner: gameData.playerTurn});
            }
            
            // Update gameData.
            console.log('legal move');
            gameData.cardCounter[gameData.playerTurn] -= cards.length;
            gameData.playerTurn++;
            gameData.prevCards = cards;
            gameData.numCards = cards.length;
            gameData.passCounter = 0;

            
            
        }

        function pass_logic() {
            gameData.passCounter++;
            gameData.playerTurn++;
            // If someone has won the round.
            if (gameData.passCounter >= 3) {
                //Reset gameData.
                gameData.passCounter = 0;
                gameData.prevCards = [];
                gameData.numCards = -1;
                // The winner can now play.
                gameData.playerTurn = playerAction.playerID + 1;
                // Clear the table.
                cards = 'clear_table';
            }
        }
    })
    return gameData;
}