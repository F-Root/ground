import Component from '../../common/Component.js';
import { icons } from '../../common/icons.js';

export default class Header extends Component {
  #drawerStatus = false;
  #searchStatus = false;

  setup() {}
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
    this.addEvent('click', '#signIn', () => {
      location.href = '/signIn';
    });
    this.addEvent('click', '.nav-drawer-button', () => {
      this.drawerModalHandler();
    });
    this.addEvent('click', '.nav-side-item:nth-child(2)', () => {
      this.searchModalHandler();
    });
    this.addWindowEvent('resize', () => {
      this.viewportResizeHandler();
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

const homeButton = () => {
  return /* HTML */ `<div class="nav-home">
    <a href="#" title="ground"> ${icons.favicon} </a>
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
    user: `<div id='signIn'>${icons.user}</div>`,
  };

  let itemList = '';

  for (const item in items) {
    itemList += /* HTML */ `<li class="nav-side-item flex-align-center">
      ${items[item]}
    </li>`;
  }

  return /* HTML */ `<ul>
    ${itemList}
  </ul>`;
};

const navSearchBox = () => {
  return /* HTML */ `<div class="navbar-search flex-align-center">
    <input type="text" placeholder="검색" />
    <span class="navbar-search-icon flex-align-center"> ${icons.search} </span>
  </div>`;
};

const searchModalBox = () => {
  return /* HTML */ `<div class="navbar-search-modal">
    <input type="text" placeholder="검색" />
    <span class="navbar-search-icon flex-align-center"> ${icons.search} </span>
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
    <div class="nav-drawer-menu-icon flex-align-center">${icons.user}</div>
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
    <button class="nav-drawer-button flex-align-center">${icons.drawer}</button>
  </div>`;
};
