import Component from '../Component.js';
import { icons } from '../../../public/icons.js';
import * as api from '../../../public/api.js';
import { isNull } from '../../../public/util.js';

export default class Header extends Component {
  #drawerStatus = false;
  #searchStatus = false;

  template() {
    return /* HTML */ `<header class="navbar-wrapper">
      <nav class="navbar">
        ${homeButton()} ${mainNavigations()} ${sideNavigations()}
        ${navDrawerButton()}
      </nav>
      ${drawerModalBox()} ${searchModalBox()}
    </header>`;
  }
  setEvent() {
    this.addEvent('click', '.nav-side-item:nth-child(3)', () => {
      const signIcon = document.querySelector('div[data-tooltip-before-sign]');
      if (!isNull(signIcon)) {
        location.href = '/signin';
      }
    });
    this.addEvent('click', '.nav-drawer-button', () => {
      this.drawerModalHandler();
    });
    this.addEvent('click', '.nav-side-item:nth-child(2)', () => {
      this.searchModalHandler();
    });

    this.addEvent('click', '.userModal > li:nth-child(2)', async () => {
      const { signOut } = await api.get('/signOut');
      if (signOut === 'succeed') {
        location.href = '/';
      }
    });

    this.addWindowEvent('load', async () => {
      const result = JSON.parse(await api.get('/signCheck'));
      const signIcon = document.querySelector('.signIcon');

      if (result) {
        signIcon.innerHTML = afterSign();
        return;
      }
      signIcon.innerHTML = beforeSign();
    });
    this.addWindowEvent('resize', () => {
      this.viewportResizeHandler();
    });
    this.addWindowEvent('click', (event) => {
      const signed = document.querySelector('div[data-tooltip-after-sign]');
      const clicked = event.target.closest('.nav-side-item:nth-child(3)');

      if (signed) {
        toggleModal(clicked);
      }
    });
  }
  drawerModalHandler() {
    this.searchChange(false);
    if (!this.#drawerStatus) this.drawerChange(true);
    else this.drawerChange(false);
  }
  searchModalHandler() {
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
    const drawerModal = this.$target.querySelector('.nav-drawer-menu');
    const drawerButton = this.$target.querySelector('.nav-drawer-button');

    if (status) {
      drawerModal.style.display = 'block';
      drawerButton.innerHTML = icons.close;
      this.#drawerStatus = true;
      return;
    }
    drawerModal.style.display = 'none';
    drawerButton.innerHTML = icons.drawer;
    this.#drawerStatus = false;
    return;
  }
  searchChange(status) {
    const searchModal = this.$target.querySelector('.navbar-search-modal');
    const searchButton = this.$target.querySelector(
      '.nav-side-item:nth-child(2)'
    );

    if (status) {
      searchModal.style.display = 'flex';
      searchButton.innerHTML = icons.underArrow;
      this.#searchStatus = true;
      return;
    }
    searchModal.style.display = 'none';
    searchButton.innerHTML = icons.search;
    this.#searchStatus = false;
    return;
  }
}

/* Functions */

const toggleModal = (clicked) => {
  const modalWrapper = document.querySelector('.modalWrapper');

  if (clicked) {
    isNull(modalWrapper) ? createModalWrapper() : removeModalWrapper();
    return;
  }

  if (!clicked) {
    if (modalWrapper) removeModalWrapper();
    return;
  }
};

const createModalWrapper = () => {
  const userIconBox = document.querySelector('.nav-side-item:nth-child(3)');
  const modalWrapper = document.createElement('div');
  modalWrapper.classList.add('modalWrapper');
  modalWrapper.innerHTML = userModal();
  userIconBox.appendChild(modalWrapper);
};

const removeModalWrapper = () => {
  const userIconBox = document.querySelector('.nav-side-item:nth-child(3)');
  const modalWrapper = document.querySelector('.modalWrapper');

  userIconBox.removeChild(modalWrapper);
};

/* HTML FORMS */

const homeButton = () => {
  return /* HTML */ `<div class="nav-home">
    <a href="/" title="ground"> ${icons.favicon} </a>
  </div>`;
};

const mainNavigations = () => {
  const categories = {
    favorite: ['인기', '/favorite'],
    subscribe: ['구독', '/subscribe'],
    all: ['전체', '/all'],
  };

  let categoryList = '';

  for (const category in categories) {
    const menu = categories[category][0];
    const link = categories[category][1];

    categoryList += /* HTML */ `<li class="nav-main-item">
      <a href="${link}">${menu}</a>
    </li>`;
  }

  return /* HTML */ `<ul class="navbar-nav">
    ${categoryList}
  </ul>`;
};

const sideNavigations = () => {
  const items = {
    searchBox: navSearchBox(),
    search: icons.search,
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

const userModal = () => {
  return /* HTML */ `<ul class="userModal">
    <li>마이페이지</li>
    <li>로그아웃</li>
    <li>Ground 만들기</li>
    <li>설정</li>
    <li>스크랩</li>
  </ul>`;
};

const navSearchBox = () => {
  return /* HTML */ `<div class="navbar-search flex-center">
    <input type="text" name="search" placeholder="검색" />
    <span class="navbar-search-icon flex-center"> ${icons.search} </span>
  </div>`;
};

const searchModalBox = () => {
  return /* HTML */ `<div class="navbar-search-modal">
    <input type="text" placeholder="검색" />
    <span class="navbar-search-icon flex-center"> ${icons.search} </span>
  </div>`;
};

// navDrawerButton 클릭 시 drawerModalBox 화면에 출력
const drawerModalBox = () => {
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
