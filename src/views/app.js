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
    return `<header class="navbar-wrapper">
			<nav class="navbar">
				${homeButton()}
				${navigations()}
				${searchBox()}
				${infoNavigations()}
				${drawerMenuButton()}
			</nav>
		</header>`;
  }
  setEvent() {}
}

// drawerMenuButton 클릭 시 drawerMenu 화면에 출력
const drawerMenu = () => {
  const menu = `<div class="nav-drawer-menu"></div>`;
  return menu;
};

const drawerMenuButton = () => {
  return `<div class="nav-drawer">
						<button class="nav-drawer-button">
							${icons.drawer}
						</button>
					</div>`;
};

const homeButton = () => {
  return `<div class="nav-home">
						<a href="#" title="ground">
							${icons.favicon}
						</a>
					</div>`;
};

const navigations = () => {
  const categories = {
    favorite: ['인기', '/favorite'],
    subscribe: ['구독', '/subscribe'],
    all: ['전체', '/all'],
  };

  let categoryList = '';

  for (const category in categories) {
    const menu = categories[category][0];
    const link = categories[category][1];

    categoryList += `<li class="nav-item"><a href="${link}">${menu}</a></li>`;
  }

  return `<ul class="navbar-nav">
					  ${categoryList}
				  </ul>`;
};

const searchBox = () => {
  return `<div class="navbar-search">
            <span class="navbar-search-icon">
              ${icons.search}
            </span>
            <input type="text" placeholder="검색" />
          </div>`;
};

const infoNavigations = () => {
  const pages = {
    mypage: ['회원가입', '/myPage'],
    login: ['로그인', '/login'],
  };

  let pageList = '';

  for (const page in pages) {
    const menu = pages[page][0];
    const link = pages[page][1];

    pageList += `<li class="nav-info-item"><a href="${link}">${menu}</a></li>`;
  }

  return `<ul class="navbar-nav-info">
            ${pageList}
	  			</ul>`;
};
