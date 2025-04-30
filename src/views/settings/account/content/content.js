import Component from '../../../components/common/Component.js';
import Content from '../../../components/content/content.js';
import { settingNavBar } from '../../common/navbar.js';
import * as api from '../../../public/api.js';
import { observable, observe } from '../../../components/common/observer.js';
import ErrorModal from '../../../components/common/ErrorModal.js';
import LoadingModal from '../../../components/common/LoadingModal.js';
import SuccessModal from '../../../components/common/SuccessModal.js';
import { icons } from '../../../public/icons.js';
import { RegEx, isEmpty, generateRandomNumber } from '../../../public/util.js';

export default class AccountWrapper extends Content {
  mounted() {
    const $accountForm = this.$target.querySelector('.content-article-board');

    new AccountForm($accountForm);
  }
}

class AccountForm extends Component {
  #email;
  #authNumber;
  async setup() {
    this.state = observable(await this.initState());
    observe(() => {
      this.setEvent();
      this.render();
    });
  }
  template() {
    return /* HTML */ `<div class="account-wrapper">
        <div class="setting-account">
          ${settingNavBar()}${accountView(this.state)}
        </div>
      </div>
      <div class="error-modal-container"></div>
      <div class="success-modal-container"></div>
      <div class="loading-modal-container"></div>`;
  }

  setEvent() {
    this.addEvent('focusin', 'input[name=email]', handleFocusin);
    this.addEvent('focusout', 'input[name=email]', handleFocusout);
    this.addEvent('focusin', 'input[name=verify]', handleFocusin);
    this.addEvent('focusout', 'input[name=verify]', handleFocusout);
    this.addEvent('click', '.email-setting > button', async (event) => {
      event.preventDefault();
      const target = document.getElementById('email');
      const email = target.value;
      if (this.state.email === email) {
        changeFormCSS(target, {
          validate: false,
          message: '현재 사용 중인 이메일입니다.',
        });
        return target.focus();
      }
      if (!(await checkValidate(target))) {
        return target.focus();
      }
      this.#authNumber = generateRandomNumber({ type: 10, digit: 6 });
      const loadingModalContainer = document.querySelector(
        '.loading-modal-container'
      );

      try {
        showLoadingModal('이메일 발송중...');
        const { sendMail } = await api.post({
          endPoint: '/user/email',
          data: { email, authNumber: this.#authNumber },
        });
        if (sendMail === 'succeed') {
          document.querySelector('.loading-spinner').remove();
          const modalContent = document.querySelector('.loading-modal-content');
          modalContent.insertAdjacentHTML(
            'afterbegin',
            /* HTML */ `<div class="loading-complete">
              ${icons.completeCheck}
            </div>`
          );
          modalContent.lastElementChild.textContent =
            '이메일이 전송되었습니다.';
          setTimeout(() => {
            document.querySelector('.loading-modal').remove();
            loadingModalContainer.style.removeProperty('z-index');
            loadingModalContainer.style.removeProperty('background-color');
            document
              .querySelector('.verify-carousel')
              .insertAdjacentHTML('beforeend', verifyForm());

            // active carousel
            const slides = document.querySelectorAll('.slide');
            slides.forEach((slide) => {
              slide.classList.toggle('active');
            });
            this.state.timer = runtimer();
          }, 2000);
        }
      } catch (error) {
        document.querySelector('.loading-modal').remove();
        showErrorModal(error);
      }
    });
    this.addEvent('click', '.email-verify > button', async (event) => {
      event.preventDefault();
      const target = document.getElementById('verify');
      if (!(await checkValidate(target))) {
        return target.focus();
      }
      const inputAuthNumber = target.value;

      if (this.#authNumber === inputAuthNumber) {
        clearInterval(this.state.timer);
        //update email & page reload after verify success
        const email = document.getElementById('email').value;
        try {
          await api.put({
            endPoint: '/user/email',
            data: Object.freeze({ email }),
          });
          showSuccessModal('이메일이 변경되었습니다.');
        } catch (error) {
          showErrorModal(error);
        }
      } else {
        showErrorModal({ message: '인증번호가 일치하지 않습니다.' });
      }
    });
    this.addEvent('click', '.error-close', () => {
      location.reload();
    });
    this.addEvent('click', '.success-close', () => {
      if (
        document.querySelector('.email-verify').classList.contains('active')
      ) {
        //page reload after verify success
        location.reload();
      }
    });
    this.addEvent('click', '#password', () => {
      location.href = '/settings/password';
    });
  }
  async initState() {
    const email = await getUserInfo();
    return { email };
  }
}

/* Functions */

const getUserInfo = async () => {
  return await api.get({ endPoint: '/user/info' });
};

const showErrorModal = (error) => {
  const errorModalContainer = document.querySelector('.error-modal-container');
  new ErrorModal(errorModalContainer, error.message);
  errorModalContainer.style.zIndex = '2';
  errorModalContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.3)';
  document.querySelector('.error-close').focus();
};

const showSuccessModal = (data) => {
  const successModalContainer = document.querySelector(
    '.success-modal-container'
  );
  new SuccessModal(successModalContainer, data);
  successModalContainer.style.zIndex = '2';
  successModalContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.3)';
  document.querySelector('.success-close').focus();
};

const showLoadingModal = (message) => {
  const loadingModalContainer = document.querySelector(
    '.loading-modal-container'
  );
  new LoadingModal(loadingModalContainer, message);
  loadingModalContainer.style.zIndex = '2';
  loadingModalContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.3)';
};

const handleFocusin = (event) => {
  event.target.style.borderColor = '#1cbd22';
};

const handleFocusout = async (event) => {
  event.target.style.removeProperty('border-color');
};

const changeFormCSS = (element, result) => {
  const error = document.querySelector(`.error-account-${element.name}`);

  if (!result.validate) {
    element.style.borderColor = 'red';
    element.style.backgroundImage = `url(data:image/svg+xml;charset=utf-8,${encodeURIComponent(
      icons.inputWarning
    )})`;
    element.style.backgroundRepeat = 'no-repeat';
    element.style.backgroundPosition = 'right 1px center';
    error.innerHTML = result.message;

    return;
  }
  element.style.borderColor = 'gray';
  element.style.removeProperty('background-image');
  error.innerHTML = result.message;
};

const checkValidate = async (target) => {
  const { name, value } = target;
  let result;
  if (name === 'email') {
    result = await checkEmail(value);
  }
  if (name === 'verify') {
    result = checkVerifyInput(value);
  }
  changeFormCSS(target, result);
  return result.validate;
};

const checkEmail = async (email) => {
  if (isEmpty(email)) {
    return { validate: false, message: '이메일을 입력해 주세요.' };
  }
  if (!RegEx.user.email.test(email)) {
    return {
      validate: false,
      message: '이메일 형식이 올바르지 않습니다. (예시: example@gmail.com)',
    };
  }
  if (!(await checkEmailDuplicate(email))) {
    return { validate: false, message: '이미 사용 중인 이메일입니다.' };
  }
  return { validate: true, message: '' };
};

const checkEmailDuplicate = async (email) => {
  try {
    const query = `available?email=${email}`;
    const result = await api.get({ endPoint: '/user/signUp', query });
    return result.available;
  } catch (error) {
    showErrorModal(error);
  }
};

const checkVerifyInput = (authNumber) => {
  if (isEmpty(authNumber)) {
    return { validate: false, message: '인증번호를 입력해 주세요.' };
  }
  if (!RegEx.user.authNumber.test(authNumber)) {
    return {
      validate: false,
      message: '숫자만 입력할 수 있습니다.',
    };
  }
  return { validate: true, message: '' };
};

const runtimer = () => {
  let timeLeft = 60;
  const timerElement = document.querySelector('.email-verify-timer > strong');

  // 1초마다 타이머 업데이트
  const countdown = setInterval(() => {
    timeLeft--;
    timerElement.textContent = timeLeft;

    // 시간이 0이 되면 타이머 정지
    if (timeLeft <= 0) {
      clearInterval(countdown);
      // 타이머가 멈추면 verify input창 비활성화
      document.getElementById('verify').disabled = true;
      document.querySelector('.email-verify-guide').style.color = '#bd3440';
      document.querySelector('.email-verify-guide').textContent =
        '페이지 새로고침 후 이메일을 다시 설정해 주세요.';
    }
  }, 1000);

  return countdown;
};

/* HTML Forms */

const accountView = ({ email }) => {
  return /* HTML */ `<div class="account-form-box">
    ${setEmailForm(email)}
    <hr />
    ${setPasswordForm()}
  </div>`;
};

const setEmailForm = (email) => {
  return /* HTML */ `<h2>이메일 설정</h2>
    <div class="verify-carousel">${sendMailForm(email)}</div>`;
};

const sendMailForm = (email) => {
  return /* HTML */ `<form class="email-setting slide active">
    <div>
      <label class="email-setting-label" for="email">이메일</label>
      <div class="email-setting-input-wrapper">
        <input
          type="email"
          name="email"
          id="email"
          value="${email}"
          placeholder="이메일"
        />
        <p class="account-error-text error-account-email"></p>
        <p class="email-setting-guide">이메일 인증이 필요합니다.<br /></p>
      </div>
    </div>
    <button><span>${icons.mail}</span>메일 발송</button>
  </form>`;
};

const verifyForm = () => {
  return /* HTML */ `<form class="email-verify slide">
    <div>
      <label class="email-verify-label" for="auth">인증번호 입력</label>
      <div class="email-verify-input-wrapper">
        <input type="text" name="verify" id="verify" placeholder="인증번호" />
        <p class="account-error-text error-account-verify"></p>
        <div class="email-verify-box">
          <p class="email-verify-guide">
            시간 내에 전송된 인증번호를 입력해 주세요.
          </p>
          <p class="email-verify-timer"><strong>60</strong>초</p>
        </div>
      </div>
    </div>
    <button><span>${icons.authCheck}</span>인증</button>
  </form>`;
};

const setPasswordForm = () => {
  return /* HTML */ `<h2>보안 설정</h2>
    <div class="password-setting">
      <div>
        <label class="password-setting-label" for="password">비밀번호</label>
        <div class="password-setting-button-wrapper">
          <button id="password"><span>${icons.lock}</span>비밀번호 변경</button>
        </div>
      </div>
    </div>`;
};
