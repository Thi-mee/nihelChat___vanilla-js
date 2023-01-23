import { getUser } from "../utils/users.js"

export const messagesDB = [
    // {
    //     name: 'room1',
    //     messages: [
    //         {
    //             id: 1,
    //             message: 'This is a sample Text',
    //             userId: '1',
    //             timestamp: 123456789
    //         },
    //         {
    //             id: 2,
    //             message: 'This is too but from another user',
    //             userId: '2',
    //             timestamp: 123456789
    //         },
    //     ]
    // },
]


export const getRoomMessages = (roomName) => {
    const foundRoom = messagesDB.find(room => room.name === roomName)
    if (foundRoom) {
        const NewMessages = foundRoom.messages.map(message => {
            console.log(message)
            const user = getUser(message.userId)
            if (user) {
                return {
                    ...message,
                    userName: user.userName
                }
            }
            else {

            }
        })
        return NewMessages
    }
    else {
        return []
    }
}



export const addMessage = (roomName, userId, message) => {
    const foundRoom = messagesDB.find(room => room.name === roomName)
    if (foundRoom) {
        const id = foundRoom.messages.length + 1
        foundRoom.messages.push({
            id,
            message,
            userId,
            timestamp: Date.now()
        })
    }
    else {
        messagesDB.push({
            name: roomName,
            messages: [
                {
                    id: 1,
                    message,
                    userId,
                    timestamp: Date.now()
                }
            ]
        })
    }
}