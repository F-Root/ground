import Component from '../../common/Component.js';
import { icons } from '../../common/icons.js';
import * as api from '../../../public/api.js';

export default class Content extends Component {
  setup() {}
  template() {
    return /* HTML */ `<div class="content-wrapper">
      <div class="content-container">${content()}</div>
    </div>`;
  }
  setEvent() {
    this.addEvent('click', '.ground_logo', () => {
      location.href = '/';
    });
    this.addEvent('click', '.sign-in-form > button', handleSubmit);
  }
}

/* Functions */

const handleSubmit = async (event) => {
  event.preventDefault();
  const formData = new FormData(document.querySelector('.sign-in-form'));
  const signInData = {};

  for (const pair of formData.entries()) {
    signInData[pair[0]] = pair[1];
  }

  try {
    await api.post('/signIn', Object.freeze(signInData));
    alert('로그인 성공');
    location.href = '/';
  } catch (error) {
    console.error(error.stack);
    alert('에러발생');
  }
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
      <input type="text" name="email" placeholder="이메일" />
    </div>
    <div class="sign-in-input">
      <input type="text" name="password" placeholder="비밀번호" />
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
  return /* HTML */ `<p class="find-pw"><a>Forgot your password?</a></p>`;
};

const signUp = () => {
  return /* HTML */ `<p class="sign-up"><a>Sign Up</a></p>`;
};
