import { v4 as uuidV4 } from 'uuid'

const Users = [
    // {
    //     id: '1',
    //     userName: 'test',
    //     password: 'test',
    //     rooms: ['room1', 'room2']
    // },
    // {
    //     id: '2',
    //     userName: 'test2',
    //     password: 'test2',
    //     rooms: ['room1']
    // },
    // {
    //     id: '3',
    //     userName: 'test3',
    //     password: 'test3',
    //     rooms: ['room2']
    // },
]

export const getUser = (id) => {
    return Users.find(user => user.id === id)
}
export const getUserByName = (userName) => {
    return Users.find(user => user.userName === userName)
}
export const getUserByNameAndPassword = (userName, password) => {
    return Users.find(user => user.userName === userName && user.password === password)
}
export const addUser = (userName, password) => {
    const id = uuidV4()
    Users.push({ id, userName, password, rooms: [] })
    return id
}
export const getUserRooms = (userId) => {
    const user = getUser(userId)
    if (!user) {
        return []
    }
    return user.rooms
}
export const addRoomtoUser = (userId, roomName) => {
    const user = getUser(userId)
    if (!user) {
        return false
    }
    user.rooms.push(roomName)
    return true
}