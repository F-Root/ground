import Component from '../../common/Component.js';
import { icons } from '../../common/icons.js';
import * as api from '../../../public/api.js';
import { RegExp, isEmpty } from '../../common/util.js';

export default class Content extends Component {
  setup() {}
  template() {
    return /* HTML */ `<div class="content-wrapper">
      <div class="content-container">${content()}</div>
    </div>`;
  }
  setEvent() {
    this.addEvent('click', '.sign-up-form > button', handleSubmit);
    this.addEvent('focusin', 'input[name=email]', handleFocusin);
    this.addEvent('focusout', 'input[name=email]', handleFocusout);
    this.addEvent('focusin', 'input[name=password]', handleFocusin);
    this.addEvent('focusout', 'input[name=password]', handleFocusout);
    this.addEvent('focusin', 'input[name=nickname]', handleFocusin);
    this.addEvent('focusout', 'input[name=nickname]', handleFocusout);
  }
}

/* Functions */

const handleSubmit = async (event) => {
  event.preventDefault();
  const formData = new FormData(document.querySelector('.sign-up-form'));
  const signUpData = {};

  for (const pair of formData.entries()) {
    const result = await checkInputValidate(pair[0], pair[1]);
    const tagNow = document.querySelector(`input[name=${pair[0]}]`);
    changeFormCSS(tagNow, result);

    if (!result.validate) {
      tagNow.focus();
      return;
    }
    signUpData[pair[0]] = pair[1];
  }

  try {
    const newUser = await api.post('/signUp', Object.freeze(signUpData));
    renderWelcome(newUser.nick);
  } catch (error) {
    console.log('회원가입 도중 에러가 발생했습니다:', error);
    throw new Error('회원가입 도중 에러가 발생했습니다:', error.message);
  }
};

const handleFocusin = (event) => {
  const element = event.target;

  element.style.borderColor = '#1cbd22';
  element.style.zIndex = '10';
};

const handleFocusout = async (event) => {
  const element = event.target;
  const result = await checkInputValidate(element.name, element.value);

  changeFormCSS(element, result);
};

const changeFormCSS = (element, result) => {
  const error = document.querySelector(`.error-${element.name}`);

  if (!result.validate) {
    element.style.borderColor = 'red';
    element.style.zIndex = '5';
    error.innerHTML = result.message;

    return;
  }
  element.style.borderColor = 'gray';
  element.style.zIndex = '0';
  error.innerHTML = result.message;
};

const checkInputValidate = async (name, value) => {
  if (name === 'email') {
    return await checkEmail(value);
  }
  if (name === 'password') {
    return checkPassword(value);
  }
  if (name === 'nickname') {
    return checkNickname(value);
  }
};

const checkEmail = async (email) => {
  if (isEmpty(email)) {
    return { validate: false, message: '! 이메일: 필수 정보입니다.' };
  }
  if (!RegExp.email.test(email)) {
    return {
      validate: false,
      message: '! 이메일 형식이 올바르지 않습니다. (예시: example@gmail.com)',
    };
  }
  if (!(await checkEmailDuplicate(email))) {
    return { validate: false, message: '! 이미 사용 중인 이메일입니다.' };
  }
  return { validate: true, message: '' };
};

const checkEmailDuplicate = async (email) => {
  try {
    const query = `available?email=${email}`;
    const result = await api.get('/signUp', query);
    return result.available;
  } catch (error) {
    console.error('이메일 중복을 확인하는 도중 에러가 발생했습니다:', error);
    throw new Error('Failed to check email duplicate.');
  }
};

const checkPassword = (password) => {
  if (isEmpty(password)) {
    return { validate: false, message: '! 비밀번호: 필수 정보입니다.' };
  }
  if (!RegExp.password.test(password)) {
    return {
      validate: false,
      message:
        '! 비밀번호: 8자 이상의 영문(대/소문자), 숫자, 특수문자를 사용해 주세요.',
    };
  }
  return { validate: true, message: '' };
};

const checkNickname = (nickname) => {
  if (isEmpty(nickname)) {
    return { validate: false, message: '! 닉네임: 필수 정보입니다.' };
  }
  if (!RegExp.nickname.test(nickname)) {
    return { validate: false, message: '! 닉네임: 2~10자로 작성해주세요.' };
  }
  return { validate: true, message: '' };
};

const renderWelcome = (nickname) => {
  const container = document.querySelector('.content-container');

  container.innerHTML = welcome(nickname);
};

/* HTML FORMS */

const content = () => {
  return /* HTML */ `<div class="content">
    ${logo()} ${signUpContainer()} ${otherLinks()}
  </div>`;
};

const logo = () => {
  return /* HTML */ `<div class="ground_logo">${icons.logo}</div>`;
};

const signUpContainer = () => {
  return /* HTML */ `<div class="sign-up-container">
    <h3>회원가입</h3>
    ${signUpForm()}
  </div>`;
};

const signUpForm = () => {
  return /* HTML */ `<form class="sign-up-form">
    <div class="sign-up-input">
      <input type="text" name="email" placeholder="이메일" />
    </div>
    <div class="sign-up-input">
      <input type="password" name="password" placeholder="비밀번호" />
    </div>
    <div class="sign-up-input">
      <input type="text" name="nickname" placeholder="닉네임" />
    </div>
    <div class="sign-up-error-text">
      <div class="error-email"></div>
      <div class="error-password"></div>
      <div class="error-nickname"></div>
    </div>
    <button type="submit">회원가입</button>
  </form>`;
};

const otherLinks = () => {
  return /* HTML */ `<div class="social-sign-up">
    <h3>다른 계정으로 가입하기</h3>
    <div class="social-list">
      ${google()} ${github()} ${kakao()} ${naver()} ${facebook()}
    </div>
  </div>`;
};

const google = () => {
  return /* HTML */ ``;
};

const github = () => {
  return /* HTML */ `${icons.github}`;
};

const kakao = () => {
  return /* HTML */ ``;
};

const naver = () => {
  return /* HTML */ ``;
};

const facebook = () => {
  return /* HTML */ ``;
};

const welcome = (nickname) => {
  return /* HTML */ `<div class="welcome-page-wrapper">
    <div class="welcome-page">
      <div class="confirm">${icons.check}</div>
      <div>환영합니다!</div>
      <div>
        <div class="nickname">${nickname}</div>
        님
      </div>
      <div class="instructions">
        <p>회원가입이 성공적으로 완료되었습니다.</p>
        <p>로그인 후 서비스를 이용하실 수 있습니다.</p>
      </div>
      <button onclick="location.href='/signIn'">로그인</button>
    </div>
  </div>`;
};
