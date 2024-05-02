document.addEventListener('DOMContentLoaded', async () => {
    let mapContainer = document.getElementById('map');
  
    let mapOption = {
        center: new kakao.maps.LatLng(37.502391, 127.044501),
        level: 3,
    };
  
    let map = new kakao.maps.Map(mapContainer, mapOption);
  
    // 마커를 담을 배열 생성
    let markers = [];
    // detailCustomOverlay를 저장할 배열 생성
    let detailOverlays = [];
  
    // 지도 클릭 시 모든 detailCustomOverlay 숨김 처리
    kakao.maps.event.addListener(map, 'click', () => {
        detailOverlays.forEach(overlay => {
        overlay.setMap(null);
        });
    });
  
    navigator.geolocation
        .getCurrentPosition(position => {
        let latitude = position.coords.latitude, // 위도
        longitude = position.coords.longitude; // 경도

        //let longitude = 127.300616,
        //latitude = 37.657918
        const url = `/shelters/mix?x=${longitude}&y=${latitude}`;
        fetch(url)
            .then(response => {
            return response.json();
            })
            .then(data => {
            console.log(data)
            if (data.length === 0) {
                alert('1000m이내에 대피소가 없습니다.');
            } else {
                let bounds = new kakao.maps.LatLngBounds();
  
                // 기존 마커 제거 및 배열 초기화. setMap(null):기존에 생성된 마커들 모두 제거
                for (let i = 0; i < markers.length; i++) {
                markers[i].setMap(null);
                }
                markers = [];
  
                // 기존 디테일 커스텀 오버레이 제거 및 배열 초기화
                detailOverlays.forEach(overlay => {
                overlay.setMap(null);
                });
                detailOverlays = [];
  
                // 검색 결과에 따른 마커 생성.
                data.shelter.forEach(item => {
                // 검색된 주소 좌표 할당
                let positions = { x: item.longitude, y: item.latitude };
   
                let marker = new kakao.maps.Marker({
                    map,
                    position: new kakao.maps.LatLng(positions.y, positions.x),
                });
  
                markers.push(marker);
  
                // 커스텀 오버레이에 들어갈 컨텐츠 채워 넣기
                let content = `<div class ="overlay">${item.facility_name}</div>`;
                let detailContent = `
                <div class ="detail-content">
                    <div class = "facility-name">${item.facility_name}</div>
                    <div class = "address">${item.address}</div>
                    <div class = "facility-area">면적:${item.facility_area}㎡</div>
                    <div class = "department-number">☎ ${item.department_number}</div>
                </div>`;
  
                // 커스텀 오버레이 생성
                let customOverlay = new kakao.maps.CustomOverlay({
                    position: marker.getPosition(),
                    content,
                });
                let detailCustomOverlay = new kakao.maps.CustomOverlay({
                    position: marker.getPosition(),
                    content: detailContent,
                    yAnchor: 1.5,
                });
  
                // 커스텀 오버레이에 대한 이벤트 설정
                kakao.maps.event.addListener(
                    marker,
                    'mouseover',
                    () => {
                    customOverlay.setMap(map);
                    },
                );
                kakao.maps.event.addListener(
                    marker,
                    'mouseout',
                    () => {
                    customOverlay.setMap(null);
                    },
                );
                kakao.maps.event.addListener(marker, 'click', () => {
                    // 클릭 이벤트가 발생하면 customOverlay를 숨김
                    customOverlay.setMap(null);
                    detailOverlays.forEach(overlay => {
                    // 다른 overlay 숨김
                    overlay.setMap(null);
                    });
                    detailCustomOverlay.setMap(map);
                });
                // 생성된 detailCustomOverlay를 배열에 추가
                detailOverlays.push(detailCustomOverlay);
                bounds.extend(
                    new kakao.maps.LatLng(positions.y, positions.x),
                );
                map.setBounds(bounds);
                });
            }
            }).catch(error => {
        console.error('에러 발생:', error);
        });
    })
    document
    .getElementById('searchButton')
    .addEventListener('click', async () => {
        let searchInput = document.getElementById('searchInput').value;
        let url = `/shelters/mix?search=${searchInput}`
        await fetch(url)
        .then(response =>{
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            console.log(data)
            if (!data) {
                alert('해당 검색어에 대한 대피소 데이터가 없습니다.');
            } else {
                let bounds = new kakao.maps.LatLngBounds();
            // 기존 마커 제거 및 배열 초기화. setMap(null):기존에 생성된 마커들 모두 제거
            for (let i = 0; i < markers.length; i++) {
            markers[i].setMap(null);
            }
            markers = [];
  
            // 기존 디테일 커스텀 오버레이 제거 및 배열 초기화
            detailOverlays.forEach(overlay => {
            overlay.setMap(null);
            });
            detailOverlays = [];
  
            // 검색 결과 목록 초기화
            let searchResultList =
            document.getElementById('searchResultList');
            searchResultList.innerHTML = '';
  
            // 검색 결과에 따른 마커 생성.
            data.findShelterData.forEach((item, index) => {
            // 검색된 주소 좌표 할당
            let positions = { x: item.longitude, y: item.latitude };

            let marker = new kakao.maps.Marker({
                map,
                position: new kakao.maps.LatLng(positions.y, positions.x),
            });
  
            markers.push(marker);
  
            // 커스텀 오버레이에 들어갈 컨텐츠 채워 넣기
            let content = `<div class ="overlay">${item.facility_name}</div>`;
            let detailContent = `
                <div class ="detail-content">
                <div class = "facility-name">${item.facility_name}</div>
                <div class = "address">${item.address}</div>
                <div class = "facility-area">면적:${item.facility_area}㎡</div>
                <div class = "department-number">☎ ${item.department_number}</div>
                </div>`;
  
            // 커스텀 오버레이 생성
            let customOverlay = new kakao.maps.CustomOverlay({
                position: marker.getPosition(),
                content,
            });
            let detailCustomOverlay = new kakao.maps.CustomOverlay({
                position: marker.getPosition(),
                content: detailContent,
                yAnchor: 1.5,
            });
  
            // 커스텀 오버레이에 대한 이벤트 설정
            kakao.maps.event.addListener(marker, 'mouseover', () => {
                customOverlay.setMap(map);
            });
            kakao.maps.event.addListener(marker, 'mouseout', () => {
                customOverlay.setMap(null);
            });
            kakao.maps.event.addListener(marker, 'click', () => {
                // 클릭 이벤트가 발생하면 customOverlay를 숨김
                customOverlay.setMap(null);
                detailOverlays.forEach(function (overlay) {
                // 다른 overlay 숨김
                overlay.setMap(null);
                });
                detailCustomOverlay.setMap(map);
            });
            // 생성된 detailCustomOverlay를 배열에 추가
            detailOverlays.push(detailCustomOverlay);
            bounds.extend(new kakao.maps.LatLng(positions.y, positions.x));
  
            // 검색 결과 목록에 항목 추가
            let listItem = document.createElement('div');
            listItem.classList.add('list-item');
            listItem.innerHTML = `
                <div class = "list-facility-name">${item.facility_name}</div>
                <div class = "list-address">${item.address}</div>
                <div class = "list-department-number">☎ ${item.department_number}</div>`;
            // 검색 결과 목록 항목에 마우스 이벤트 리스너 추가
            listItem.addEventListener('mouseover', () => {
                customOverlay.setMap(map); // 마우스 오버 시 커스텀 오버레이 표시
            });
            listItem.addEventListener('mouseout', () => {
                customOverlay.setMap(null); // 마우스 아웃 시 커스텀 오버레이 숨김
            });
            searchResultList.appendChild(listItem);
            map.setBounds(bounds);
            });
            }       
        })
        .catch(error => {
            console.error('에러 발생:', error);
        });
    });
    });