var socket = io.connect('http://localhost:3055');
var userId;
var room;

window.onload = () => {
  if (localStorage.getItem('chat-user-id')) {
    userId = localStorage.getItem('chat-user-id');
    socket.emit('loadPage', userId, (userRooms) => {
      if (userRooms) {
        updateChatTabs(userRooms);
      }
    })
  } else {
    showPopup(1);
  }
}

const registerForm = document.querySelector('#registerForm')
registerForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  // get username and password
  const username = e.target.elements.username.value;
  const password = e.target.elements.password.value;
  
  // validate Input
  if (!username || !password) {
    document.querySelector('.error-message').innerHTML = 'Please enter username and password';
    return;
  }
  else if (username.length < 3 || password.length < 3) {
    document.querySelector('.error-message').innerHTML = 'Username and password must be at least 3 characters';
    return;
  }

  try {
    // send username and password to server
    const response = await axios.post('http://localhost:3055/register', { username, password })
    if (response.data) {
      userId = response.data.userId;
      localStorage.setItem('chat-user-id', userId);
      removePopup(0);
    } else {
      document.querySelector('.error-message').innerHTML = 'Username already exists';
    }
  } catch (error) {
    console.log(error)
  }
})

const loginForm = document.querySelector('#loginForm')
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  // get username and password
  const username = e.target.elements.username.value;
  const password = e.target.elements.password.value;

  // validate Input 
  if (!username || !password) {
    document.querySelector('.error-message').innerHTML = 'Please enter username and password';
    return;
  }

  try {
    // send username and password to server
    const response = await axios.post('http://localhost:3055/login', { username, password })
    if (response.data) {
      userId = response.data.id;
      const userRooms = response.data.userRooms;

      // save user id to local storage
      localStorage.setItem('chat-user-id', userId);
      updateChatTabs(userRooms);
      removePopup(1);
    } else {
      document.querySelector('.error-message').innerHTML = 'Username or password is incorrect';
    }
  } catch (error) {
    console.log(error)
  }


})

const createChat = document.querySelector('.create-room-btn')
createChat.addEventListener('click', () => {
  showPopup(2);
  document.querySelector('#roomName').focus();
})

const roomForm = document.querySelector('#roomForm')
roomForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const roomName = e.target.elements.roomName.value;

  if (!roomName) {
    return;
  }

  try {
    // Sends request to create a room
    const response = await axios.post('http://localhost:3055/createroom', { roomName, userId })
    if (response.data) {
      const { room } = response.data;
      removePopup(2);
      createNewChatTab(room);
    }
  } catch (error) {
    console.log(error)
  }

  e.target.elements.roomName.value = '';
})

const logOutButton = document.querySelector('.logout-btn')
logOutButton.addEventListener('click', () => {
  localStorage.removeItem('chat-user-id');
  window.location.reload();
})

const registerLink = document.querySelector('.registerLink')
registerLink.addEventListener('click', () => {
  removePopup(1);
  showPopup(0);
})


socket.on('newMessage', ({ message, userName }) => {
  document.getElementById('messages').innerHTML += `
    <div class="message">
      <span class="message__author">${userName}</span>
      <div class="message__text">${message}</div>
    </div> 
  `;
})






const sendMessage = (e) => {
  e.preventDefault();

  // get room name
  const roomName = document.querySelector('.chat-name').innerText.toLowerCase();

  // get message
  const message = e.target.elements.message.value;
  // validate message
  if (!message) {
    return;
  }
  socket.emit('message', userId, roomName, message);

  document.getElementById('message').value = '';
}
function updateChatTabs(roomArray) {
  roomArray.forEach(room => {
    createNewChatTab(room);
  })
}
function createNewChatTab(roomName) {
  const chatTab = document.createElement('div');
  chatTab.classList.add('chat-tab');
  chatTab.innerHTML = roomName;
  chatTab.addEventListener('click', (e) => setupChatPage(e))
  document.querySelector('.chat-tabs').appendChild(chatTab);
}
function showPopup(number) {
  document.querySelector('.popup').classList.add('show')
  document.querySelectorAll('.popup-content')[number].classList.add('show')
  document.querySelector('.overlay').classList.add('show')
}
function removePopup(number) {
  document.querySelector('.popup').classList.remove('show')
  document.querySelectorAll('.popup-content')[number].classList.remove('show')
  document.querySelector('.overlay').classList.remove('show')
}
async function setupChatPage(e) {
  const chatBoard = document.querySelector('.chat-board');
  const messages = await getMessages(e.target.innerText);
  chatBoard.innerHTML = `
    <div class="chat-head">
        <h2 class="chat-name">${e.target.innerText}</h2>
    </div>
    <div class="messages" id="messages">
      ${messages}
    </div>
    <form class="message-box" onsubmit="sendMessage(event)">
      <input type="text" name="message" id="message" placeholder="Type a message">
      <button type="submit">Send</button>
    </form>
    `;
  chatBoard.style.display = 'block';
  socket.emit('activeRoom', e.target.innerText);
}
async function getMessages(roomName) {
  const response = await axios.get(`http://localhost:3055/roommessages?roomName=${roomName}`);
  const messages = await response.data.messages;

  let messagesString = "";
  messages.forEach(message => {
    messagesString += `
      <div class="message">
        <span class="message__author">${message.userName}</span>
        <div class="message__text">${message.message}</div>
      </div>
    `;
  })
  return messagesString;
}
