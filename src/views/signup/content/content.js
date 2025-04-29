import Component from '../../components/common/Component.js';
import { icons } from '../../public/icons.js';
import * as api from '../../public/api.js';
import ErrorModal from '../../components/common/ErrorModal.js';
import LoadingModal from '../../components/common/LoadingModal.js';
import SuccessModal from '../../components/common/SuccessModal.js';
import { RegEx, isEmpty, generateRandomNumber } from '../../public/util.js';

export default class Content extends Component {
  #email;
  #authNumber;
  template() {
    return /* HTML */ `<div class="content-wrapper">
      <div class="content-container">${content()}</div>
      <div class="error-modal-container"></div>
      <div class="success-modal-container"></div>
      <div class="loading-modal-container"></div>
    </div>`;
  }
  setEvent() {
    this.addEvent('click', '.ground_logo', () => {
      location.href = '/';
    });
    this.addEvent('focusin', 'input[name=email]', handleFocusin);
    this.addEvent('focusout', 'input[name=email]', handleFocusout);
    this.addEvent('focusin', 'input[name=verify]', handleFocusin);
    this.addEvent('focusout', 'input[name=verify]', handleFocusout);
    this.addEvent('focusin', 'input[name=id]', handleFocusin);
    this.addEvent('focusout', 'input[name=id]', handleFocusout);
    this.addEvent('focusin', 'input[name=password]', handleFocusin);
    this.addEvent('focusout', 'input[name=password]', handleFocusout);
    this.addEvent('focusin', 'input[name=nickname]', handleFocusin);
    this.addEvent('focusout', 'input[name=nickname]', handleFocusout);
    this.addEvent('click', '.email-setting > button', async (event) => {
      event.preventDefault();
      const target = document.getElementById('email');
      const result = await checkInputValidate(target);
      if (!result.validate) {
        changeFormCSS(target, result);
        return target.focus();
      }
      this.#email = target.value.trim();
      this.#authNumber = generateRandomNumber({ type: 10, digit: 6 });
      const loadingModalContainer = document.querySelector(
        '.loading-modal-container'
      );

      try {
        showLoadingModal('이메일 발송중...');
        const { sendMail } = await api.post({
          endPoint: '/user/email',
          data: { email: this.#email, authNumber: this.#authNumber },
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
            // change view
            const signUpForm = document.querySelector('.sign-up-form');
            signUpForm.innerHTML = verifyForm();
            runtimer();
          }, 2000);
        }
      } catch (error) {
        document.querySelector('.loading-modal').remove();
        showErrorModal({
          message: '에러가 발생했습니다. 관리자에게 문의해 주세요.',
        });
      }
    });
    this.addEvent('click', '.email-verify > button', async (event) => {
      event.preventDefault();
      const target = document.getElementById('verify');
      const result = await checkInputValidate(target);
      if (!result.validate) {
        changeFormCSS(target, result);
        return target.focus();
      }
      const inputAuthNumber = target.value;

      if (this.#authNumber === inputAuthNumber) {
        showSuccessModal('인증되었습니다.');
      } else {
        showErrorModal({ message: '인증번호가 일치하지 않습니다.' });
      }
    });
    this.addEvent('click', '.error-close', () => {
      location.reload();
    });
    this.addEvent('click', '.success-close', () => {
      if (document.getElementById('verify')) {
        //change view after verify success
        const signUpForm = document.querySelector('.sign-up-form');
        signUpForm.innerHTML = otherForm();
      }
    });
    this.addEvent('click', '.other-setting > button', async (event) => {
      event.preventDefault();
      const formData = new FormData(document.querySelector('.other-setting'));
      const signUpData = {};

      // email 추가
      signUpData['email'] = this.#email;

      for (const pair of formData.entries()) {
        const [name, value] = pair;
        const result = await checkInputValidate({ name, value });
        const tagNow = document.querySelector(`input[name=${name}]`);
        changeFormCSS(tagNow, result);

        if (!result.validate) {
          return tagNow.focus();
        }
        signUpData[name] = value.trim();
      }

      try {
        const newUser = await api.post({
          endPoint: '/user/signUp',
          data: Object.freeze(signUpData),
        });
        renderWelcome(newUser.nick);
      } catch (error) {
        showErrorModal(error);
      }
    });
  }
}

/* Functions */

const handleFocusin = (event) => {
  const element = event.target;

  element.style.borderColor = '#1cbd22';
  element.style.zIndex = '10';
};

const handleFocusout = async (event) => {
  const element = event.target;
  const result = await checkInputValidate({
    name: element.name,
    value: element.value,
  });
  changeFormCSS(element, result);
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

const checkInputValidate = async ({ name, value }) => {
  if (name === 'email') {
    return await checkEmail(value.trim());
  }
  if (name === 'verify') {
    return checkVerifyInput(value);
  }
  if (name === 'id') {
    return await checkId(value.trim());
  }
  if (name === 'password') {
    return checkPassword(value.trim());
  }
  if (name === 'nickname') {
    return checkNickname(value.trim());
  }
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

const checkId = async (id) => {
  if (isEmpty(id)) {
    return { validate: false, message: '아이디를 입력해 주세요.' };
  }
  if (!RegEx.user.id.test(id)) {
    return {
      validate: false,
      message: '아이디: 5~12자의 영문(대/소문자), 숫자를 사용해 주세요.',
    };
  }
  if (!(await checkIdDuplicate(id))) {
    return { validate: false, message: '이미 사용 중인 아이디입니다.' };
  }
  return { validate: true, message: '' };
};

const checkIdDuplicate = async (id) => {
  try {
    const query = `available?id=${id}`;
    const result = await api.get({ endPoint: '/user/signUp', query });
    return result.available;
  } catch (error) {
    showErrorModal(error);
  }
};

const checkPassword = (password) => {
  if (isEmpty(password)) {
    return { validate: false, message: '비밀번호를 입력해 주세요.' };
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

const checkNickname = (nickname) => {
  if (isEmpty(nickname)) {
    return { validate: false, message: '닉네임을 입력해 주세요.' };
  }
  if (!RegEx.user.nickname.test(nickname)) {
    return { validate: false, message: '닉네임: 2~10자로 작성해 주세요.' };
  }
  return { validate: true, message: '' };
};

const renderWelcome = (nickname) => {
  const container = document.querySelector('.content-container');

  container.innerHTML = welcome(nickname);
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
        '페이지 새로고침 후 회원가입을 다시 진행해 주세요.';
    }
  }, 1000);
};

/* HTML Forms */

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
  return /* HTML */ `<div class="sign-up-form">${sendMailForm()}</div>`;
};

const sendMailForm = () => {
  return /* HTML */ `<form class="email-setting">
    <div class="sign-up-input">
      <input type="email" name="email" id="email" placeholder="이메일" />
    </div>
    <div class="sign-up-error-text"><div class="error-email"></div></div>
    <p class="email-setting-guide">
      이메일 인증이 필요합니다.<br />사용하실 이메일을 입력해 주세요.
    </p>
    <button>
      <div>${icons.mail}</div>
      메일 발송
    </button>
  </form>`;
};

const verifyForm = () => {
  return /* HTML */ `<form class="email-verify">
    <div class="sign-up-input">
      <input type="text" name="verify" id="verify" placeholder="인증번호" />
    </div>
    <div class="sign-up-error-text"><div class="error-verify"></div></div>
    <div class="email-verify-box">
      <p class="email-verify-guide">
        시간 내에 전송된 인증번호를 입력해 주세요.
      </p>
      <p class="email-verify-timer"><strong>60</strong>초</p>
    </div>
    <button>
      <div>${icons.authCheck}</div>
      인증
    </button>
  </form>`;
};

const otherForm = () => {
  return /* HTML */ `<form class="other-setting">
    <div class="sign-up-input">
      <input type="text" name="id" id="id" placeholder="아이디" />
    </div>
    <div class="sign-up-input">
      <input
        type="password"
        name="password"
        id="password"
        placeholder="비밀번호"
      />
    </div>
    <div class="sign-up-input">
      <input type="text" name="nickname" id="nickname" placeholder="닉네임" />
    </div>
    <div class="sign-up-error-text">
      <div class="error-id"></div>
      <div class="error-password"></div>
      <div class="error-nickname"></div>
    </div>
    <button>회원 가입</button>
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
      <div class="confirm">${icons.completeCheck}</div>
      <div>환영합니다!</div>
      <div>
        <div class="nickname">${nickname}</div>
        님
      </div>
      <div class="instructions">
        <p>회원가입이 성공적으로 완료되었습니다.</p>
        <p>로그인 후 서비스를 이용하실 수 있습니다.</p>
      </div>
      <button onclick="location.href='/signin'">로그인</button>
    </div>
  </div>`;
};
