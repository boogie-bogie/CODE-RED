const buildUserHtml = (user) => {
  return `
  <div class="user" userId="${user.id}">
      <img src=${user.profile_image || 'https://contents.creators.mypetlife.co.kr/content/uploads/2020/03/14185353/2020032Ffb_096179c74fa6c6ede3d351a60e403bbf-384x384.jpg'} width="70px" />
      ${user.nickname} 
  </div>
  <br>
`;
};

const buildNotificationHtml = (time, userId) => {
  return `
  <div class="noti-${time}"> 💡 ${userId}에게 새 메세지 도착!</div>
  `;
};

const buildMessageHtml = (record) => {
  return `
  <li>
    <div class="user-message">
        <div class="user-name-time">${record.user_id} <span>${new Date(record.created_at).toLocaleString()}</span></div>
        <div class="message-text">${record.message}</div>
    </div>
  </li>   
`;
};
