import dealCards from './deal_cards';

let numPlayers = 4;

export default function server_connections(socket, io, ROOM_LIST, SOCKET_LIST) {
    // Handling new connections to home page.
    console.log('New home page connection assigned as player ' + socket.id);
    SOCKET_LIST[socket.id] = socket;
    socket.emit('waitingRoom', {
        roomList: ROOM_LIST,
        roomPlayers: ROOM_LIST.map(roomName => room_players(roomName))
    });
    // Joining a room.
    socket.on('roomJoined', function(room) {
        
        // Make sure that the room actually has space. 
        if (room_players(room.name) >= 4) {
            return;
        } else {
            socket.emit('joinRoom', {
                name: room.name
            });
            console.log(room.name + ' has been joined by ' + socket.id);
            socket.join(room.name);
        }

        // If all players have joined, deal the cards.
        if (room_players(room.name) >= numPlayers) {
            console.log('all players joined.')
            deal_cards('big_two', room.name);
        }
        
    })


    function deal_cards(gameMode, roomName) {
        let numDecks = 1;
        if (gameMode != 'big_two') numDecks = 2;
        let players = dealCards(numDecks);
        let clients = io.nsps["/"].adapter.rooms[roomName];
        for (let i = 0; i < numPlayers; i++) {
            // Retrieve socket from socket list.
            SOCKET_LIST[Object.keys(clients.sockets)[i]].emit('dealCards', {
                playerCards: players[i],
                playerID: i,
                roomName: roomName
            });
        }
    }

    function room_players(room) {
        let clients = io.nsps["/"].adapter.rooms[room];
        if (clients === undefined) return 0;
        return clients.length;
    }

    // Handling disconnects.
    socket.on('disconnect', function() {
        delete SOCKET_LIST[socket.id];
        console.log('player ' + (socket.id) + ' disconnected');
    })
    return [SOCKET_LIST, ROOM_LIST];
}