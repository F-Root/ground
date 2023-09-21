import Component from '../../common/Component.js';
import { icons } from '../../common/icons.js';

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
    this.addEvent('click', '.sign-in-form > button', () => {});
  }
}

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
    <div class="sign-in-input"><input type="text" placeholder="EMAIL" /></div>
    <div class="sign-in-input"><input type="text" placeholder="PW" /></div>
    <button>Sign In</button>
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
