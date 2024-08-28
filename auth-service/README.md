## 1. Introduction

<div>- 인증/서비스 로직 관리를 위한 React Custom Hook 기반의 모듈입니다.</div>
<div>- 로그인/로그아웃 처리, 인증 데이터 갱신/만료, HTTP/HTTPS 통신 기본 로직을 수행합니다.</div>
<div>- Custom Hook 의 관심사를 분리하여 디버깅이 용이하도록 설계하였습니다.</div>
<div>- Config/Parameter 변경으로 간단하게 세부 동작을 제어할 수 있도록 제작되었습니다.</div>

## 2. Dependencies (Libraries Used)

<div>- recoil (^0.7.7)</div>
<div>- recoil-persist (^5.1.0)</div>
<div>- @tanstack/react-query (^5.51.23)</div>
<div>- @tanstack/query-sync-storage-persister (^5.51.21)</div>
<div>- @tanstack/query-sync-storage-persister (^5.51.21)</div>

## 3. Structure (Directories and Files)

<pre>
┣ 📂src
┃ ┣ 📂aboutReactQuery
┃ ┃ ┣ 📜filterStoredQueries.ts
┃ ┃ ┣ 📜QueryProvider.tsx
┃ ┃ ┗ 📜useGetCachingData.ts
┃ ┣ 📂atom
┃ ┃ ┣ 📜authExpireTimeAtom.ts
┃ ┃ ┣ 📜authStateAtom.ts
┃ ┃ ┗ 📜authTypeAtom.ts
┃ ┣ 📂type
┃ ┃ ┗ 📜type.ts
┃ ┣ 📂useAuth
┃ ┃ ┗ 📜useAuth.ts
┃ ┣ 📂useAuthManager
┃ ┃ ┣ 📜useAuthExpireTime.ts
┃ ┃ ┗ 📜useAuthManager.ts
┃ ┣ 📂useService
┃ ┃ ┗ 📜useService.ts
┃ ┣ 📂util
┃ ┃ ┣ 📜convertMillisecondsToMMSS.ts
┃ ┃ ┣ 📜findValueByKey.ts
┃ ┃ ┗ 📜selectNecessaryData.ts
┃ ┗ 📜config.ts
</pre>

#### 1) useAuth

<span>- 로그인/로그아웃 관련된 로직을 담당합니다.</span>
<span>- 로그인 여부 및 로그인/로그아웃에 파생되는 작업을 수행합니다. (ex. 페이지 경로 변경 등)</span>

#### 2) useAuthManager

<span>- 로그인 이후 인증 데이터 관리 로직을 담당합니다.</span>
<span>- 인증 데이터 갱신/만료 관련 작업을 수행합니다.</span>

<span>- useAuthManager : 인증 데이터 갱신 관련 작업 수행</span>
<span>- useAuthExpireTime : 인증 데이터 만료 관련 작업 수행</span>

#### 3) useService

<span>- HTTP/HTTPS 통신 관련 기본 로직을 담당합니다.</span>

#### 4) aboutReactQuery

<span>- 모듈 구현 시 사용되는 tanstack-query 활용과 관련된 함수 및 Provider 입니다.</span>

#### 5) etc (util, type, atom, config)

<span>- 모듈 구현 시 사용되는 tanstack-query 활용과 관련된 함수 및 Provider 입니다.</span>

<span>- QueryProvider : tanstack-query 저장소 활용을 위해 설정해야 하는 Provider</span>
<span>- filterStoredQueries : tanstack-query로 캐싱한 데이터를 브라우저 스토리지와 연동할 때 필요한 메서드 <br/>(캐싱 데이터 중 필요한 것만 선택해서 스토리지에 sava/load 할 수 있도록 처리) </span>
<span>- useGetCachingData : tanstack-query로 캐싱한 데이터를 필요한 컴포넌트에서 호출하여 사용할 수 있도록 구현한 Custom Hook</span>

## 4. Logic (How it Works)

- (3)번의 구성 요소를 활용해서 로직이 어떻게 구성되는지

## 5. Usage (Sample Code)

- 간단한 예시 코드

## 6. issue

- recoil 교체 필요성
- 기타
