// const userId = document.cookie.userId;
const userId = +prompt('enter your user ID'); // temp
const connectOptions = {
  auth: { userId },
};

const dmSocket = io('/dm', connectOptions);
let currentRoom = '';

fetch('/users', { credentials: 'include' })
  .then((res) => res.json())
  .then((users) => {
    const userListDiv = document.querySelector('.user-list');
    users.forEach((user) => {
      if (user.id !== userId) {
        userListDiv.innerHTML += buildUserHtml(user);
      }
    });

    // switch room event
    document.querySelectorAll('.user').forEach((elem) => {
      elem.addEventListener('click', async () => {
        document.querySelector('#messages').innerHTML = '';
        const nickname = elem.textContent;
        document.querySelector('.curr-room-text').textContent = nickname;

        const targetId = elem.getAttribute('userId');
        const roomName =
          userId < targetId ? `${userId}_${targetId}` : `${targetId}_${userId}`;

        dmSocket.emit('joinRoom', roomName);
      });
    });
  });

dmSocket.on('joinRoom', ({ roomName, history }) => {
  currentRoom = roomName;

  history.forEach((record) => {
    document.querySelector('#messages').innerHTML += buildMessageHtml(record);
  });
});

// new message event
document.querySelector('#message-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const message = document.querySelector('#user-message').value;
  if (message === '') {
    return;
  }
  document.querySelector('#user-message').value = '';

  dmSocket.emit('message', {
    user_id: userId,
    message,
    roomName: currentRoom,
    created_at: new Date(),
  });
});

dmSocket.on('message', (newMessage) => {
  document.querySelector('#messages').innerHTML += buildMessageHtml(newMessage);
});

dmSocket.on('notification', (userId) => {
  const time = Date.now();

  document.querySelector('.notifications').innerHTML += buildNotificationHtml(
    time,
    userId,
  );

  setTimeout(() => {
    document.querySelector(`.noti-${time}`).textContent = '';
  }, 5000);
});
