document.querySelector('#acceptBtn').addEventListener('click', async (e) => {
  e.preventDefault();
  const username = document.getElementById('username').value;

  async function saveLocation(latitude, longitude, username) {
    try {
      const response = await fetch('/mayday/accept-rescue', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          latitude: 37.437669048891394,
          longitude: 127.14049889407856,
          userName: username,
        }),
      });

      if (response.ok) {
        const responseData = await response.json();
        console.log(responseData);
        const distance = `distance=${responseData.distance}`;
        const helperName = `helperName=${responseData.helperName}`;
        const message = `message=${responseData.message}`;
        const url = `/mayday/matchHelper?${distance}&${helperName}&${message}`;
        window.location.href = url;
      } else if (!response.ok) {
        const responseData = await response.json();
        const errorMessage = responseData.message;
        alert(errorMessage); // 에러 메시지 alert 창에 표시
      }
    } catch (error) {
      console.error('요청 실패:', error);
    }
  }

  navigator.geolocation.getCurrentPosition(function (pos) {
    const latitude = pos.coords.latitude;
    const longitude = pos.coords.longitude;

    saveLocation(latitude, longitude, username);
  });
});
/* getCurrentPosition
    - 현재 위치정보를 단 한번만 요청하고 가져옴.
    - 앱이 시작될 때 사용자의 현재 위치를 가져와 초기화하거나, 사용자가 특정 기능을 실행할 때 위치 정보를 요구하는 경우 등에 사용
*/
