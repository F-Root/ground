import Component from '../../../components/common/Component.js';
import Content from '../../../components/content/content.js';
import WysiwigForm from '../../../public/wysiwig.js';
import * as api from '../../../public/api.js';
import { observable, observe } from '../../../components/common/observer.js';
import { icons } from '../../../public/icons.js';
import { isEmpty } from '../../../public/util.js';
import ErrorModal from '../../../components/common/ErrorModal.js';

export default class CreateWrapper extends Content {
  mounted() {
    const $createForm = this.$target.querySelector('.content-article-board');

    new CreateForm($createForm);
  }
}

class CreateForm extends Component {
  editor;
  tagNow;
  async setup() {
    this.state = observable(await this.initState());
    observe(() => {
      this.setEvent();
      this.render();
    });
    this.setEditorEvent();
  }
  mounted() {
    const $editorForm = this.$target.querySelector('.editor-wrapper');
    const wysiwig = new WysiwigForm($editorForm);
    this.editor = wysiwig.getQuill();
  }
  template() {
    return /* HTML */ `<div class="ground-view-wrapper">
      <div class="ground-form-wrapper">
        ${groundTitle(this.state)}${groundContents(this.state.ground)}
        <div class="ground-post-button">
          <button class="post-new">작성</button>
          <button class="post-cancel">취소</button>
        </div>
      </div>
      <div class="error-modal-container"></div>
    </div>`;
  }
  render() {
    super.render();
    this.cssRender();
  }
  cssRender() {
    categorySelectBoxCSS();
  }
  setEvent() {
    this.addEvent('click', '.post-new', this.handleSubmit.bind(this));
    this.addEvent('click', '.error-close', (event) => {
      event.preventDefault();
      this.tagNow.focus();
    });
    this.addEvent('click', '.title-button > button:first-child', async () => {
      const element = document.querySelector(
        '.title-button > button:first-child'
      );
      // data가 no일때 클릭하면 알림 설정 / yes일때 클릭하면 알림 설정 해제
      const clickForNotificate =
        element.getAttribute('data-notificate') === 'no' ? true : false;
      try {
        const endPoint = 'user/notificate';
        const params = this.state.ground.id;
        const query = `?clickForNotificate=${clickForNotificate}`;
        await api.patch({ endPoint, params, query });
        location.reload();
      } catch (error) {
        showErrorModal(error);
      }
    });
    this.addEvent('click', '.title-button > button:last-child', async () => {
      const element = document.querySelector(
        '.title-button > button:last-child'
      );
      // data가 no일때 클릭하면 구독 / yes일때 클릭하면 구독 해제
      const clickForSubscribe =
        element.getAttribute('data-subscribe') === 'no' ? true : false;
      try {
        const endPoint = 'user/subscribe';
        const params = this.state.ground.id;
        const query = `?clickForSubscribe=${clickForSubscribe}`;
        await api.patch({ endPoint, params, query });
        location.reload();
      } catch (error) {
        showErrorModal(error);
      }
    });
    this.addEvent('mouseover', '.title-button > button:first-child', () => {
      const element = document.querySelector(
        '.title-button > button:first-child'
      );
      // data가 yes일때만 이벤트 실행
      if (element.getAttribute('data-notificate') === 'yes') {
        element.style.backgroundColor = 'red';
        element.style.border = '1px solid red';
        element.firstElementChild.innerHTML = icons.notice.cancel;
        element.lastElementChild.innerText = '알림 취소';
      }
    });
    this.addEvent('mouseout', '.title-button > button:first-child', () => {
      const element = document.querySelector(
        '.title-button > button:first-child'
      );
      // data가 yes일때만 이벤트 실행
      if (element.getAttribute('data-notificate') === 'yes') {
        element.style.backgroundColor = '#ffffff';
        element.style.border = '1px solid lightgray';
        element.firstElementChild.innerHTML = icons.notice.on;
        element.lastElementChild.innerText = '알림';
      }
    });
    this.addEvent('mouseover', '.title-button > button:last-child', () => {
      const element = document.querySelector(
        '.title-button > button:last-child'
      );
      // data가 yes일때만 이벤트 실행
      if (element.getAttribute('data-subscribe') === 'yes') {
        element.style.backgroundColor = 'red';
        element.style.border = '1px solid red';
        element.firstElementChild.innerHTML = icons.close;
        element.firstElementChild.firstElementChild.style.width = '16px';
        element.firstElementChild.firstElementChild.style.height = '16px';
        element.lastElementChild.innerText = '구독 취소';
      }
    });
    this.addEvent('mouseout', '.title-button > button:last-child', () => {
      const element = document.querySelector(
        '.title-button > button:last-child'
      );
      // data가 yes일때만 이벤트 실행
      if (element.getAttribute('data-subscribe') === 'yes') {
        element.style.backgroundColor = '#ffffff';
        element.style.border = '1px solid lightgray';
        element.firstElementChild.innerHTML = icons.inputCheck;
        element.lastElementChild.innerText = '구독';
      }
    });
  }
  async initState() {
    const ground = await getGroundInfo();
    const { isSubscribed } = await checkSubscribe();
    const { isNotificated } = await checkNotificate();
    const notificate = await getGroundNotificateCount();
    const subscribers = await getGroundSubscriberCount();
    return { ground, isSubscribed, isNotificated, notificate, subscribers };
  }
  // 에디터 동작 감지
  setEditorEvent() {
    // console.log('에디터:', this.editor);
    this.editor.on('text-change', () => {
      let delta = this.editor.getContents();
      // console.log(JSON.stringify(delta));
      // console.log(this.editor.getLength());
    });
  }
  async handleSubmit(event) {
    event.preventDefault();
    const contentData = {};
    const formData = new FormData(document.querySelector('.post-content-form'));
    const content = this.editor.getContents();

    for (const pair of formData.entries()) {
      const result = checkInputValidate(pair[0], pair[1]);
      this.tagNow = document.querySelector(`#${pair[0]}`);

      if (!result.validate) {
        showErrorModal(result);
        return;
      }

      contentData[pair[0]] = pair[1];
    }

    const result = checkInputValidate('content', this.editor);
    this.tagNow = document.querySelector('#editor > div');
    if (!result.validate) {
      showErrorModal(result);
      return;
    }
    contentData['content'] = content;
    contentData['groundId'] = this.state.ground.id;

    try {
      const { url } = await api.post({
        endPoint: '/content/create',
        data: Object.freeze(contentData),
      });
      if (url) {
        const urlPath = location.pathname
          .split('/')
          .filter((entry) => entry !== '');
        location.href = `/${urlPath[0]}/${urlPath[1]}/${url}`;
      }
    } catch (error) {
      showErrorModal(error);
    }
  }
}

/* Functions */

const getGroundInfo = async () => {
  const urlPath = location.pathname
    .replace('new/', '')
    .split('/')
    .filter((entry) => entry !== '');
  const { 0: endPoint, 1: params } = { ...urlPath };
  return await api.get({ endPoint, params });
};

const getGroundNotificateCount = async () => {
  const urlPath = location.pathname
    .replace('new/', '')
    .split('/')
    .filter((entry) => entry !== '');
  const params = urlPath[1];
  return await api.get({
    endPoint: `user/notificate`,
    params,
  });
};

const getGroundSubscriberCount = async () => {
  const urlPath = location.pathname
    .replace('new/', '')
    .split('/')
    .filter((entry) => entry !== '');
  const params = urlPath[1];
  return await api.get({
    endPoint: `user/subscribers`,
    params,
  });
};

const checkSubscribe = async () => {
  const urlPath = location.pathname
    .replace('new/', '')
    .split('/')
    .filter((entry) => entry !== '');
  const endPoint = 'user/check/subscribe';
  const params = urlPath[1];
  return await api.get({ endPoint, params });
};

const checkNotificate = async () => {
  const urlPath = location.pathname
    .replace('new/', '')
    .split('/')
    .filter((entry) => entry !== '');
  const endPoint = 'user/check/notificate';
  const params = urlPath[1];
  return await api.get({ endPoint, params });
};

const checkInputValidate = (name, value) => {
  if (name === 'category') {
    return checkCategory(value);
  }
  if (name === 'title') {
    return checkTitle(value);
  }
  if (name === 'content') {
    return checkContent(value);
  }
};

const checkCategory = (category) => {
  if (isEmpty(category)) {
    return { validate: false, message: '! 카테고리를 설정해 주세요.' };
  }
  return { validate: true, message: '' };
};

const checkTitle = (title) => {
  if (isEmpty(title)) {
    return { validate: false, message: '! 제목을 입력해 주세요.' };
  }
  if (title.length < 5) {
    return { validate: false, message: '! 제목을 최소 5자 이상 입력해주세요.' };
  }
  return { validate: true, message: '' };
};

const checkContent = (content) => {
  if (isEmpty(content.getLength())) {
    return { validate: false, message: '! 내용을 입력해 주세요.' };
  }
  if (content.getLength() < 6) {
    return { validate: false, message: '! 내용을 최소 5자 이상 입력해주세요.' };
  }
  return { validate: true, message: '' };
};

const showErrorModal = (error) => {
  const errorModalContainer = document.querySelector('.error-modal-container');
  new ErrorModal(errorModalContainer, error.message);
  errorModalContainer.style.zIndex = '2';
  errorModalContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.3)';
  document.querySelector('.error-close').focus();
};

/* HTML Forms */

const groundTitle = ({
  ground,
  isSubscribed,
  isNotificated,
  notificate,
  subscribers,
}) => {
  const groundIconHTML = /* HTML */ `<div class="ground-icon-wrapper">
    <a class="ground-icon-link" href="/ground/${ground.id}"
      ><img
        class="ground-icon"
        src="${ground.imgUrl ? ground.imgUrl : '/asset/ground_icon.svg'}"
        alt="${ground.name} 프로필 사진"
        onerror="this.onerror=null; this.src='/asset/ground_icon.svg';"
    /></a>
  </div>`;
  const groundInfoHTML = /* HTML */ `<div class="ground-info-wrapper">
    <div class="ground-info-head">
      <a href="/ground/${ground.id}"><p>${ground.name} 그라운드</p></a>
      <div class="button-wrapper title-button">
        <button data-notificate="${isNotificated ? 'yes' : 'no'}">
          <span>${isNotificated ? icons.notice.on : icons.notice.off}</span
          ><span>알림</span>
        </button>
        <button data-subscribe="${isSubscribed ? 'yes' : 'no'}">
          <span>${isSubscribed ? icons.inputCheck : icons.plus}</span
          ><span>구독</span>
        </button>
      </div>
    </div>
    <div class="ground-info-description">
      <div>
        <span>구독자 ${subscribers}명 | </span>
        <span>알림 수신 ${notificate}명 | </span>
        <span>@${ground.manager.nickname}</span>
      </div>
      <div>${ground.description}</div>
    </div>
  </div>`;

  return /* HTML */ `<div class="ground-title">
    ${groundIconHTML}${groundInfoHTML}
  </div>`;
};

const groundContents = (ground) => {
  let options = '';
  ground.tab.forEach((tab) => {
    if (tab === '전체') {
      return (options += `<option value="${tab}">일반</option>`);
    }
    options += `<option value="${tab}">${tab}</option>`;
  });
  const categoryBox = /* HTML */ `<div class="category-select-wrap">
    <select name="category" id="category" class="category-select">
      ${options}
    </select>
  </div>`;
  const titleBox = /* HTML */ `<div class="title-input-wrap">
    <input
      type="text"
      name="title"
      id="title"
      maxlength="256"
      placeholder="제목"
    />
  </div>`;

  return /* HTML */ `<form class="post-content-form">
    ${categoryBox}${titleBox}
    <div class="editor-wrapper"></div>
  </form>`;
};

/* CSS Forms */

const categorySelectBoxCSS = () => {
  const selectBox = document.querySelector('.category-select');

  selectBox.style.backgroundImage = `url(data:image/svg+xml;charset=utf-8,${encodeURIComponent(
    icons.chevronDown
  )})`;
};
