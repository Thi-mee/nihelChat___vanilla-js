import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import http from "http";
import { Server } from "socket.io";
import { addRoom, getRoom, addRoomMember, getAllRoomNames } from './utils/rooms.js'
import { addRoomtoUser, addUser, getUser, getUserByName, getUserByNameAndPassword } from './utils/users.js'
import { addMessage, getRoomMessages } from "./db/index.js";


const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
    },
});
const CHATBOTNAME = "NihelBot";

app.use(cors());
app.use(bodyParser.json());

app.post('/login', (req, res) => {
    console.log("attempting to login")

    const username = req.body.username;
    const password = req.body.password;

    let foundData = getUserByNameAndPassword(username, password);

    if (foundData) {
        res.json({ id: foundData.id, userRooms: foundData.rooms });

    } else {
        res.status(404).json(
            { message: "Username or password is incorrect" }
        );
    }
})

app.post('/register', (req, res) => {
    console.log("attempting to register")
    let foundUser = getUserByName(req.body.username);
    if (foundUser) {
        res.status(404).json(
            { message: "Username already exists" }
        );
    } else {
        const userId = addUser(req.body.username, req.body.password);
        res.json({ userId });
    }
})

app.post('/createroom', (req, res) => {
    console.log("attempting to create room")

    const user = getUser(req.body.userId);
    const roomName = req.body.roomName;

    try {
        if (user) {
            console.log("User found")
            if (!getRoom(roomName)) {
                addRoom(roomName, user.id);
                addRoomtoUser(user.id, roomName)
                addRoomMember(roomName, user.id);
                console.log("Created room successfully")
                res.json({
                    message: `room ${roomName} created successfully`,
                    room: roomName
                });
            }
            else {
                res.json(
                    { message: "Room already exists", room: roomName }
                );
            }
        } else {
            console.log("User not found")
            res.status(404).json(
                { message: "User not found" }
            );
        }
    } catch (error) {
        console.log(error)
    }
})

app.get('/roommessages', (req, res) => {
    const roomName = req.query.roomName;
    if (!roomName) {
        res.status(404).json(
            { message: "Room name not provided" }
        );
    }
    const messages = getRoomMessages(roomName.toLowerCase());
    if (messages) {
        res.json({ messages });
    } else {
        res.status(404).json(
            { message: "Room not found" }
        );
    }
})

app.get("/", (req, res) => {
    res.send("Nihel Chat Application!");
});

let usersConnectedCount = 0;
io.on('connection', (socket) => {

    console.log(`${++usersConnectedCount} user connected`);

    socket.on('loadPage', (userId, callback) => {
        const user = getUser(userId);
        if (user) {
            for (const room of user.rooms) {
                socket.join(room);
            }
            callback(user.rooms);
        }
    })

    socket.on('activeRoom', (roomName) => {
        const roomNames = getAllRoomNames();
        roomNames.forEach(room => {
            socket.leave(room);
        });
        socket.join(roomName.toLowerCase())
    })


    socket.on('message', (userId, roomName, msg) => {
        socket.join(roomName)
        const user = getUser(userId);
        addMessage(roomName, userId, msg);
        console.log('message: ' + msg);
        io.to(roomName).emit('newMessage', { userName: user.userName, message: msg });
    });

    socket.on('disconnect', () => {
        console.log('user disconnected');
        console.log(`${--usersConnectedCount} user remaining`);
    });
});






const port = process.env.PORT || 3055;
server.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});
