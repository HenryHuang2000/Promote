
export default class Socket {
    constructor() {
        this._socket = null;
        this._io = null;
    }
    connect(server) {
        
        let socketPromise = new Promise(function(resolve, reject) {
            const io = require('socket.io')(server);
            io.on('connection', (socket) => {

                console.log('New connection: ' + socket.id);
                resolve([socket, io]);
            });
        });
        return socketPromise;
        
    }

    sendEvent(event, data) {
        this._socket.emit(event, data);
    }

    registerEvent(event, handler) {
        this._socket.on(event, handler);
    }
}
