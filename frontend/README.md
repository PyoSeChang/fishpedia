# Fishipedia Frontend

Fishipedia는 낚시꾼들을 위한 종합 플랫폼입니다. 물고기 도감, 낚시 일지, 낚시 스팟 지도, 커뮤니티 기능을 제공합니다.

## 주요 기능

### 🐟 물고기 도감
- 다양한 물고기 정보 조회
- 물고기별 상세 정보 및 낚시 팁

### 📋 낚시 일지
- 개인 낚시 기록 관리
- 물고기 포획 기록 및 통계
- 레벨 시스템 및 점수 관리

### 📍 낚시 스팟 (NEW!)
- **지도 기반 낚시 스팟 탐색**
- **네이버 지도 API 연동**
- **스팟별 상세 정보 (어종, 난이도, 시설 등)**
- **필터링 및 검색 기능**
- **실시간 마커 클릭으로 상세 정보 확인**

### 💬 커뮤니티
- 게시판 (공지사항, 자유게시판, 질문게시판, 팁게시판, 리뷰게시판)
- 낚시꾼 및 물고기 랭킹 시스템
- Slate 에디터를 통한 풍부한 텍스트 편집
- 이미지 업로드 및 앨범 기능

## 기술 스택

- **Frontend**: React 19.1.0, TypeScript
- **Styling**: Tailwind CSS
- **텍스트 에디터**: Slate.js
- **지도 API**: 네이버 지도 API
- **라우팅**: React Router Dom
- **HTTP 클라이언트**: Axios

## 네이버 지도 API 설정

낚시 스팟 기능을 사용하려면 네이버 클라우드 플랫폼에서 지도 API 키를 발급받아야 합니다.

### 1. API 키 발급
1. [네이버 클라우드 플랫폼](https://www.ncloud.com/)에서 계정 생성
2. **AI·Application Service > AI·NAVER API > Maps** 메뉴 이동
3. **Application 등록** 클릭
4. 서비스 정보 입력:
   - **Application 이름**: Fishipedia (또는 원하는 이름)
   - **서비스 URL**: http://localhost:3000
   - **Maps**: Web Dynamic Map 선택

### 2. 도메인 설정 (중요!)
**API 인증 실패의 가장 흔한 원인**
```
허용 도메인 설정:
- http://localhost:3000
- http://127.0.0.1:3000
- http://localhost:3000/spots (필요시)
```

### 3. 환경 변수 설정
`.env` 파일에 API 키 설정:
```bash
REACT_APP_NAVER_MAP_CLIENT_ID=your_client_id_here
REACT_APP_NAVER_MAP_CLIENT_SECRET=your_client_secret_here
```

### 🔧 트러블슈팅

#### ❌ "Open API 인증이 실패했습니다" (Error Code 200)
**원인**: 웹 서비스 URL 미등록
**해결**: 
1. [네이버 클라우드 플랫폼 콘솔](https://console.ncloud.com) 접속
2. AI·Application Service → AI·NAVER API → Maps
3. 해당 Application 클릭 → **웹 서비스 URL**에 다음 추가:
   ```
   http://localhost:3000
   ```

#### ⚠️ 중요: API 전환 안내
**기존 AI NAVER API → 신규 Maps API 전환 필요**
- 기존 API 점진적 종료 예정
- 신규 API 가이드: https://navermaps.github.io/maps.js.ncp/docs/tutorial-2-Getting-Started.html

#### ❌ "스크립트 로딩 실패"
**원인**: 네트워크 문제 또는 잘못된 API 키
**해결**: 
1. 인터넷 연결 확인
2. API 키 재확인
3. 브라우저 콘솔에서 상세 에러 확인

#### ❌ "지도가 회색으로 표시됨"
**원인**: API 로딩은 됐지만 인증 실패
**해결**: 
1. 허용 도메인 재확인
2. API 서비스 활성화 상태 확인
3. 무료 사용량 초과 여부 확인

#### 🔍 디버깅 방법
브라우저 개발자 도구(F12) > Console 탭에서 다음 로그 확인:
```
✅ "네이버 지도 API 로딩 시작..."
✅ "네이버 지도 API 로딩 완료"
✅ "네이버 지도 초기화 시작..."
✅ "지도 생성 완료!"
✅ "마커 추가 완료: 한강 반포대교 낚시터"
```

#### 📞 현재 설정된 API 키
- **Client ID**: `gfnyi4izq0`
- **도메인 등록 필요**: `localhost:3000`, `127.0.0.1:3000`

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).
