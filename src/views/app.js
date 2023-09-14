import { icons } from './components/common/icons.js';

class Component {
  $target;
  state;

  constructor($target) {
    this.$target = $target;
    this.setup();
    this.render();
  }

  setup() {}
  template() {
    return ``;
  }

  render() {
    this.$target.innerHTML = this.template();
    this.setEvent();
  }

  setEvent() {}
  setState(newState) {
    this.state = { ...this.state, ...newState };
    this.render();
  }
}

export default class App extends Component {
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
    (() => {
      const drawerModal = this.$target.querySelector('.nav-drawer-menu');
      const drawerButton = this.$target.querySelector('.nav-drawer-button');
      const searchModal = this.$target.querySelector('.navbar-search-modal');
      const searchButton = this.$target.querySelector(
        '.nav-side-item:nth-child(2)'
      );
      let drawerStatus = false;
      let searchStatus = false;
      const drawerChange = (status) => {
        if (status) {
          drawerModal.style.display = 'block';
          drawerButton.innerHTML = icons.close;
          drawerStatus = true;
          return;
        }
        drawerModal.style.display = 'none';
        drawerButton.innerHTML = icons.drawer;
        drawerStatus = false;
        return;
      };
      const searchChange = (status) => {
        if (status) {
          searchModal.style.display = 'flex';
          searchButton.innerHTML = icons.underArrow;
          searchStatus = true;
          return;
        }
        searchModal.style.display = 'none';
        searchButton.innerHTML = icons.search;
        searchStatus = false;
        return;
      };

      const drawerModalHandler = () => {
        searchChange(false);
        if (!drawerStatus) drawerChange(true);
        else drawerChange(false);
      };
      const searchModalHandler = () => {
        drawerChange(false);
        if (!searchStatus) searchChange(true);
        else searchChange(false);
      };

      const viewportResizeHandler = () => {
        const viewportWidth = window.innerWidth;

        if (viewportWidth <= 768) {
          drawerButton.addEventListener('click', drawerModalHandler);
          searchButton.addEventListener('click', searchModalHandler);
        } else {
          drawerButton.removeEventListener('click', drawerModalHandler);
          searchButton.removeEventListener('click', searchModalHandler);
          drawerChange(false);
          searchChange(false);
        }
      };

      drawerButton.addEventListener('click', drawerModalHandler);
      searchButton.addEventListener('click', searchModalHandler);
      window.addEventListener('resize', viewportResizeHandler);
    })();
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
    user: icons.user,
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
