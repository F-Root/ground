import { isNull } from './util.js';
import AppError from './errorHandler.js';

//get
const get = async (endPoint, params) => {
  const apiUrl = isNull(params)
    ? `/api${endPoint}`
    : `/api${endPoint}/${params}`;
  console.log(`%cGET 요청: ${apiUrl} `, 'color: #a25cd1;');

  const response = await fetch(apiUrl, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
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
const post = async (endPoint, data) => {
  const apiUrl = `/api${endPoint}`;
  const bodyData = JSON.stringify(data);
  console.log(`%cPOST 요청: ${apiUrl}`, 'color: #296aba;');
  console.log(`%cPOST 요청 데이터: ${bodyData}`, 'color: #296aba;');

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
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
//patch
//delete

export { get, post };
