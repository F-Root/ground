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
    this.addEvent('click', '.sign-up-form > button', (event) => {
      event.preventDefault();
      const formData = new FormData(document.querySelector('.sign-up-form'));
      const signUpData = {};

      for (const pair of formData.entries()) {
        signUpData[pair[0]] = pair[1];
      }

      console.log(Object.freeze(signUpData));

      api.post('/signUp', Object.freeze(signUpData));
    });
  }
}

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
      <input type="text" name="password" placeholder="비밀번호" />
    </div>
    <div class="sign-up-input">
      <input type="text" name="nickname" placeholder="닉네임" />
    </div>
    <button type="submit">회원가입</button>
  </form>`;
};

const otherLinks = () => {
  return /* HTML */ `<div class="social-sign-up">
    <p>다른 계정으로 가입하기</p>
    ${google()} ${github()} ${kakao()} ${naver()} ${facebook()}
  </div>`;
};

const google = () => {
  return /* HTML */ ``;
};

const github = () => {
  return /* HTML */ ``;
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
