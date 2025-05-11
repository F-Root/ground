import AppError from './errorHandler.js';

const RegEx = {
  user: {
    email: /^[\w.%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
    authNumber: /^[0-9]+$/,
    id: /^[a-zA-Z0-9]{5,12}$/,
    password:
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_+={}[\];:'",<>.?/-])[A-Za-z\d!@#$%^&*()_+={}[\];:'",<>.?/-]{8,}$/,
    nickname:
      // /^[ㄱ-ㅎㅏ-ㅣ가-힣a-zA-Z0-9!@#$%^&*(),.?":{}|<>_+=\-[\]\\';:`~ ]{2,10}$/,
      /^.{2,10}$/,
  },
  ground: {
    name: /^[a-zA-Z0-9가-힣\s/]+$/i,
    id: /^[\w]+$/i,
  },
  rate: /^[0-9]+$/,
};

// 검색 키워드 동적 정규식 생성
const buildRegex = (keyword) => {
  if (isEmpty(keyword)) return;
  const data = keyword.split('');
  const regData =
    data.reduce((acc, cur) => {
      const escData = escapeRegExp(cur);
      // 키워드 순서에 맞게
      return (acc += `(?:.*${escData})`);
    }, '') + '.*';
  return new RegExp(regData);
};

function escapeRegExp(str) {
  // 메타문자 앞에 역슬래시 추가
  return str.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
}

const isEmpty = (inputValue) => {
  if (typeof inputValue === 'number') {
    return inputValue === 0;
  }
  if (typeof inputValue === 'string') {
    return inputValue.trim() === '';
  }
  if (typeof inputValue === 'object') {
    return inputValue.length === 0;
  }
  return isNull(inputValue);
};

const isNull = (value) => {
  return value === undefined || value === null ? true : false;
};

const generateRandomNumber = ({ type, digit }) => {
  let base;

  switch (type) {
    case 2:
      base = 2;
      break;
    case 8:
      base = 8;
      break;
    case 10:
      base = 10;
      break;
    case 16:
      base = 16;
      break;
    default:
      throw new AppError(
        '지원하지 않는 타입입니다.',
        '"2,8,10,16"진수 중 하나를 입력하세요.'
      );
  }

  // 자릿수에 따른 최소값과 최대값 계산
  // 예: 10진수 5자리 -> 최소값: 10^(5-1)=10000, 최대값: 10^5 - 1 = 99999
  let min, max;
  if (digit === 1) {
    // 한 자리일 경우 0부터 최대값까지 (예: 10진수면 0~9)
    min = 0;
    max = base - 1;
  } else {
    min = Math.pow(base, digit - 1);
    max = Math.pow(base, digit) - 1;
  }

  // 랜덤 정수를 min ~ max 범위 내에서 생성
  const randomNum = Math.floor(Math.random() * (max - min + 1)) + min;

  // 해당 진법 문자열로 변환
  // 16진수는 보통 대문자로 표현하기 위해 toUpperCase()를 사용
  let result = randomNum.toString(base);
  if (base === 16) {
    result = result.toUpperCase();
  }

  // 결과 문자열의 길이가 digit보다 작을 경우 앞에 0을 추가하여 자리수를 맞춤
  if (result.length < digit) {
    result = '0'.repeat(digit - result.length) + result;
  }

  return result;
};

// debounce 함수: 연속 호출되는 함수를 지정 시간 이후에 한 번만 실행되도록 지연시킴
function debounce(fn, wait = 300, options = {}) {
  // 내부 상태 변수들
  let timer; // setTimeout을 저장할 변수 (지연 실행 예약)
  let lastCall = 0; // 마지막 호출 시간을 기억함

  // 옵션에서 leading/trailing/maxWait 추출, 기본값 설정
  const { leading = false, trailing = true, maxWait } = options;

  // 실제로 실행되는 내부 콜백 (fn을 지정된 this와 args로 호출)
  const invoke = (context, args) => fn.apply(context, args);

  // 사용자가 호출할 디바운스된 함수
  const debounced = (...args) => {
    const now = Date.now(); // 현재 시간 저장

    // 첫 호출 시점 저장
    if (!lastCall) lastCall = now;

    const remaining = wait - (now - lastCall); // 남은 대기 시간 계산
    clearTimeout(timer); // 이전 타이머 취소 (입력이 연속되면 기존 예약 제거)

    // maxWait 조건이 충족되면 즉시 실행
    if (maxWait && now - lastCall >= maxWait) {
      invoke(this, args); // 원본 함수 실행
      lastCall = now; // 마지막 실행 시간 갱신
    }
    // 대기 시간 초과시 실행
    else if (remaining <= 0) {
      if (leading && !timer) {
        invoke(this, args); // leading 옵션이 켜져 있으면 최초 1회 즉시 실행
      }
      lastCall = now;
    }

    // 새 타이머 예약: wait 시간이 지나면 trailing 콜백 실행
    timer = setTimeout(
      () => {
        if (trailing && (!leading || timer)) {
          invoke(this, args); // trailing 실행
        }
        lastCall = 0; // 상태 초기화
        timer = null;
      },
      remaining > 0 ? remaining : wait
    );
  };

  // 사용자가 수동으로 디바운스 타이머를 취소할 수 있도록 cancel 메서드 추가
  debounced.cancel = () => clearTimeout(timer);

  return debounced;
}

// 쿼리 스트링 분리 함수 (리턴값은 객체)
function parseQueryStringToObj(queryString) {
  const urlParams = new URLSearchParams(queryString);

  //객체에 저장
  const queryObj = {};
  for (const [key, value] of urlParams.entries()) {
    queryObj[key] = value;
  }

  return queryObj;
}

// 전달 받은 쿼리 스트링 객체로 최종 쿼리 스트링을 제작해주는 함수
function createQueryStringByObj(queryStringObj) {
  // 값이 없는 속성 필터링
  const queries = Object.entries(queryStringObj).filter(
    ([key, value]) => !isNull(value)
  );
  // 필터링 된 데이터를 이용해 최종 쿼리 생성
  const finalQuery = new URLSearchParams([...queries]).toString();
  return finalQuery ? `?${finalQuery}` : finalQuery;
}

export {
  RegEx,
  isEmpty,
  isNull,
  buildRegex,
  generateRandomNumber,
  debounce,
  parseQueryStringToObj,
  createQueryStringByObj,
};
