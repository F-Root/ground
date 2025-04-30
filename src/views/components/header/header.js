import Component from '../common/Component.js';
import { icons } from '../../public/icons.js';
import * as api from '../../public/api.js';
import { isEmpty, isNull, debounce } from '../../public/util.js';
import { observable, observe } from '../common/observer.js';
import ErrorModal from '../common/ErrorModal.js';

export default class Header extends Component {
  #drawerStatus = false;
  #searchStatus = false;

  setup() {
    this.state = observable(this.initState());
    socketConnection(this.state);
    observe(() => {
      this.setEvent();
      this.render();
    });
  }
  template() {
    return /* HTML */ `<header class="navbar-wrapper">
        <nav class="navbar">
          ${homeButton()} ${mainNavigations()} ${sideNavigations()}
          ${navDrawerButton()}
        </nav>
        ${drawerPopupBox()}${searchPopupBox()}
      </header>
      <div class="header-error-modal error-modal-container"></div>`;
  }
  setEvent() {
    this.addWindowEvent('pageshow', async () => {
      try {
        // 구독 데이터
        this.state.subscribes = await getSubscribes();
        // 로그인 체크
        const result = JSON.parse(
          await api.get({ endPoint: '/user/signCheck' })
        );
        const signIcon = document.querySelector('.signIcon');
        if (result) {
          signIcon.innerHTML = afterSign();
          return;
        }
        signIcon.innerHTML = beforeSign();
      } catch (error) {
        //비 로그인 시
        if (error.name == 'Unauthorized') {
          return (this.state.subscribes = []);
        }
        showErrorModal({
          message: '에러가 발생했습니다. 관리자에게 문의해 주세요.',
        });
      }
    });
    this.addWindowEvent('resize', () => {
      this.viewportResizeHandler();
    });
    this.addWindowEvent('click', (event) => {
      const subscribe = '.nav-main-item:nth-child(1)';
      const popular = '.nav-main-item:nth-child(2)';
      const notificate = '.nav-side-item:nth-child(3)';
      const user = '.nav-side-item:nth-child(4)';

      // 현재 화면에 존재하는 팝업 제거
      // 만약 팝업 트리거 버튼을 클릭하면 해당 팝업을 제외한 나머지 팝업 제거
      removePopups(event.target, { notificate, user, popular, subscribe });

      // 팝업 버튼 클릭 시 해당 팝업을 생성
      if (event.target.closest(user)) {
        const element = document.querySelector(user);
        const signed = document.querySelector('div[data-tooltip-after-sign]');
        const popupId = 'user';
        if (signed) {
          togglePopup({ element, popupId });
        }
      }
      if (event.target.closest(notificate)) {
        const element = document.querySelector(notificate);
        const popupId = 'notificate';
        togglePopup({ element, popupId, ...this.state });
      }
      if (event.target.closest(popular)) {
        const element = document.querySelector(popular);
        const popupId = 'popular';
        togglePopup({ element, popupId });
      }
      if (event.target.closest(subscribe)) {
        const element = document.querySelector(subscribe);
        const popupId = 'subscribe';
        togglePopup({ element, popupId, ...this.state });
      }
    });
    this.addEvent('click', '.notificatePopup > li > a', async (event) => {
      event.preventDefault();
      // 링크 구하기
      const linkElement = event.target.closest('.notificatePopup > li > a');
      const hrefValue = linkElement.getAttribute('href');
      const urlObj = new URL(hrefValue, window.location.origin);
      const query = urlObj.search;
      // 쿼리가 존재하면 댓글, 없으면 컨텐츠
      if (query.includes('comment') || query.includes('reply')) {
        // 댓글 알림 읽음 처리
        await setCommentNotificateRead(query);
        // 읽음 처리 후 hrefValue의 url 페이지로 이동
        location.href = hrefValue;
      } else {
        // 컨텐츠는 바로 이동
        location.href = hrefValue;
      }
    });
    this.addEvent('click', '.nav-side-item:nth-child(4)', () => {
      const signIcon = document.querySelector('div[data-tooltip-before-sign]');
      if (!isNull(signIcon)) {
        location.href = '/signin/?returnUrl=http://localhost:3000/';
      }
    });
    this.addEvent('click', '.nav-drawer-button', () => {
      this.drawerPopupHandler();
    });
    this.addEvent('click', '.nav-side-item:nth-child(2)', () => {
      this.searchPopupHandler();
    });
    this.addEvent('click', '.userPopup > li:nth-child(4)', async () => {
      const { signOut } = await api.get({ endPoint: '/user/signOut' });
      const responseType = ['succeed', 'cookie deleted'];
      if (responseType.includes(signOut)) {
        location.href = '/';
      }
    });
    this.addEvent('click', '.notification-header > button', async (event) => {
      event.preventDefault();
      const endPoint = 'notificate/update';
      await api.put({ endPoint });
    });
    this.addEvent('click', '.btn-search-close', (event) => {
      event.preventDefault();
      document.querySelector('.nav-search-result').remove();
    });
    this.addEvent('click', '.result', (event) => {
      const search = event.target.querySelector('strong').innerText;
    });
    // this.addEvent('click', '.navbar-search-icon', handleSearch);
    this.addEvent('keydown', '#search', async (event) => {
      // 엔터키 입력
      if (event.key === 'Enter') {
        const keyword = document.getElementById('search').value;
      }
    });
    this.addEvent('keyup', '#search', async (event) => {
      debouncedSearch(event.target.value);
    });
  }
  drawerPopupHandler() {
    this.searchChange(false);
    if (!this.#drawerStatus) this.drawerChange(true);
    else this.drawerChange(false);
  }
  searchPopupHandler() {
    this.drawerChange(false);
    if (!this.#searchStatus) this.searchChange(true);
    else this.searchChange(false);
  }
  viewportResizeHandler() {
    const viewportWidth = window.innerWidth;
    if (viewportWidth > 768) {
      this.drawerChange(false);
      this.searchChange(false);
    }
  }
  drawerChange(status) {
    const drawerPopup = this.$target.querySelector('.nav-drawer-menu');
    const drawerButton = this.$target.querySelector('.nav-drawer-button');

    if (status) {
      drawerPopup.style.display = 'block';
      drawerButton.innerHTML = icons.close;
      this.#drawerStatus = true;
      return;
    }
    drawerPopup.style.display = 'none';
    drawerButton.innerHTML = icons.drawer;
    this.#drawerStatus = false;
    return;
  }
  searchChange(status) {
    const searchPopup = this.$target.querySelector('.navbar-search-popup');
    const searchButton = this.$target.querySelector(
      '.nav-side-item:nth-child(2)'
    );

    if (status) {
      searchPopup.style.display = 'flex';
      searchButton.innerHTML = icons.underArrow;
      this.#searchStatus = true;
      return;
    }
    searchPopup.style.display = 'none';
    searchButton.innerHTML = icons.search;
    this.#searchStatus = false;
    return;
  }
  initState() {
    const subscribes = [];
    const notificationlist = [];
    return { subscribes, notificationlist };
  }
}

/* Functions */

const showErrorModal = (error) => {
  const errorModalContainer = document.querySelector('.header-error-modal');
  new ErrorModal(errorModalContainer, error.message);
  errorModalContainer.style.zIndex = '15';
  errorModalContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.3)';
  document.querySelector('.error-close').focus();
};

async function handleSearch(keyword) {
  const wrapper = document.querySelector('.search-box-wrapper');
  wrapper.innerHTML = searchResultBox(keyword); // 렌더링
  const loading = wrapper.querySelector('.loading-content');
  loading.classList.remove('loading-hide'); // 로딩 스피너 보이게 처리

  const MIN_SPINNER_TIME = 500; // 최소 로딩 시간
  const startTime = Date.now(); // 검색 시작 시간

  try {
    const query = `?keyword=${encodeURIComponent(keyword)}`;
    const grounds = await api.get({ endPoint: '/ground/', query });

    // 검색시 로딩 보이게 처리
    const elapsed = Date.now() - startTime;
    const remaining = MIN_SPINNER_TIME - elapsed;
    if (remaining > 0) {
      setTimeout(() => {
        hideSpinnerAndRender({ wrapper, loading, grounds });
      }, remaining);
    } else {
      hideSpinnerAndRender({ wrapper, loading, grounds });
    }
  } catch (err) {
    // 네트워크 오류도 동일하게 처리
    const elapsed = Date.now() - startTime;
    const remaining = MIN_SPINNER_TIME - elapsed;
    if (remaining > 0) {
      setTimeout(() => {
        hideSpinnerAndRender({ wrapper, loading, error: '네트워크 오류' });
      }, remaining);
    } else {
      hideSpinnerAndRender({ wrapper, loading, error: '네트워크 오류' });
    }
  }
}

const debouncedSearch = debounce(handleSearch, 300);

const hideSpinnerAndRender = ({ wrapper, loading, grounds, error }) => {
  const searchWrapper = wrapper.querySelector('.result-grounds-wrapper');
  loading.classList.add('loading-hide'); // spinner 보이기
  // search box 렌더링
  if (grounds) {
    if (grounds.length === 0) {
      searchWrapper.innerHTML = /* HTML */ `<li class="ground-item no-result">
        그라운드 검색 결과가 없습니다.
      </li>`;
    } else {
      const groundlist = grounds.reduce(
        (acc, { name, id, img }) =>
          (acc += /* HTML */ `<li class="ground-item">
            <a href="/ground/${id}"
              ><img
                class="ground-thumbnail"
                src="${img?.imgUrl || '/asset/ground_icon.svg'}"
              /><span class="ground-name">${name} 그라운드</span></a
            >
          </li>`),
        ''
      );
      searchWrapper.innerHTML = groundlist;
    }
  } else {
    searchWrapper.innerHTML = /* HTML */ `<li class="ground-item error-result">
      오류가 발생했습니다: ${error}
    </li>`;
  }
};

const getSubscribes = async () => {
  return await api.get({ endPoint: '/user/subscribe/grounds' });
};

const removePopups = (target, popups) => {
  document.querySelectorAll('.popupWrapper').forEach((popup) => {
    const popupNow = popup.classList[1]; // 현재 popup의 popupId
    if (target.closest(popups[popupNow])?.contains(popup)) {
      return;
    }
    popup.remove();
  });
};

const togglePopup = ({ element, popupId, subscribes, notificationlist }) => {
  if (element.querySelector(`.${popupId}`)) {
    return document.querySelector(`.${popupId}`).remove();
  }
  createPopup({ element, popupId, subscribes, notificationlist });
};

const createPopup = ({ element, popupId, subscribes, notificationlist }) => {
  // const subscribes = popupId === 'subscribe' ? await getSubscribes() : [];
  const popups = {
    userPopup,
    notificatePopup,
    popularPopup,
    subscribePopup,
  };
  const popupWrapper = document.createElement('div');
  popupWrapper.classList.add('popupWrapper');
  popupWrapper.classList.add(popupId);
  popupWrapper.innerHTML = popups[`${popupId}Popup`]({
    subscribes,
    notificationlist,
  });
  element.appendChild(popupWrapper);
};

const socketConnection = (state) => {
  // 1. websocket 객체 생성
  const ws = new WebSocket('ws://localhost:3000');

  ws.addEventListener('open', () => {
    // console.log('%c서버와 연결됨', 'color: #faf755');
    // 연결 유지 (30초 간격)
    setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send('ping');
      }
    }, 30000);
  });

  ws.addEventListener('message', async (event) => {
    if (event.data === 'pong') {
      // console.log('%c연결 유지 중...', 'color: #faf755');
    } else {
      const notificationlist = JSON.parse(event.data);
      createNotificationMark(notificationlist);
      state.notificationlist = await createNotificationList(notificationlist);
    }
  });

  ws.addEventListener('error', (error) => {
    // console.error(error);
    showErrorModal({
      message: '에러가 발생했습니다. 관리자에게 문의해 주세요.',
    });
  });

  ws.addEventListener('close', async (event) => {
    if (event.reason === 'renew-cookie-needed') {
      await renewCookie(state);
    }
    // console.log('서버와의 연결이 종료되었습니다.');
  });
};

const renewCookie = async (state) => {
  try {
    const { renew } = await api.post({ endPoint: '/renew/credential' });
    if (renew == 'succeed') {
      socketConnection(state);
    }
  } catch (error) {
    showErrorModal({
      message: '에러가 발생했습니다. 관리자에게 문의해 주세요.',
    });
  }
};

const createNotificationMark = (notificationlist) => {
  if (isEmpty(notificationlist)) {
    const redDot = document.querySelector('.red-dot');
    if (redDot) {
      redDot.remove();
    }
  } else {
    const notificationBell = document.querySelector('.bellIcon');
    const redDot = document.querySelector('.red-dot');
    if (!redDot) {
      const redDotHTML = /* HTML */ `<div class="red-dot"></div>`;
      notificationBell.insertAdjacentHTML('afterbegin', redDotHTML);
    }
  }
};

const createNotificationList = async (notificationlist) => {
  notificationlist = await notificationlist.reduce(
    async (
      acc,
      { type, nickname, title, name, id, url: contentUrl, commentUrl }
    ) => {
      let a = await acc;
      if (type === 'content') {
        a += /* HTML */ `<li>
          <a href="/ground/${id}/${contentUrl}"
            >|${name}그라운드|<br />${nickname}님의 새 글 : ${title}</a
          >
        </li>`;
      } else if (type === 'comment') {
        a += /* HTML */ `<li>
          <a href="${await getLink({ type, id, contentUrl, commentUrl })}"
            >|${title}| 에<br />${nickname}님의 새 댓글</a
          >
        </li>`;
      } else if (type === 'reply') {
        a += /* HTML */ `<li>
          <a href="${await getLink({ type, id, contentUrl, commentUrl })}"
            >|${title}| 에<br />${nickname}님의 새 답글</a
          >
        </li>`;
      }
      return a;
    },
    Promise.resolve('')
  );
  // 만약 popup이 열려있는 상태면 확인 후 바로 알림 추가
  const notificatePopup = document.querySelector('.notificatePopup');
  if (notificatePopup) {
    notificatePopup.innerHTML = notificationlist;
  }
  return notificationlist;
};

const getLink = async ({ type, id, contentUrl, commentUrl }) => {
  const query =
    type === 'comment' ? `?comment=c_${commentUrl}` : `?reply=c_${commentUrl}`;
  const commentsPerPage = 50;
  try {
    const { position, url } = await api.get({
      endPoint: '/comment/sequence',
      query,
    });
    const countPage =
      position.rank % commentsPerPage === 0
        ? position.rank / commentsPerPage
        : Math.floor(position.rank / commentsPerPage) + 1;
    //코멘트를 찾는 url setting
    return /* HTML */ `/ground/${id}/${contentUrl}/${query}&cp=${countPage}`;
  } catch (error) {
    showErrorModal({
      message: '에러가 발생했습니다. 관리자에게 문의해 주세요.',
    });
  }
};

const setCommentNotificateRead = async (query) => {
  const endPoint = '/notificate/comment';
  await api.patch({ endPoint, query });
};

/* HTML FORMS */

const homeButton = () => {
  return /* HTML */ `<div class="nav-home">
    <a href="/" title="ground"> ${icons.favicon} </a>
  </div>`;
};

const mainNavigations = () => {
  const categories = {
    subscribe: `구독 그라운드 ${icons.caretDownFill}`,
    favorite: `주요 그라운드 ${icons.caretDownFill}`,
  };

  let categoryList = '';

  for (const category in categories) {
    const menu = categories[category];

    categoryList += /* HTML */ `<li class="nav-main-item">${menu}</li>`;
  }

  return /* HTML */ `<ul class="navbar-nav">
    ${categoryList}
  </ul>`;
};

const sideNavigations = () => {
  const items = {
    searchBox: navSearchBox(),
    search: icons.search,
    notificate: notificateBell(),
    user: userIconMenu(),
  };

  let itemList = '';

  for (const item in items) {
    itemList += /* HTML */ `<li class="nav-side-item flex-center">
      ${items[item]}
    </li>`;
  }

  return /* HTML */ `<ul>
    ${itemList}
  </ul>`;
};

const notificateBell = () => {
  return /* HTML */ `<div class="bellIcon flex-center">
    <div data-tooltip-notificate="알림">${icons.bell}</div>
  </div>`;
};

const userIconMenu = () => {
  const signIcon = /* HTML */ `<div class="signIcon flex-center">
    ${beforeSign()}
  </div>`;
  return /* HTML */ `${signIcon}`;
};

const beforeSign = () => {
  return /* HTML */ `<div data-tooltip-before-sign="로그인">
    ${icons.user}
  </div>`;
};

const afterSign = () => {
  return /* HTML */ `<div data-tooltip-after-sign="유저 메뉴">
    ${icons.user}
  </div>`;
};

const userPopup = () => {
  return /* HTML */ `<ul class="userPopup">
    <li>
      <a href="/settings">설정</a>
    </li>
    <li>
      <a href="#">스크랩</a>
    </li>
    <li>
      <a href="/ground/create">그라운드 만들기</a>
    </li>
    <li>
      <a>로그아웃</a>
    </li>
  </ul>`;
};

const notificatePopup = ({ notificationlist }) => {
  return /* HTML */ `<div class="notificatePopupWrapper">
    <div class="notification-header">
      <p>알림</p>
      <button>읽음처리</button>
    </div>
    <ul class="notificatePopup">
      ${notificationlist}
    </ul>
  </div>`;
};

const navSearchBox = () => {
  return /* HTML */ `<div class="navbar-search flex-center">
      <input
        type="text"
        name="search"
        id="search"
        placeholder="검색"
        autocomplete="off"
      />
      <span class="navbar-search-icon flex-center"> ${icons.search} </span>
    </div>
    <div class="search-box-wrapper"></div>`;
};

const searchPopupBox = () => {
  return /* HTML */ `<div class="navbar-search-popup">
      <input
        type="text"
        name="search"
        id="search"
        placeholder="검색"
        autocomplete="off"
      />
      <span class="navbar-search-icon flex-center"> ${icons.search} </span>
    </div>
    <div class="search-box-wrapper"></div>`;
};

// navDrawerButton 클릭 시 drawerPopupBox 화면에 출력
const drawerPopupBox = () => {
  const categories = {
    favorite: ['인기', '/favorite'],
    subscribe: ['구독', '/subscribe'],
    all: ['전체', '/all'],
  };

  let categoryList = /* HTML */ `<li class="nav-drawer-menu-icons">
    <div class="nav-drawer-menu-icon flex-center" data-tooltip="로그인">
      ${icons.user}
    </div>
  </li>`;

  for (const category in categories) {
    const menu = categories[category][0];
    const link = categories[category][1];

    categoryList += /* HTML */ `<li class="nav-drawer-menu-categories">
      <a href="${link}">${menu}</a>
    </li>`;
  }

  return /* HTML */ `<div class="nav-drawer-menu">
    <ul>
      ${categoryList}
    </ul>
  </div>`;
};

const navDrawerButton = () => {
  return /* HTML */ `<div class="nav-drawer">
    <button class="nav-drawer-button flex-center">${icons.drawer}</button>
  </div>`;
};

const subscribePopup = ({ subscribes }) => {
  const subscribelist = subscribes.reduce(
    (acc, { name, id }) =>
      (acc += `<li><a href="/ground/${id}">${name} 그라운드</a></li>`),
    ''
  );
  if (subscribelist.length > 0) {
    return /* HTML */ `<ul class="subscribePopup">
      <li>
        <a href="/settings/grounds/#subscribes">구독 중인 그라운드</a>
      </li>
      ${subscribelist}
    </ul>`;
  } else {
    return /* HTML */ `<div class="noSubscribe">
      구독 중인 그라운드가 없습니다.
    </div>`;
  }
};

const popularPopup = () => {
  return /* HTML */ `<ul class="popularPopup">
    <li><a href="#">공지사항</a></li>
    <li><a href="#">문의 게시판</a></li>
    <li>
      <a href="/popular/views">실시간 트렌드</a>
    </li>
    <li>
      <a href="/popular/best">개념글 모음</a>
    </li>
    <li>
      <a href="/popular/worst">심의대상 모음</a>
    </li>
    <li>
      <a href="/popular/all">종합 게시물</a>
    </li>
    <li><a href="#">테스트1</a></li>
    <li><a href="#">테스트2</a></li>
    <li><a href="#">테스트3</a></li>
    <li><a href="#">테스트4</a></li>
    <li><a href="#">테스트5</a></li>
  </ul>`;
};

const searchResultBox = (searchData) => {
  return /* HTML */ `<div class="nav-search-result">
    <ul class="result-grounds-wrapper"></ul>
    <div class="loading-content">
      <div class="loading-spinner" id="spinner"></div>
      <div class="loading-message">검색 중 ...</div>
    </div>
    <div class="keyword-search-item">
      <div class="result">
        <strong>'${searchData}'</strong> 검색 결과로 이동...
      </div>
    </div>
    <div class="close-button-wrapper">
      <button class="btn-search-close">닫기</button>
    </div>
  </div>`;
};
