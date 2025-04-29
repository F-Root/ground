import AppError from './errorHandler.js';
import { isEmpty } from './util.js';

//get
const get = async ({ endPoint, params = '', query = '' }) => {
  const apiUrl = `/api${urlSet(endPoint)}${urlSet(params)}${urlSet(query)}`;
  // console.log(`%cGET 요청: ${apiUrl} `, 'color: #a25cd1;');

  const response = await fetch(apiUrl, {
    method: 'GET',
    headers: {
      // Authorization: `Bearer ${localStorage.getItem('token')}`, -> localStorage에 token을 관리하지 않음.
    },
    credentials: 'include',
  });

  if (!response.ok) {
    const errorContent = await response.json();
    const { type, description } = errorContent;

    throw new AppError(type, description);
  }

  const result = await response.json();

  return result;
};

//post
const post = async ({ endPoint, params = '', query = '', data }) => {
  const apiUrl = `/api${urlSet(endPoint)}${urlSet(params)}${urlSet(query)}`;
  // check data contains file(blob) and set content type
  const { headers, bodyData } = setContentTypeWithData(data);

  // console.log(`%cPOST 요청: ${apiUrl}`, 'color: #296aba;');
  // console.log(`%cPOST 요청 데이터: ${bodyData}`, 'color: #296aba;');

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers,
    credentials: 'include',
    body: bodyData,
  });

  if (!response.ok) {
    const errorContent = await response.json();
    const { type, description } = errorContent;

    throw new AppError(type, description);
  }

  const result = await response.json();

  return result;
};

//put
const put = async ({ endPoint, params = '', query = '', data }) => {
  const apiUrl = `/api${urlSet(endPoint)}${urlSet(params)}${urlSet(query)}`;
  // check data contains file(blob) and set content type
  const { headers, bodyData } = setContentTypeWithData(data);

  // console.log(`%cPUT 요청: ${apiUrl}`, 'color: #059c4b;');
  // console.log(`%cPUT 요청 데이터: ${bodyData}`, 'color: #059c4b;');

  const response = await fetch(apiUrl, {
    method: 'PUT',
    headers,
    credentials: 'include',
    body: bodyData,
  });

  if (!response.ok) {
    const errorContent = await response.json();
    const { type, description } = errorContent;

    throw new AppError(type, description);
  }

  const result = await response.json();

  return result;
};

//patch
const patch = async ({ endPoint, params = '', query = '', data }) => {
  const apiUrl = `/api${urlSet(endPoint)}${urlSet(params)}${urlSet(query)}`;
  // check data contains file(blob) and set content type
  const { headers, bodyData } = setContentTypeWithData(data);

  // console.log(`%cPATCH 요청: ${apiUrl}`, 'color: #059c4b;');
  // console.log(`%cPATCH 요청 데이터: ${bodyData}`, 'color: #059c4b;');

  const response = await fetch(apiUrl, {
    method: 'PATCH',
    headers,
    credentials: 'include',
    body: bodyData,
  });

  if (!response.ok) {
    const errorContent = await response.json();
    const { type, description } = errorContent;

    throw new AppError(type, description);
  }

  const result = await response.json();

  return result;
};

//delete
const del = async ({ endPoint, params = '', query = '', data }) => {
  const apiUrl = `/api${urlSet(endPoint)}${urlSet(params)}${urlSet(query)}`;
  // check data contains file(blob) and set content type
  const { headers, bodyData } = setContentTypeWithData(data);

  // console.log(`%cDELETE 요청 ${apiUrl}`, 'color: #dd2e2e;');
  // console.log(`%cDELETE 요청 데이터: ${bodyData}`, 'color: #dd2e2e;');

  const response = await fetch(apiUrl, {
    method: 'DELETE',
    headers,
    credentials: 'include',
    body: bodyData,
  });

  if (!response.ok) {
    const errorContent = await response.json();
    const { type, description } = errorContent;

    throw new AppError(type, description);
  }

  const result = await response.json();

  return result;
};

const urlSet = (element) => {
  if (isEmpty(element)) {
    return '';
  }
  if (element.split('')[0] !== '/') {
    return `/${element}`;
  }
  return element;
};

const setContentTypeWithData = (data) => {
  if (data instanceof FormData) {
    return {
      headers: {
        // 'Content-Type': 'multipart/form-data', -> FormData를 사용할 경우 Content-Type 헤더는 자동으로 설정됨
      },
      bodyData: data,
    };
  } else {
    return {
      headers: {
        'Content-Type': 'application/json',
      },
      bodyData: JSON.stringify(data),
    };
  }
};

export { get, post, put, patch, del as delete };
