var webSocketServer = require('ws').Server;
var PORT = 42069;
var wss = new webSocketServer({port:PORT});

var admins = [];
var nonAdmins = [];
var rooms = [];

var wsMap = new Map(); // websocket -> User
var roomidMap = new Map(); // (int) roomid -> Room

//var xorshiftstate = 343112;
var newroomid = 0;

class Room {
    constructor(){
        this.roomId = newroomid++; //Overflow is not expected to be an issue
        this.roomMessages = []; //(Array of JSON messages)
        this.participants = []; //(Array of User)
    }
}

class User {
    //Pre-conditions: ws is a (reference to) websocket object. username is a string. isAdmin is a boolean.
    //Post-condition: A new User is created with its webSocket connection and username defined.
    constructor(ws,username,isAdmin){
        this.webSocket = ws;
        this.username = username;
        this.isAdmin = isAdmin;
        this.activeRooms = [];
    }
}

wss.on('connection', function (ws) { //ws is a WebSocket object representing the new connection. Different ws objects can have same
    console.log('Connection established.');

    ws.on('message', function (message) {
        console.log('Received: %s', message);
        var mjson = JSON.parse(message);

        if(mjson.type === "register"){
            if(mjson.isAdmin){
                registerAdmin(ws,mjson);
            }else{ registerClient(ws,mjson); }
        }
        else if(mjson.type === "smsg" || mjson.type === "msg") {
            var targetRoomId = mjson.room;
            var targetRoom = roomidMap.get(targetRoomId);
            if(targetRoom !== undefined) {
                targetRoom.roomMessages.push(mjson);
                targetRoom.participants.forEach(function (user) {
                    if (user.webSocket.readyState !== 3) //One last check to ensure the socket is NOT closed.
                        user.webSocket.send(message);
                });
            }
        }
        else{
            console.log('Unrecognized WS message type.')
        }
    });

    ws.on('close', function (){
        var departingUser = wsMap.get(ws);
        if(departingUser.isAdmin){
            departingUser.activeRooms.forEach(function (room) {
                var filteredParticipants = room.participants.filter(function(v){
                    return v !== departingUser;
                });
                room.participants = filteredParticipants;
            });
            console.log("An admin has left");
            admins = admins.filter(function(v){
                return v !== departingUser;
            });
        }else{
            var toClose = departingUser.activeRooms.pop(); //Non admins will only have one entry.
            toClose.participants.forEach(function (user) {
                if (user !== departingUser){ //These are the admins, remove their references to this room.
                    user.activeRooms = user.activeRooms.filter(function (v) {
                        return v !== toClose;
                    });
                }
            });
            toClose.participants = [];
            rooms = rooms.filter(function (v) {
                return v!==toClose;
            });
            nonAdmins = nonAdmins.filter(function (v) {
                return v !== departingUser;
            });
        }

    });
});

function registerClient(ws,message){ //Registering a new client constructs a new room for that client and adds all admins to the room.
    var newUser = new User(ws,message.user,false);
    wsMap.set(ws,newUser);
    var newRoom = new Room();
    roomidMap.set(newRoom.roomId,newRoom);
    newRoom.participants.push(newUser);
    newUser.activeRooms.push(newRoom);
    admins.forEach(function (adminUser) {
        newRoom.participants.push(adminUser);
    });
    rooms.push(newRoom);
    nonAdmins.push(newUser);
    ws.send(JSON.stringify({type: "receipt", room: newRoom.roomId}));
    console.log("Delivered receipt: %s", JSON.stringify({type: "receipt", room: newRoom.roomId}));
}

function registerAdmin(ws){ //Registering a new admin adds said admin to all currently open rooms.
    var newAdminUser = new User(ws,message.user,true);
    wsMap.set(ws,newAdminUser);
    admins.push(newAdminUser);
    rooms.forEach(function (room) {
        room.participants.push(newAdminUser);
        ws.send(JSON.stringify({type: "receipt", room: room}));
    });
}

/*
function xrsrng(bound){
    xorshiftstate ^= xorshiftstate <<13;
    xorshiftstate ^= xorshiftstate >>17;
    xorshiftstate ^= xorshiftstate <<5;
    return xorshiftstate%bound;
}
*/
