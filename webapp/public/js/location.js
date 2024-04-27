document.addEventListener('DOMContentLoaded', () => {
  async function saveLocation(latitude, longitude) {
    await fetch('/mayday', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        latitude,
        longitude,
      }),
    })
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        if (data.message === '위치정보 저장 성공') {
          console.log(data.message);
        }
      });
  }

  let id;
  let options;

  options = {
    enableHighAccuracy: true,
    timeout: 27000,
    maximumAge: 180000,
  };

  async function success(pos) {
    const crd = pos.coords;

    let userLat = crd.latitude;
    let userLng = crd.longitude;
    console.log(`
    위도:${userLat}
    경도:${userLng}`); // 로그인 될때 까지 사용해야함.
    await saveLocation(userLat, userLng);
  }

  function error(err) {
    console.error(`ERROR(${err.code}): ${err.message}`);
  }

  navigator.geolocation.watchPosition(success, error, options);
});

/* navigator.geolocation.watchPosition(success, error, options)
    => navigator.geolocation.watchPosition(위치 정보를 가져오는것에 성공했을시, 실패했을시 , watchPosition의 설정)
  
    • 위치 정보를 가져오는것에 성공했을시: success
      - 성공을 한다면 position이라는 객체를 받아온다
      - 이 객체 안에는 좌표라는 객체 안에 위도 경도가 들어있다.
      - 즉
        position = {
          coords:{
            latitude: 위도
            longitude: 경도
          }
        }
        이런 형태인것.
        - 그래서 성공을 했다면 해당 위도 경도를 가지고 fetch를 통해 경로에 맞는 controller로 보내준다.

    • 위치 정보를 가져오는것에 실패했을시: error
      - 실패를 한다면 실패의 이유와 코드를 반환하게 한다.
      - 실패의 종류
        ° 사용자가 Geolocation API의 사용 요청을 거부
        ° 위치 정보를 사용불가
        ° 허용 시간을 초과
        ° 알 수 없는 오류가 발생

    • watchPosition의 설정: options
*/

/* options : watchPosition을 사용할 때 설정할수 있는 옵션
    - enableHighAccuracy
      • 위치를 가능한 정확하게 가져올지 여부를 지정하는 불리언 값.
      • true값으로 설정하게되면 gps나 다른 정확한 위치정보제공방법을 사용하여 위치를 가져옴
      • 하지만 배터리 소모가 더많이 일어날수가 있고 네트워크를 통한 위치 정보 수신에 비해 더 오래걸릴수 잇다.
      
    - maximumAge
      • 이전 위치 정보의 유효 시간을 나타내는 밀리초 단위의 숫자이다.
      • 새로운 위치 정보를 가져오기 전에 최근에 얻은 위치 정보를 사용할 수 있는 기간을 제어한다.
      • 즉, 0밀리초 라면 항상 새로운 위치를 요청함.
      • 180000밀리초라고 한다면 3분동안 같은 위치에 있다면 3분동안 새로운 위치 정보를 요청하지 않고 이전 위치 정보를 사용할수 있다.
      • 약간 캐시의 느낌과 비슷한것 같음.
      • 하지만 3분 이내에 다른위치로 이동한다면 새로운 위치로 업데이트가 이루어짐
      • ∴ 위치 정보가 변하지 않을때도 계속해서 다시 가져오는 것을 줄이기 위해 3분이라는 시간을 설정함.
      
    - timeout
      • 위치 정보 요청이 실패하기까지 대기할 시간을 나타내는 밀리초 단위의 숫자
      • 지정된 시간 내에 위치 정보를 가져오지 못할 경우에 호출되는 오류 콜백을 트리거
      • Infinity로 설정한다면 요청이 성공할 때 까지 무한정 대기
      • 즉, 위치를 가져오는 데 27초까지 기다린후에도 위치를 확인할 수 없으면 watchPosition 호출은 실패하고 오류 콜백이 호출한다.
      • 생각할 것
        => 어차피 watchPosition을 사용하면 위치 변할때마다 아니면 3분 지날때마다 작동할텐데 왜 사용해야하지? infinity로 하면 되는거 아닌가?
          ※ 위치 정보를 가져 오는것에 너무 오랜 시간이 걸릴경우 방지하기 위해 사용.
          ※ 네트워크 연결이 약하거나 위치 서비스에 문제가 있는 경우 요청이 무한정으로 대기 하는것을 방지하기 위해 사용
          ※ 무한정으로 대기하지 않고 시간을 설정하면 위치 요청을 중단하므로 리소스를 효율적으로 관리할 수있다.
          ※ 배터리 소모 측면에서 불필요한 요청이 무한정으로 실행 되지 않도록 조절을 할수가 있다.
          ※ 또한 위치 정보를 가져오는것에 무한정 대기를 한다면 사용자는 애플리케이션이 느리다고 생각하면서 사용성이 낮아질수 있다.
*/
