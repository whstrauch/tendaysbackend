let io;
let rooms = {}

const initialize = (gio, gsocket) => {
    io = gio;

    

    gsocket.on("test", () => test())

    // New move -> send to opponent
    gsocket.on("newMove", (data) => newMove(gsocket, data))

    // Create new game room
    gsocket.on("createGame", (data) => createGame(data, gsocket))

    // Join game room
    gsocket.on("join", (data) => joinGame(data, gsocket));

    // Disconnect
    gsocket.on("disconnecting", () => disconnect(gsocket))

    //Start game
    gsocket.on("startGame", (data) => startGame(data, gsocket))

    // Video chat
    gsocket.on("call", (data) => call(gsocket, data))

    gsocket.on("acceptCall", (data) => acceptCall(gsocket, data))

    gsocket.on("endCall", (id) => endCall(gsocket, id))
}

const call = (socket, data) => {
    socket.to(data.id).emit("receivingCall", {signal: data.signal, from: data.from})
}

const acceptCall = (socket, data) => {
    socket.to(data.id).emit("callAccepted", data.signal)
}

const endCall = (socket, id) => {
    socket.to(id).emit("endCall")
}

const test = () => {
    console.log("TESTED");
}

const newMove = (socket, move) => {
    console.log("NEW MOVE", move)
    socket.to(move.id).emit("opponentMove", move)
}

const createGame = (data, socket) => {
    if (!rooms[data.id]) {
        rooms[data.id] = []
    }
    if (rooms[data.id]) {
        rooms[data.id].push({user: data.user, id: socket.id})
    }
    socket.join(data.id)
    console.log("CREATED BY", socket.id);
    io.sockets.in(data.id).emit("playerJoined", rooms[data.id])
}

const joinGame = (data, socket) => {
    // console.log("Rooms", rooms)
    // Should cap at 4 ppl
    // Also check if rooms does not exist


    socket.join(data.id);
    console.log("JOIN", socket.id)
    if (rooms[data.id]) {
        rooms[data.id].push({user: data.user, id: socket.id});
    }
    io.sockets.in(data.id).emit("playerJoined", rooms[data.id]);
}

const startGame = (id, socket) => {
    if (rooms[id]) {
        io.sockets.in(id).emit("startedGame", rooms[id]);
    }
}

const disconnect = (socket) => {
    let id;
    let index;
    console.log("DISCONNECT", socket.id)
    for (const [gameId, room] of Object.entries(rooms)) {
        for (let i = 0; i < room.length; i++) {
            const user = room[i]
            if (user.id === socket.id) {
                id = gameId;
                index = i;
            }
        }
    }
    rooms[id]?.splice(index, 1);
    io.sockets.in(id).emit("playerJoined", rooms[id])
}

export { initialize };