import Component from '../../../components/common/Component.js';
import Content from '../../../components/content/content.js';
import * as api from '../../../public/api.js';
import { RegEx, isEmpty, isNull } from '../../../public/util.js';
import { observable, observe } from '../../../components/common/observer.js';
import ErrorModal from '../../../components/common/ErrorModal.js';
import SuccessModal from '../../../components/common/SuccessModal.js';
import { icons } from '../../../public/icons.js';
import ErrorPage from '../../../components/common/errorPage.js';

export default class UpdateWrapper extends Content {
  mounted() {
    const $updateForm = this.$target.querySelector('.content-article-board');

    new UpdateForm($updateForm);
  }
}

class UpdateForm extends Component {
  async setup() {
    try {
      this.state = observable(await this.initState());
      observe(() => {
        this.setEvent();
        this.render();
      });
    } catch (error) {
      if (error.name.includes('GroundNotExistError')) {
        new ErrorPage(this.$target);
      }
    }
  }
  template() {
    return /* HTML */ `<div class="update-wrapper">
        ${updateForm(this.state.ground)}
      </div>
      <div class="error-modal-container"></div>
      <div class="success-modal-container"></div>`;
  }
  setEvent() {
    this.addEvent('focusin', 'input[name=manager]', handleFocusin);
    this.addEvent('focusout', 'input[name=manager]', handleFocusout);
    this.addEvent('focusin', 'input[name=description]', handleFocusin);
    this.addEvent('focusout', 'input[name=description]', handleFocusout);
    this.addEvent('focusin', 'input[name=tab]', handleFocusin);
    this.addEvent('focusout', 'input[name=tab]', handleFocusout);
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
    this.addEvent('click', '#button-img', async (event) => {
      event.preventDefault();
      const { id, name } = { ...this.state.ground };
      const target = document.getElementById('img');
      const img = target.files[0];

      if (!(await checkValidate(target))) {
        return target.focus();
      }

      const data = new FormData();
      data.append('id', id);
      data.append('name', name);
      data.append('img', img);

      try {
        await api.patch({
          endPoint: '/ground/img',
          data,
        });
        showSuccessModal('변경되었습니다.');
      } catch (error) {
        showErrorModal(error);
      }
    });
    this.addEvent('click', '#button-manager', async (event) => {
      event.preventDefault();
      const { id, name } = { ...this.state.ground };
      const target = document.getElementById('manager');
      const manager = target.value;

      if (!(await checkValidate(target))) {
        return target.focus();
      }

      try {
        await api.patch({
          endPoint: '/ground/manager',
          data: Object.freeze({ id, name, manager }),
        });
        showSuccessModal('변경되었습니다.');
      } catch (error) {
        showErrorModal(error);
      }
    });
    this.addEvent('click', '#button-description', async (event) => {
      event.preventDefault();
      const { id, name } = { ...this.state.ground };
      const target = document.getElementById('description');
      const description = target.value;

      if (!(await checkValidate(target))) {
        return target.focus();
      }

      try {
        await api.patch({
          endPoint: '/ground/description',
          data: Object.freeze({ id, name, description }),
        });
        showSuccessModal('변경되었습니다.');
      } catch (error) {
        showErrorModal(error);
      }
    });
    this.addEvent('click', '#button-tab', async (event) => {
      event.preventDefault();
      const { id, name } = { ...this.state.ground };
      const tab = Array.from(
        document.querySelector('#tab-list').options,
        (option) => option.value
      );

      if (!tab.includes('전체') || tab.length === 0) {
        showErrorModal({
          message: '탭 목록이 존재하지 않습니다.<br />탭을 추가해 주세요.',
        });
      }

      try {
        await api.patch({
          endPoint: '/ground/tab',
          data: Object.freeze({ id, name, tab }),
        });
        showSuccessModal('변경되었습니다.');
      } catch (error) {
        showErrorModal(error);
      }
    });
    this.addEvent('click', '.tab-add-sub > div > button', async (event) => {
      event.preventDefault();
      const type = event.target.innerText;

      if (type === '추가') {
        const add = document.querySelector('#tab');

        if (!(await checkValidate(add))) {
          return add.focus();
        }

        const option = /*HTML*/ `<option value='${add.value}'>${add.value}</option>`;
        const tabList = document.querySelector('#tab-list');
        tabList.insertAdjacentHTML('beforeend', option);
        add.value = '';
        document.getElementById('tab').focus();
      }
      if (type === '제거') {
        const sub = document.querySelector('#tab-list');
        if (sub.value !== '전체') {
          const option = document.querySelector(`[value='${sub.value}']`);
          option.remove();
        } else {
          showErrorModal({
            message:
              "'전체'탭은 제거할 수 없습니다.<br />'전체'탭은 그라운드마다 기본으로 제공되는 탭입니다.",
          });
        }
      }
    });
    this.addEvent('click', '#button-rate', async (event) => {
      event.preventDefault();
      const { id, name } = { ...this.state.ground };
      const target = document.getElementById('rate');
      const rate = target.value;

      if (!(await checkValidate(target))) {
        return target.focus();
      }

      try {
        await api.patch({
          endPoint: '/ground/rate',
          data: Object.freeze({ id, name, rate }),
        });
        showSuccessModal('변경되었습니다.');
      } catch (error) {
        showErrorModal(error);
      }
    });
  }
  async initState() {
    const ground = await getGroundInfo();

    return { ground };
  }
}

/* Functions */

const getGroundInfo = async () => {
  const urlPath = location.pathname.split('/').filter((entry) => entry !== '');
  const { 0: endPoint, 2: params } = { ...urlPath };
  return await api.get({ endPoint, params });
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

const handleFocusin = (event) => {
  const element = event.target;

  if (element.id === 'tab') {
    const wrapper = element.parentElement;
    wrapper.style.borderColor = '#1cbd22';
    return;
  }

  element.style.borderColor = '#1cbd22';
};

const handleFocusout = (event) => {
  const element = event.target;

  if (element.id === 'tab') {
    const wrapper = element.parentElement;
    wrapper.style.borderColor = 'lightgray';
    return;
  }

  element.style.borderColor = 'lightgray';
};

const checkValidate = async (target) => {
  const value = target.name === 'img' ? target.files[0] : target.value;
  const result = await checkInputValidate(target.name, value);

  changeFormCSS(target, result);

  return result.validate;
};

const changeFormCSS = (element, result) => {
  const error = document.querySelector(`.error-ground-${element.name}`);

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

  element.style.borderColor = 'lightgray';
  element.style.backgroundImage = 'none';
  error.innerHTML = result.message;
};

const checkInputValidate = async (name, value) => {
  if (name === 'img') {
    return checkImg(value);
  }
  if (name === 'manager') {
    return await checkEmail(value.trim());
  }
  if (name === 'description') {
    return checkDescription(value.trim());
  }
  if (name === 'tab') {
    return checkTabName(value.trim());
  }
  if (name === 'rate') {
    return checkRate(value);
  }
};

const checkImg = (img) => {
  if (isNull(img) || isEmpty(img.name)) {
    return { validate: false, message: '이미지를 선택해 주세요.' };
  }
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
  return { validate: true, message: '' };
};

const checkEmail = async (email) => {
  if (isEmpty(email)) {
    return { validate: false, message: '관리자 이메일을 입력해 주세요.' };
  }
  if (!RegEx.user.email.test(email)) {
    return {
      validate: false,
      message: '이메일 형식이 올바르지 않습니다. (예시: example@gmail.com)',
    };
  }
  if (!(await checkEmailValidate(email))) {
    return { validate: false, message: '존재하지 않는 이메일입니다.' };
  }
  return { validate: true, message: '' };
};

const checkDescription = (description) => {
  if (isEmpty(description)) {
    return {
      validate: false,
      message: '그라운드 설명을 작성한 후 변경 버튼을 눌러주세요.',
    };
  }
  return { validate: true, message: '' };
};

const checkTabName = (tab) => {
  const tabList = Array.from(
    document.querySelector('#tab-list').options,
    (option) => option.value
  );
  if (tabList.includes(tab)) {
    return { validate: false, message: '이미 추가된 탭은 추가할 수 없습니다.' };
  }
  if (isEmpty(tab)) {
    return {
      validate: false,
      message: '추가할 탭 이름을 작성해 주세요.',
    };
  }
  return { validate: true, message: '' };
};

const checkRate = (rate) => {
  if (isEmpty(rate)) {
    return {
      validate: false,
      message: '추천 수를 지정해 주세요.',
    };
  }
  if (!RegEx.rate.test(rate)) {
    return {
      validate: false,
      message: '추천 수 형식이 올바르지 않습니다. 숫자만 가능합니다.',
    };
  }
  return { validate: true, message: '' };
};

const checkEmailValidate = async (email) => {
  try {
    const query = `exist?email=${email}`;
    const result = await api.get({ endPoint: '/user', query });
    return result.exist;
  } catch (error) {
    showErrorModal(error);
  }
};

/* HTML Forms */

const updateForm = (ground) => {
  return /* HTML */ `<div class="update-form-box">
    <h2>${ground.name} 그라운드 관리</h2>
    <div class="update-form">
      ${updateGroundImage(ground.imgUrl)} ${updateGroundManager(ground.manager)}
      ${updateGroundDescription(ground.description)}
      ${updateGroundTab(ground.tab)}${updateGroundBest(ground.rate)}
    </div>
  </div>`;
};

const updateGroundImage = (imgUrl) => {
  return /* HTML */ `<div>
    <div class="update-form-label">그라운드 사진</div>
    <div class="update-form-input-wrapper ground-profile-img">
      <label class="profile-img-view" for="img">
        <img
          src="${imgUrl ? imgUrl : '/asset/ground_icon.svg'}"
          alt="그라운드 프로필 사진"
          onerror="this.onerror=null; this.src='/asset/ground_icon.svg';"
        />
      </label>
      <div class="profile-img-set">
        <input type="file" name="img" id="img" accept="image/*" />
        <p class="update-form-guide">
          그라운드의 프로필 이미지로 사용할 파일을 업로드해 주세요.<br />
          왼쪽의 프로필 사진을 클릭하여 이미지를 설정할 수 있습니다.
        </p>
        <p class="update-error-text error-ground-img"></p>
        <button id="button-img">업로드</button>
      </div>
    </div>
  </div>`;
};

const updateGroundManager = (manager) => {
  return /* HTML */ `<div>
    <label class="update-form-label" for="manager">관리자</label>
    <div class="update-form-input-wrapper">
      <input
        type="email"
        name="manager"
        id="manager"
        value="${manager.email}"
      />
      <p class="update-error-text error-ground-manager"></p>
      <p class="update-form-guide">그라운드의 관리자를 지정합니다.</p>
      <button id="button-manager">관리자 변경</button>
    </div>
  </div>`;
};

const updateGroundDescription = (description) => {
  return /* HTML */ `<div>
    <label class="update-form-label" for="description">설명</label>
    <div class="update-form-input-wrapper">
      <input
        type="text"
        name="description"
        id="description"
        value="${description}"
      />
      <p class="update-error-text error-ground-description"></p>
      <p class="update-form-guide">그라운드 소개글을 변경합니다.</p>
      <button id="button-description">설명 변경</button>
    </div>
  </div>`;
};

const updateGroundTab = (tab) => {
  const options = tab.reduce(
    (a, c) => (a += /*HTML*/ `<option value="${c}">${c}</option>`),
    ''
  );

  return /* HTML */ `<div>
    <label class="update-form-label" for="tab">탭</label>
    <div class="update-form-input-wrapper">
      <div class="tab-add-sub">
        <div>
          <select name="tab-list" id="tab-list">
            ${options}
          </select>
          <button>제거</button>
        </div>
        <div>
          <input type="text" name="tab" id="tab" /><button>추가</button>
        </div>
      </div>
      <p class="update-error-text error-ground-tab"></p>
      <p class="update-form-guide">
        그라운드 탭을 추가하거나 제거할 수 있습니다.<br />
      </p>
      <button id="button-tab">탭 변경</button>
    </div>
  </div>`;
};

const updateGroundBest = (rate) => {
  let options = '';
  for (let digit = 15; digit <= 50; digit += 5) {
    options += `<option value="${digit}" ${
      digit === rate ? 'selected' : ''
    }>${digit}</option>`;
  }
  return /* HTML */ `<div>
    <label class="update-form-label" for="tab">등급</label>
    <div class="update-form-input-wrapper">
      <select name="rate" id="rate">
        ${options}
      </select>
      <p class="update-error-text error-ground-rate"></p>
      <p class="update-form-guide">
        개념글 등급의 추천 수를 지정할 수 있습니다.<br />지정된 추천 수 이상의
        추천을 받은 글은 개념글로 지정됩니다.
      </p>
      <button id="button-rate">추천 수 변경</button>
    </div>
  </div>`;
};
