import Socket from './socket_creator';

// Server setup.
var express = require('express');
var app = express();
var serv = require('http').Server(app);
app.get('/',function(req, res) {
    res.sendFile(__dirname + '/client/index.html');
});
app.use('/client',express.static(__dirname + '/client'));
serv.listen(2000);
console.log('Server started.');


// Socket connections are sent to the waiting room.
let newSocket = new Socket();
let socketPromise = newSocket.connect(serv);
let ROOM_LIST = ['default_room'];
socketPromise.then(function(data) {
    
    newSocket._socket = data[0];
    newSocket._io = data[1];
    newSocket.sendEvent('waitingRoom', {
        roomList: ROOM_LIST,
        roomPlayers: ROOM_LIST.map(roomName => room_players(roomName))
    });
});


function room_players(room) {
    let clients = newSocket._io.nsps["/"].adapter.rooms[room];
    if (clients === undefined) return 0;
    return clients.length;
}