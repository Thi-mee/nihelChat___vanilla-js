
const Rooms = [
    // {
    //     roomName: 'room2',
    //     users: ['1', '3'],
    // },
    // {
    //     roomName: 'room1',
    //     users: ['1', '2'],
    // }
]

export const getRoom = (roomName) => {
    return Rooms.find(room => room.roomName === roomName)
}
export const addRoom = (roomName, creatorId) => {
    const users = [creatorId]
    Rooms.push({ roomName, users })
}
export const getAllRoomNames = () => {
  return Rooms.map(room => room.roomName)
}
export const addRoomMember = (roomName, userId) => {
    const room = getRoom(roomName)
    if (room) {
        room.users.push(userId)
    }
}
