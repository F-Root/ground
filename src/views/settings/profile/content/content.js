import Component from '../../../components/common/Component.js';
import Content from '../../../components/content/content.js';
import { settingNavBar } from '../../common/navbar.js';
import * as api from '../../../public/api.js';
import { RegEx, isEmpty } from '../../../public/util.js';
import { observable, observe } from '../../../components/common/observer.js';
import { icons } from '../../../public/icons.js';
import ErrorModal from '../../../components/common/ErrorModal.js';
import SuccessModal from '../../../components/common/SuccessModal.js';

export default class ProfileWrapper extends Content {
  mounted() {
    const $profileForm = this.$target.querySelector('.content-article-board');

    new ProfileForm($profileForm);
  }
}

class ProfileForm extends Component {
  async setup() {
    this.state = observable(await this.initState());
    observe(() => {
      this.setEvent();
      this.render();
    });
  }
  template() {
    return /* HTML */ `<div class="profile-wrapper">
        <div class="setting-profile">
          ${settingNavBar()}${profileView(this.state)}
        </div>
      </div>
      <div class="error-modal-container"></div>
      <div class="success-modal-container"></div>`;
  }

  setEvent() {
    this.addEvent('focusin', 'input[name=nickname]', handleFocusin);
    this.addEvent(
      'focusout',
      'input[name=nickname]',
      handleFocusout.bind(this)
    );
    this.addEvent('click', '.profile-form > button', handleSubmit.bind(this));
    this.addEvent('change', 'input[name=img]', (event) => {
      const file = event.target.files[0];
      const profileImg = document.querySelector('.profile-img-view > img');

      if (file) {
        const reader = new FileReader();

        // 파일을 읽은 후 실행되는 콜백 함수
        reader.onload = (e) => {
          profileImg.src = e.target.result; // img 태그의 src를 Data URL로 변경
        };

        // 파일을 Data URL 형식으로 read
        reader.readAsDataURL(file);
      }
    });
  }
  async initState() {
    const { nickname, imgUrl } = await getUserInfo();
    return { nickname, imgUrl };
  }
}

/* Functions */

const getUserInfo = async () => {
  return await api.get({ endPoint: '/user/loggedUser' });
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

async function handleSubmit(event) {
  event.preventDefault();
  const formData = new FormData(document.querySelector('.profile-form'));
  // const profileData = {};

  for (const pair of formData.entries()) {
    const [name, value] = pair;
    const result = checkInputValidate(name, value, this.state);
    const tagNow = document.querySelector(`input[name=${name}]`);
    changeFormCSS(tagNow, result);

    if (!result.validate) {
      return tagNow.focus();
    }
    // profileData[pair[0]] = pair[1].trim();
    formData.set(name, typeof value === 'string' ? value.trim() : value);
  }

  try {
    await api.patch({
      endPoint: '/user/update',
      data: Object.freeze(formData),
    });
    showSuccessModal('프로필이 변경되었습니다.');
  } catch (error) {
    showErrorModal(error);
  }
}

const handleFocusin = (event) => {
  const element = event.target;

  element.style.borderColor = '#1cbd22';
  element.style.zIndex = '10';
};

async function handleFocusout(event) {
  const element = event.target;
  const result = checkInputValidate(
    element.name,
    element.value.trim(),
    this.state
  );

  changeFormCSS(element, result);
}

const changeFormCSS = (element, result) => {
  const error = document.querySelector(`.error-profile-${element.name}`);

  if (!result.validate) {
    element.style.borderColor = 'red';
    element.style.zIndex = '5';
    element.style.backgroundImage = `url(data:image/svg+xml;charset=utf-8,${encodeURIComponent(
      icons.inputWarning
    )})`;
    element.style.backgroundRepeat = 'no-repeat';
    element.style.backgroundPosition = 'right 1px center';
    error.innerHTML = result.message;

    return;
  }

  element.style.borderColor = 'lightgray';
  element.style.zIndex = '0';
  element.style.backgroundImage = `url(data:image/svg+xml;charset=utf-8,${encodeURIComponent(
    icons.inputCheck
  )})`;
  element.style.backgroundRepeat = 'no-repeat';
  element.style.backgroundPosition = 'right 5px center';
  error.innerHTML = result.message;
};

const checkInputValidate = (name, value, state) => {
  if (name === 'img') {
    return checkProfileImage(value);
  }
  if (name === 'nickname') {
    return checkNickname(value.trim(), state);
  }
};

const checkProfileImage = (img) => {
  if (!isEmpty(img.name)) {
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (img.size > maxSize) {
      return { validate: false, message: '5MB 이하의 이미지를 선택해 주세요.' };
    }
    if (!img.type.match('image.*')) {
      return {
        validate: false,
        message: '이미지 파일만 업로드 할 수 있습니다.',
      };
    }
  }
  return { validate: true, message: '' };
};

const checkNickname = (nickname, state) => {
  if (nickname === state.nickname) {
    return {
      validate: false,
      message: '! 같은 닉네임으로 변경할 수 없습니다.',
    };
  }
  if (isEmpty(nickname)) {
    return { validate: false, message: '! 닉네임을 입력해 주세요.' };
  }
  if (!RegEx.user.nickname.test(nickname)) {
    return { validate: false, message: '! 닉네임은 2~10자로 작성해주세요.' };
  }
  return { validate: true, message: '' };
};

/* HTML Forms */

const profileView = ({ nickname, imgUrl }) => {
  return /* HTML */ `<div class="profile-form-box">
    <h2>프로필 설정</h2>
    <form class="profile-form">
      <div>
        <div class="profile-form-label">프로필 이미지</div>
        <div class="profile-form-input-wrapper user-profile-img">
          <label class="profile-img-view" for="img">
            <img
              src="${imgUrl ? imgUrl : '/asset/ground_icon.svg'}"
              alt="프로필 사진"
              onerror="this.onerror=null; this.src='/asset/ground_icon.svg';"
            />
          </label>
          <div class="profile-img-set">
            <input type="file" name="img" id="img" accept="image/*" />
            <p class="profile-form-guide">
              왼쪽의 프로필 사진을 클릭하여 이미지를 설정할 수 있습니다.
            </p>
            <p class="profile-error-text error-profile-img"></p>
          </div>
        </div>
      </div>
      <div>
        <label class="profile-form-label" for="nickname">닉네임</label>
        <div class="profile-form-input-wrapper">
          <input
            type="text"
            name="nickname"
            id="nickname"
            value="${nickname}"
          />
          <p class="profile-error-text error-profile-nickname"></p>
          <p class="profile-form-guide">
            프로필 변경 후 30일간 변경이 불가능합니다.<br />
          </p>
        </div>
      </div>
      <button>저장</button>
    </form>
  </div>`;
};
