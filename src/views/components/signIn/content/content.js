import Component from '../../common/Component.js';
import { icons } from '../../../public/icons.js';
import * as api from '../../../public/api.js';
import { RegExp, isEmpty } from '../../../public/util.js';

export default class Content extends Component {
  template() {
    return /* HTML */ `<div class="content-wrapper">
      <div class="content-container">${content()}</div>
    </div>`;
  }
  setEvent() {
    this.addEvent('click', '.ground_logo', () => {
      location.href = '/';
    });
    this.addEvent(
      'click',
      '.sign-in-form > button',
      this.handleSubmit.bind(this)
    );
    this.addEvent('focusin', 'input[name=email]', handleFocusin);
    this.addEvent('focusout', 'input[name=email]', handleFocusout);
    this.addEvent('focusin', 'input[name=password]', handleFocusin);
    this.addEvent('focusout', 'input[name=password]', handleFocusout);
  }

  async handleSubmit(event) {
    event.preventDefault();
    const formData = new FormData(document.querySelector('.sign-in-form'));
    const signInData = {};

    for (const pair of formData.entries()) {
      const result = checkInputValidate(pair[0], pair[1]);
      const tagNow = document.querySelector(`input[name=${pair[0]}]`);
      changeFormCSS(tagNow, result);

      if (!result.validate) {
        tagNow.focus();
        return;
      }
      signInData[pair[0]] = pair[1];
    }

    try {
      await api.post('/signin', Object.freeze(signInData));
      location.href = '/';
    } catch (error) {
      if (error.name.includes('userInfoError')) {
        showSignInError(error.message);
      }
    }
  }
}

/* Functions */

const showSignInError = (message) => {
  const element = document.querySelector('.error-message');
  element.innerHTML = message;
};

const handleFocusin = (event) => {
  const element = event.target;

  element.style.borderColor = '#1cbd22';
  element.style.zIndex = '10';
};

const handleFocusout = (event) => {
  const element = event.target;

  element.style.borderColor = 'gray';
  element.style.zIndex = '0';
};

const changeFormCSS = (element, result) => {
  const error = document.querySelector(`.error-message`);

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

const checkInputValidate = (name, value) => {
  if (name === 'email') {
    return checkEmail(value);
  }
  if (name === 'password') {
    return checkPassword(value);
  }
};

const checkEmail = (email) => {
  if (isEmpty(email)) {
    return { validate: false, message: '이메일을 입력해 주세요.' };
  }
  if (!RegExp.email.test(email)) {
    return {
      validate: false,
      message: '이메일 형식이 올바르지 않습니다.',
    };
  }
  return { validate: true, message: '' };
};

const checkPassword = (password) => {
  if (isEmpty(password)) {
    return { validate: false, message: '비밀번호를 입력해 주세요.' };
  }
  return { validate: true, message: '' };
};

/* HTML FORMS */

const content = () => {
  return /* HTML */ `<div class="content">
    ${logo()} ${signInForm()} ${otherLinks()}
  </div>`;
};

const logo = () => {
  return /* HTML */ `<div class="ground_logo">${icons.logo}</div>`;
};

const signInForm = () => {
  return /* HTML */ `<form class="sign-in-form">
    <div class="sign-in-input">
      <input type="email" name="email" placeholder="이메일" />
    </div>
    <div class="sign-in-input">
      <input type="password" name="password" placeholder="비밀번호" />
    </div>
    <div class="sign-in-error-text">
      <div class="error-message"></div>
    </div>
    <button>로그인</button>
  </form>`;
};

const otherLinks = () => {
  return /* HTML */ `<div class="other-links">
    ${findPassword()}${signUp()}
  </div>`;
};

const findPassword = () => {
  return /* HTML */ `<p class="find-pw">
    <a href="">Forgot your password?</a>
  </p>`;
};

const signUp = () => {
  return /* HTML */ `<p class="sign-up"><a href="/signup">Sign Up</a></p>`;
};
