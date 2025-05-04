import Component from '../../../components/core/Component.js';
import { icons } from '../../../public/icons.js';
import * as api from '../../../public/api.js';
import { RegEx, isEmpty } from '../../../public/util.js';
import ErrorModal from '../../../components/common/ErrorModal.js';

export default class Content extends Component {
  template() {
    return /* HTML */ `<div class="content-wrapper">
      <div class="content-container">${content()}</div>
      <div class="error-modal-container"></div>
      <div class="success-modal-container"></div>
    </div>`;
  }
  setEvent() {
    this.addEvent('click', '.ground_logo', () => {
      location.href = '/';
    });
    this.addEvent('click', '.password-change-form > button', handleSubmit);
    this.addEvent('focusin', 'input[name=password-now]', handleFocusin);
    this.addEvent('focusout', 'input[name=password-now]', handleFocusout);
    this.addEvent('focusin', 'input[name=password-new]', handleFocusin);
    this.addEvent('focusout', 'input[name=password-new]', handleFocusout);
    this.addEvent('focusin', 'input[name=password-check]', handleFocusin);
    this.addEvent('focusout', 'input[name=password-check]', handleFocusout);
    this.addEvent('click', '.success-page > button', async () => {
      const { signOut } = await api.get({ endPoint: '/user/signOut' });
      if (signOut === 'succeed') {
        location.href = '/signin';
      }
    });
  }
}

/* Functions */

const handleSubmit = async (event) => {
  event.preventDefault();
  const formData = new FormData(
    document.querySelector('.password-change-form')
  );
  const passwordChangeData = {};

  for (const pair of formData.entries()) {
    const [name, value] = pair;
    const result = checkInputValidate(name, value.trim());
    const tagNow = document.querySelector(`input[name=${name}]`);
    changeFormCSS(tagNow, result);

    if (!result.validate) {
      tagNow.focus();
      return;
    }
    passwordChangeData[name] = value.trim();
  }

  try {
    const endPoint = '/user/password';
    const data = Object.freeze(passwordChangeData);
    await api.put({ endPoint, data });
    renderSuccess();
  } catch (error) {
    showErrorModal(error);
  }
};

const handleFocusin = (event) => {
  const element = event.target;

  element.style.borderColor = '#1cbd22';
  element.style.zIndex = '10';
};

const handleFocusout = async (event) => {
  const element = event.target;

  element.style.borderColor = 'gray';
  element.style.zIndex = '0';
};

const changeFormCSS = (element, result) => {
  const error = document.querySelector(`.error-${element.name}`);

  if (!result.validate) {
    element.style.borderColor = 'red';
    element.style.backgroundImage = `url(data:image/svg+xml;charset=utf-8,${encodeURIComponent(
      icons.inputWarning
    )})`;
    element.style.backgroundRepeat = 'no-repeat';
    element.style.backgroundPosition = 'right 1px center';
    element.style.zIndex = '5';
    error.innerHTML = result.message;

    return;
  }
  element.style.borderColor = 'gray';
  element.style.removeProperty('background-image');
  element.style.zIndex = '0';
  error.innerHTML = result.message;
};

const checkInputValidate = (name, value) => {
  if (name === 'password-now') {
    return checkPasswordNow(value);
  }
  if (name === 'password-new') {
    return checkPasswordNew(value);
  }
  if (name === 'password-check') {
    return checkPasswordSame(value);
  }
};

const checkPasswordNow = (password) => {
  if (isEmpty(password)) {
    return { validate: false, message: '현재 비밀번호를 입력해 주세요.' };
  }
  return { validate: true, message: '' };
};

const checkPasswordNew = (password) => {
  if (isEmpty(password)) {
    return { validate: false, message: '새 비밀번호를 입력해 주세요.' };
  }
  if (!RegEx.user.password.test(password)) {
    return {
      validate: false,
      message:
        '비밀번호: 8자 이상의 영문(대/소문자), 숫자, 특수문자를 사용해 주세요.',
    };
  }
  return { validate: true, message: '' };
};

const checkPasswordSame = (password) => {
  const passwordNew = document.querySelector('.password-new > input').value;
  if (password !== passwordNew) {
    return { validate: false, message: '비밀번호가 서로 일치하지 않습니다.' };
  }
  return { validate: true, message: '' };
};

const renderSuccess = () => {
  const container = document.querySelector('.content-container');

  container.innerHTML = success();
};

const showErrorModal = (error) => {
  const errorModalContainer = document.querySelector('.error-modal-container');
  new ErrorModal(errorModalContainer, error.message);
  errorModalContainer.style.zIndex = '2';
  errorModalContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.3)';
  document.querySelector('.error-close').focus();
};

/* HTML Forms */

const content = () => {
  return /* HTML */ `<div class="content">
    ${logo()} ${passwordSettingContainer()}
  </div>`;
};

const logo = () => {
  return /* HTML */ `<div class="ground_logo">${icons.logo}</div>`;
};

const passwordSettingContainer = () => {
  return /* HTML */ `<div class="password-setting-container">
    <h3>비밀번호 변경</h3>
    ${passwordChangeForm()}
  </div>`;
};

const passwordChangeForm = () => {
  return /* HTML */ `<form class="password-change-form">
    <div class="password-change-input password-now">
      <input type="password" name="password-now" placeholder="현재 비밀번호" />
    </div>
    <div class="password-change-input password-new">
      <input type="password" name="password-new" placeholder="새 비밀번호" />
    </div>
    <div class="password-change-input password-new-check">
      <input
        type="password"
        name="password-check"
        placeholder="새 비밀번호 확인"
      />
    </div>
    <div class="password-setting-error-text">
      <div class="error-password-now"></div>
      <div class="error-password-new"></div>
      <div class="error-password-check"></div>
    </div>
    <button>비밀번호 변경</button>
  </form>`;
};

const success = () => {
  return /* HTML */ `<div class="success-page-wrapper">
    <div class="success-page">
      <div class="confirm">${icons.completeCheck}</div>
      <div class="instructions">
        <p>비밀번호가 성공적으로 변경되었습니다.</p>
        <p>로그인 후 서비스를 이용하실 수 있습니다.</p>
      </div>
      <button>로그인</button>
    </div>
  </div>`;
};
