import { AppError } from './index.js';

const validateRequestWith = (schema, paramLocation) => {
  return async (req, res, next) => {
    try {
      // 라우터에서도 파싱된 데이터를 사용하도록 업데이트
      req[paramLocation] = parseJSONProperties(req[paramLocation]);
      await schema.validateAsync(req[paramLocation]);
      next();
    } catch (error) {
      // throw new Error(error.message);
      console.error(error);
      next(
        new AppError(
          'ServerError',
          '알 수 없는 에러가 발생하였습니다.\n서버 관리자에게 문의하십시오.',
          500
        )
      );
    }
  };
};

/**
 * 객체 내의 문자열화된 JSON 속성을 파싱하는 함수
 * 객체의 각 속성값 중 JSON.stringify로 문자열화된 객체나 배열,
 * 그리고 'true'/'false' 문자열을 찾아 파싱한다.
 *
 * @param {Object} data - 처리할 객체
 * @param {Object} options - 옵션
 * @param {boolean} options.deep - 중첩된 객체도 처리할지 여부 (기본값: true)
 * @param {Array<string>} options.only - 특정 속성만 처리하려는 경우 속성명 배열 지정
 * @returns {Object} - 파싱된 객체
 */
function parseJSONProperties(data, options = {}) {
  // 데이터가 객체가 아니거나 null이면 그대로 반환
  if (typeof data !== 'object' || data === null) {
    return data;
  }

  // 기본 옵션 설정
  const { deep = true, only = null } = options;

  // 결과 객체 (원본 복사)
  const result = Array.isArray(data) ? [...data] : { ...data };

  // 객체의 각 속성 순회
  for (const key in result) {
    // 특정 속성만 처리하는 옵션이 있고, 현재 키가 포함되지 않으면 스킵
    if (only && !only.includes(key)) {
      continue;
    }

    const value = result[key];

    // 값이 문자열인 경우
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        // 파싱 결과가 객체나 배열 또는 boolean인 경우만 교체
        if (
          parsed !== null &&
          ['object', 'boolean'].includes(typeof parsed)
          // (typeof parsed === 'object' || typeof parsed === 'boolean')
        ) {
          result[key] = parsed;
        }
      } catch (e) {
        // 파싱 실패시 원래 값 유지 (아무 작업 안함)
      }
    }
    // 중첩된 객체를 처리할지 결정 (deep 옵션이 true인 경우)
    else if (deep && typeof value === 'object' && value !== null) {
      result[key] = parseJSONProperties(value, options);
    }
  }

  return result;
}

export { validateRequestWith };
