const RegExp = {
  email: /^[\w.%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
  password:
    /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_+={}[\];:'",<>.?/-])[A-Za-z\d!@#$%^&*()_+={}[\];:'",<>.?/-]{8,}$/,
  nickname:
    /^[ㄱ-ㅎㅏ-ㅣ가-힣a-zA-Z0-9!@#$%^&*(),.?":{}|<>_+=\-[\]\\';:`~]{2,10}$/,
};

const isEmpty = (inputValue) => {
  return inputValue.trim() === '';
};

export { RegExp, isEmpty };
