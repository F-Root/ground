import Component from '../../../components/common/Component.js';
import Content from '../../../components/content/content.js';
import * as api from '../../../public/api.js';
import { RegEx, isEmpty } from '../../../public/util.js';
import { icons } from '../../../public/icons.js';
import ErrorModal from '../../../components/common/ErrorModal.js';

export default class CreateWrapper extends Content {
  mounted() {
    const $createForm = this.$target.querySelector('.content-article-board');

    new CreateForm($createForm);
  }
}

class CreateForm extends Component {
  template() {
    return /* HTML */ `<div class="create-wrapper">${createForm()}</div>
      <div class="error-modal-container"></div>`;
  }

  setEvent() {
    this.addEvent('click', '.create-form > button', handleSubmit);
    this.addEvent('focusin', 'input[name=name]', handleFocusin);
    this.addEvent('focusout', 'input[name=name]', handleFocusout);
    this.addEvent('focusin', 'input[name=description]', handleFocusin);
    this.addEvent('focusout', 'input[name=description]', handleFocusout);
    this.addEvent('focusin', 'input[name=id]', handleFocusin);
    this.addEvent('focusout', 'input[name=id]', handleFocusout);
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
    this.addEvent('click', '.success-page > button', async (event) => {
      event.preventDefault();
      const groundName = document.querySelector('#ground-name').dataset.name;
      const { id } = await api.get({
        endPoint: '/ground/name',
        params: groundName,
      });
      location.href = `/ground/update/${id}`;
    });
  }
}

/* Functions */

const handleSubmit = async (event) => {
  event.preventDefault();
  const formData = new FormData(document.querySelector('.create-form'));
  // const createGroundData = {};

  for (const pair of formData.entries()) {
    const [name, value] = pair;
    const result = checkInputValidate(name, value);
    const tagNow = document.querySelector(`input[name=${name}]`);
    changeFormCSS(tagNow, result);

    if (!result.validate) {
      return tagNow.focus();
    }
    // createGroundData[name] = typeof value === 'string' ? value.trim() : value;
    formData.set(name, typeof value === 'string' ? value.trim() : value);
  }

  try {
    const newGround = await api.post({
      endPoint: '/ground/create',
      // data: Object.freeze(createGroundData),
      data: Object.freeze(formData),
    });
    renderSuccess(newGround);
  } catch (error) {
    showErrorModal(error);
  }
};

const handleFocusin = (event) => {
  const element = event.target;

  element.style.borderColor = '#1cbd22';
  element.style.zIndex = '10';
};

const handleFocusout = (event) => {
  const element = event.target;
  const result = checkInputValidate(element.name, element.value.trim());

  changeFormCSS(element, result);
};

const changeFormCSS = (element, result) => {
  const error = document.querySelector(`.error-ground-${element.name}`);

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

const checkInputValidate = (name, value) => {
  if (name === 'img') {
    return checkGroundImg(value);
  }
  if (name === 'name') {
    return checkGroundName(value.trim());
  }
  if (name === 'description') {
    return checkGroundDescription(value.trim());
  }
  if (name === 'id') {
    return checkGroundID(value.trim());
  }
};

const checkGroundImg = (img) => {
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

const checkGroundName = (name) => {
  if (isEmpty(name)) {
    return { validate: false, message: '그라운드 이름을 입력해 주세요.' };
  }
  if (!RegEx.ground.name.test(name)) {
    return {
      validate: false,
      message:
        '그라운드 이름은 영어, 숫자, 완성형 한글, 스페이스, / 만 사용할 수 있습니다.',
    };
  }
  return { validate: true, message: '' };
};

const checkGroundDescription = (description) => {
  if (isEmpty(description)) {
    return { validate: false, message: '그라운드 설명을 작성해 주세요.' };
  }
  return { validate: true, message: '' };
};

const checkGroundID = (id) => {
  if (isEmpty(id)) {
    return { validate: false, message: '그라운드 ID를 입력해 주세요.' };
  }
  if (!RegEx.ground.id.test(id)) {
    return {
      validate: false,
      message: 'Ground ID는 영어, 숫자만 사용할 수 있습니다.',
    };
  }
  return { validate: true, message: '' };
};

const renderSuccess = ({ name, manager }) => {
  const container = document.querySelector('.create-wrapper');

  container.innerHTML = success(name, manager);
};

const showErrorModal = (error) => {
  const errorModalContainer = document.querySelector('.error-modal-container');
  new ErrorModal(errorModalContainer, error.message);
  errorModalContainer.style.zIndex = '2';
  errorModalContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.3)';
  document.querySelector('.error-close').focus();
};

/* HTML Forms */

const createForm = () => {
  return /* HTML */ `<div class="create-form-box">
    <h2>그라운드 만들기</h2>
    <form class="create-form">
      ${createGroundImg()}
      ${createGroundName()}${createGroundDescription()}${createGroundId()}
      <button>만들기</button>
    </form>
  </div>`;
};

const createGroundImg = () => {
  return /* HTML */ `<div>
    <div class="create-form-label">그라운드 사진</div>
    <div class="create-form-input-wrapper ground-profile-img">
      <label class="profile-img-view" for="img">
        <img
          src=""
          alt="그라운드 프로필 사진"
          onerror="this.onerror=null; this.src='/asset/ground_icon.svg';"
        />
      </label>
      <div class="profile-img-set">
        <input type="file" name="img" id="img" accept="image/*" />
        <p class="create-form-guide">
          그라운드의 프로필 이미지로 사용할 파일을 업로드해 주세요.<br />
          왼쪽의 프로필 사진을 클릭하여 이미지를 설정할 수 있습니다.
        </p>
        <p class="create-error-text error-ground-img"></p>
      </div>
    </div>
  </div>`;
};

const createGroundName = () => {
  return /* HTML */ `<div>
    <label class="create-form-label" for="name">이름</label>
    <div class="create-form-input-wrapper">
      <input type="text" name="name" id="name" />
      <p class="create-error-text error-ground-name"></p>
      <p class="create-form-guide">
        그라운드 이름은 다음과 같이 표기됩니다.<br />
        <strong>'OOO 그라운드'</strong> → OOO 부분을 입력해 주세요.
      </p>
    </div>
  </div>`;
};

const createGroundDescription = () => {
  return /* HTML */ `<div>
    <label class="create-form-label" for="description">설명</label>
    <div class="create-form-input-wrapper">
      <input type="text" name="description" id="description" />
      <p class="create-error-text error-ground-description"></p>
      <p class="create-form-guide">
        그라운드를 소개하는 짧은 글을 작성해 주세요.<br />
        그라운드 배너 밑에 게시됩니다.
      </p>
    </div>
  </div>`;
};

const createGroundId = () => {
  return /* HTML */ `<div>
    <label class="create-form-label" for="id">ID</label>
    <div class="create-form-input-wrapper">
      <input type="text" name="id" id="id" />
      <p class="create-error-text error-ground-id"></p>
      <p class="create-form-guide">
        ID는 그라운드 주소에 사용됩니다.<br />
        예시) 코딩 그라운드 - ground.with/grounds/<strong>coding</strong><br />
        알파벳과 숫자만 입력해 주세요.
      </p>
    </div>
  </div>`;
};

const success = (name, manager) => {
  return /* HTML */ `<div class="success-page-wrapper">
    <div class="success-page">
      <div class="confirm">${icons.completeCheck}</div>
      <div class="instructions">
        <p>그라운드 생성이 성공적으로 완료되었습니다.</p>
        <p>
          <strong>${manager}</strong> 님은
          <strong id="ground-name" data-name=${name}>${name} 그라운드</strong>의
          관리자입니다.
        </p>
      </div>
      <button>그라운드 관리페이지로 이동</button>
    </div>
  </div>`;
};
