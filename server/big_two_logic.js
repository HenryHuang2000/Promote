export default function big_two_logic(socket, io, gameData) {

    socket.on('cardClicked', function(playerAction) {

        let card = playerAction.clickedCard;
        // Check if playing the card is legal.
        let legal = (playerAction.playerID == gameData.playerTurn);
        // If legal and card is larger than previous.
        if (legal && card > gameData.prevCard) legal_logic();
        // If pass.
        else if (legal && card == -1) pass_logic();
        // Ignore illegal plays.
        else return;

        if (gameData.playerTurn == 4) gameData.playerTurn = 0;
        // Print the card played into the client side.
        io.in(playerAction.roomName).emit('cardPlayed', {
            card: card,
            playerID: playerAction.playerID + 1,
            playerTurn: gameData.playerTurn + 1
        });

        
        function legal_logic() {
            // Store the played card in the round list.
            gameData.ROUND_CARDS[playerAction.playerID] = card;
            socket.emit('legalMove', {index: playerAction.index});
            // Update prevCard.
            gameData.prevCard = card;
            gameData.playerTurn++;
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