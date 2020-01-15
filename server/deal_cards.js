
export default function dealCards (numDecks) {

    // Create an array of all possible cards.
    const cards = [];
    // No jokers for now.
    for (let i = 0; i < 52; i++) {
        // Push once per deck.
        for (let j = 0; j < numDecks; j++) {
            cards.push(i + 1);
        }
    }

    // Shuffle the cards.
    // Swap each card with a random card in the deck.
    let numShuffles = 10;
    for (let i = 0; i < cards.length * numShuffles; i++) {
        let randNum = Math.floor(Math.random() * 52 * numDecks);
        // Swap cards[i] with cards[randNum].
        let temp = cards[i % cards.length];
        cards[i % cards.length] = cards[randNum];
        cards[randNum] = temp;
    }

    // Distribute the cards amongst the players.
    const players = [];
    for (let i = 0; i < 4; i++) {
        players[i] = cards.slice(i * 52 * numDecks / 4, (i + 1) * 52 * numDecks / 4);
    }
    return players;
}