
export default function dealCards (numDecks) {

    // Create an array of all possible cards.
    let cards = [];
    // Add all cards exculding jokers.
    for (let i = 0; i < 52; i++) {
        // Push once per deck.
        for (let j = 0; j < numDecks; j++) {
            cards.push(i + 1);
        }
    }

    // Shuffle the cards using the Fisher-Yates shuffle.
    cards = shuffle(cards);

    // Distribute the cards amongst the players.
    const players = [];
    for (let i = 0; i < 4; i++) {
        players[i] = cards.slice(i * 52 * numDecks / 4, (i + 1) * 52 * numDecks / 4);
    }
    return players;
}


function shuffle(array) {
    var m = array.length, t, i;
    // While there remain elements to shuffle…
    while (m) {
  
        // Pick a remaining element…
        i = Math.floor(Math.random() * m--);
    
        // And swap it with the current element.
        t = array[m];
        array[m] = array[i];
        array[i] = t;
    }
  
    return array;
}