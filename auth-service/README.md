## 1. 소개

<div style="font-weight: bold;">- 로그인 상태, 인증 (JWT 토큰, 서버 세션), base HTTP 네트워크 로직 관련 공통 모듈입니다.</div>
</br>
<div style="font-weight: bold;">- 기존에 활용하던 Provider 중첩 구조를 개선하기 위해 제작되었습니다.</div>

## 2. 사용 라이브러리 및 버전 (제작 시점 기준, 2024/08/27)

### 1. recoil (^0.7.7)

- 로그인 상태를 저장하는 전역상태 관리 도구

### 2. recoil-persist (^5.1.0)

- 전역 상태를 세션/로컬 스토리지에 저장하고 초기값으로 지정

### 3. @tanstack/react-query (^5.51.23)

- 인증 데이터 (Token) 캐싱 및 갱신 작업을 수행

### 4. @tanstack/query-sync-storage-persister (^5.51.21)

- 캐싱 데이터를 세션/로컬 스토리지에 저장하고 초기값으로 지정

### 5. @tanstack/react-query-persist-client (^5.51.23)

- 상동 (?)

## 3. 구성 요소

- 디렉토리/파일 구성
- hook, service, state, type(?)

## 4. 로직 설명

- (3)번의 구성 요소를 활용해서 로직이 어떻게 구성되는지

5. 사용법

- 간단한 예시 코드

6. issue (?)

- recoil 교체 필요성
- 기타

7. 부록 (?)

- tanstack/react-query 간단한 사용 설명?
