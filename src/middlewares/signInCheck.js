// token check 이후 로그인 페이지로 이동시켜주는 middleware
const signInCheck = async (error, req, res, next) => {
  const url = req.originalUrl; // req.baseUrl + req.url = req.originalUrl
  console.log('return URL : ', url);
  console.error(error.name, error.message);

  /* check signout Error */
  // 브라우저에서 쿠키가 삭제된 후에 로그아웃 버튼이 눌렸을때
  if (url.includes('/signOut')) {
    return next();
  }

  // check url is '/signin'
  if (url.includes('/signin')) {
    return next();
  }

  // check url is '/signup'
  if (url.includes('/signup')) {
    return next();
  }

  // token not exist in browser
  if (error.name.includes('Unauthorized')) {
    return res.redirect(
      `/signin/?returnUrl=http://localhost:3000${encodeURI(url)}`
    );
  }

  // token not exist in DB
  if (error.name.includes('RefreshTokenNotExist')) {
    return res.redirect(
      `/signin/?returnUrl=http://localhost:3000${encodeURI(url)}`
    );
  }

  // refresh token expired
  if (
    error.name.includes('TokenExpired') ||
    error.name.includes('InvalidToken')
  ) {
    return res.redirect(
      `/signin/?returnUrl=http://localhost:3000${encodeURI(url)}`
    );
  }

  next();
};

export { signInCheck };
