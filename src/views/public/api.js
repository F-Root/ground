//get
const get = async (endPoint, params = '') => {
  const apiUrl = `/api/${endPoint}/${params}`;
  console.log(`%cGET 요청: ${apiUrl} `, 'color: #a25cd1;');

  const res = await fetch(apiUrl, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  });

  if (!res.ok) {
    const errorContent = await res.join();
    const { reason } = errorContent;

    throw new Error(reason);
  }

  const result = await res.json();

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
      // Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
    body: bodyData,
  });

  if (!response.ok) {
    const errorContent = await response.json();
    const { reason } = errorContent;

    throw new Error(reason);
  }

  const result = await response.json();

  return result;
};
//put
//patch
//delete

export { get, post };
