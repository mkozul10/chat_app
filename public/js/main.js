const chatForm = document.querySelector('#chat-form');
const chatMessages = document.querySelector('.chat-messages');
const socket = io();
const roomName = document.querySelector('#room-name');
const userList = document.querySelector('#users');

//Get username and room from URL
const {username, room} = Qs.parse(location.search, {
    ignoreQueryPrefix: true
})

//Join chatroom
socket.emit('joinRoom', {username, room});


//Get room and users

socket.on('roomUsers', ({room, users}) => {
    outputRoomName(room);
    outputUsers(users);
})

//message from server
socket.on('message', message => {
    console.log(message);
    outputMessage(message);

//Scroll down
chatMessages.scrollTop = chatMessages.scrollHeight;
});

chatForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const message = e.target.elements.msg.value;

    //Emiting message to server
    socket.emit('chatMessage', message)

    //Clear input
    e.target.elements.msg.value = '';
    e.target.elements.msg.focus();
})

//output message to DOM

const outputMessage = (message) => {
    const div = document.createElement('div');
    div.classList.add('message');
    div.innerHTML = `<p class="meta">${message.username}<span>${message.time}</span></p>
    <p class="text">${message.text}</p>`;
    document.querySelector('.chat-messages').appendChild(div);
}

const outputRoomName = (room) => {
    roomName.innerText = room;
}

const outputUsers = (users) => {
    userList.innerHTML = `
        ${users.map(user => `<li>${user.username}</li>`).join()}
    `;
}