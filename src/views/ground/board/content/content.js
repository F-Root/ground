import Component from '../../../components/core/Component.js';
import Content from '../../../components/content/content.js';
import { observable, observe } from '../../../components/core/observer.js';
import * as api from '../../../public/api.js';
import ErrorModal from '../../../components/common/ErrorModal.js';
import ErrorPage from '../../../components/common/errorPage.js';
import { icons } from '../../../public/icons.js';
import { isNull } from '../../../public/util.js';

export default class BoardWrapper extends Content {
  mounted() {
    const $boardForm = this.$target.querySelector('.content-article-board');

    new BoardForm($boardForm);
  }
}

class BoardForm extends Component {
  itemsPerPage = 20;
  selectedPage;
  async setup() {
    try {
      this.state = observable(await this.initState());
      observe(() => {
        this.setEvent();
        this.render();
      });
      this.selectedPage = renderPagination(
        this.state.contentCount,
        this.itemsPerPage,
        this.state.page
      );
    } catch (error) {
      if (error.name.includes('GroundNotExistError')) {
        new ErrorPage(this.$target);
      }
    }
  }
  template() {
    return /* HTML */ `<div class="ground-board-wrapper">
        ${groundTitle(this.state)}
        ${groundContents({ ...this.state, itemsPerPage: this.itemsPerPage })}
      </div>
      <div class="error-modal-container"></div>`;
  }
  setEvent() {
    this.addEvent('click', '.create-button > button', () => {
      const groundPath = location.pathname;
      location.href = `${groundPath}new`;
    });
    this.addEvent('click', '.board-category > li', (event) => {
      const category = event.target.innerHTML;
      if (category === '전체') {
        location.href = `/ground/${this.state.ground.id}`;
        return;
      }
      location.href = `/ground/${this.state.ground.id}/?category=${category}`;
    });
    this.addEvent('click', '.page-numbers', (event) => {
      const page = isNull(event.target.dataset.number)
        ? event.target.firstChild.dataset.number
        : event.target.dataset.number;
      if (this.state.category === '전체') {
        location.href = `/ground/${this.state.ground.id}/?page=${page}`;
        return;
      }
      location.href = `/ground/${this.state.ground.id}/?category=${this.state.category}&page=${page}`;
    });
    this.addEvent('click', '#moveToPrev', () => {
      const page = this.selectedPage.prev;
      if (this.state.category === '전체') {
        location.href = `/ground/${this.state.ground.id}/?page=${page}`;
        return;
      }
      location.href = `/ground/${this.state.ground.id}/?category=${this.state.category}&page=${page}`;
    });
    this.addEvent('click', '#moveToStart', () => {
      if (this.state.category === '전체') {
        location.href = `/ground/${this.state.ground.id}/?page=1`;
        return;
      }
      location.href = `/ground/${this.state.ground.id}/?category=${this.state.category}&page=1`;
    });
    this.addEvent('click', '#moveToNext', () => {
      const page = this.selectedPage.next;
      if (this.state.category === '전체') {
        location.href = `/ground/${this.state.ground.id}/?page=${page}`;
        return;
      }
      location.href = `/ground/${this.state.ground.id}/?category=${this.state.category}&page=${page}`;
    });
    this.addEvent('click', '#moveToEnd', () => {
      const lastPage = this.selectedPage.totalPage;
      if (this.state.category === '전체') {
        location.href = `/ground/${this.state.ground.id}/?page=${lastPage}`;
        return;
      }
      location.href = `/ground/${this.state.ground.id}/?category=${this.state.category}&page=${lastPage}`;
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
    const contentCount = await getNumberOfContents();
    const { contents, category, page } = await getContentsAndPage();
    const { isSubscribed } = await checkSubscribe();
    const { isNotificated } = await checkNotificate();
    const notificate = await getGroundNotificateCount();
    const subscribers = await getGroundSubscriberCount();
    return {
      ground,
      contentCount,
      contents,
      category,
      page,
      isSubscribed,
      isNotificated,
      notificate,
      subscribers,
    };
  }
}

/* Functions */

const showErrorModal = (error) => {
  const errorModalContainer = document.querySelector('.error-modal-container');
  new ErrorModal(errorModalContainer, error.message);
  errorModalContainer.style.zIndex = '2';
  errorModalContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.3)';
  document.querySelector('.error-close').focus();
};

const getGroundInfo = async () => {
  const urlPath = location.pathname.split('/').filter((entry) => entry !== '');
  const { 0: endPoint, 1: params } = { ...urlPath };
  return await api.get({ endPoint, params });
};

const getGroundNotificateCount = async () => {
  const urlPath = location.pathname.split('/').filter((entry) => entry !== '');
  const params = urlPath[1];
  return await api.get({
    endPoint: `user/notificate`,
    params,
  });
};

const getGroundSubscriberCount = async () => {
  const urlPath = location.pathname.split('/').filter((entry) => entry !== '');
  const params = urlPath[1];
  return await api.get({
    endPoint: `user/subscribers`,
    params,
  });
};

const getNumberOfContents = async () => {
  const urlPath = location.pathname.split('/').filter((entry) => entry !== '');
  const endPoint = `content/number/${urlPath[0]}`;
  const params = urlPath[1];
  const query = location.search;
  return await api.get({ endPoint, params, query });
};

const getContentsAndPage = async () => {
  const urlPath = location.pathname.split('/').filter((entry) => entry !== '');
  const endPoint = `content/${urlPath[0]}`;
  const params = urlPath[1];
  const query = location.search;
  return await api.get({
    endPoint,
    params,
    query,
  });
};

const checkSubscribe = async () => {
  const urlPath = location.pathname.split('/').filter((entry) => entry !== '');
  const endPoint = 'user/check/subscribe';
  const params = urlPath[1];
  return await api.get({ endPoint, params });
};

const checkNotificate = async () => {
  const urlPath = location.pathname.split('/').filter((entry) => entry !== '');
  const endPoint = 'user/check/notificate';
  const params = urlPath[1];
  return await api.get({ endPoint, params });
};

/*
 * 총컨텐츠: contentCount
 * 아이템보여줄갯수: itemsPerPage
 * 현재페이지: currentPage
 *
 * 시작: first / 마지막: last
 * 이전: prev / 다음: next
 */

const renderPagination = (contentCount, itemsPerPage, currentPage) => {
  if (contentCount <= itemsPerPage) return;

  const pageWrapper = document.querySelector('.page-wrapper');
  const totalCount = contentCount;
  const totalPage = Math.ceil(totalCount / itemsPerPage);
  const pageGroup = Math.ceil(currentPage / 10);

  let last = pageGroup * 10;
  if (last > totalPage) {
    last = totalPage;
  }
  let first = last - (10 - 1) <= 0 ? 1 : last - (10 - 1);
  let next = last + 1;
  let prev = first - 1;
  const selectedPage = { prev, next, totalPage };

  if (prev > 0) {
    const moveToStart = document.createElement('li');
    moveToStart.id = 'moveToStart';
    moveToStart.insertAdjacentHTML(
      'beforeend',
      `<a>${icons.chevronDoubleLeft}</a>`
    );

    const moveToPrev = document.createElement('li');
    moveToPrev.id = 'moveToPrev';
    moveToPrev.insertAdjacentHTML('beforeend', `<a>${icons.chevronLeft}</a>`);

    pageWrapper.appendChild(moveToStart);
    pageWrapper.appendChild(moveToPrev);
  }

  for (let number = first; number <= last; number++) {
    const pageNumber = document.createElement('li');
    pageNumber.insertAdjacentHTML(
      'beforeend',
      `<a id="page-${number}" data-number="${number}">${number}</a>`
    );
    pageNumber.classList.add('page-numbers');
    pageWrapper.appendChild(pageNumber);
    if (currentPage == number) {
      pageNumber.style.backgroundColor = 'lightgray';
      pageNumber.style.border = '1.3px solid darkgreen';
      pageNumber.style.zIndex = '2';
    }
  }

  if (next < totalPage) {
    const moveToNext = document.createElement('li');
    moveToNext.id = 'moveToNext';
    moveToNext.insertAdjacentHTML('beforeend', `<a>${icons.chevronRight}</a>`);

    const moveToEnd = document.createElement('li');
    moveToEnd.id = 'moveToEnd';
    moveToEnd.insertAdjacentHTML(
      'beforeend',
      `<a>${icons.chevronDoubleRight}</a>`
    );

    pageWrapper.appendChild(moveToNext);
    pageWrapper.appendChild(moveToEnd);
  }

  return selectedPage;
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

const groundContents = (state) => {
  const { ground, contentCount, contents, category, page, itemsPerPage } =
    state;
  const contentButtons = /* HTML */ `<div class="button-wrapper content-button">
    <button><span>${icons.textList}</span><span>전체글</span></button>
    <button><span>${icons.star}</span><span>개념글</span></button>
    <select>
      <option>최신순</option>
      <option>추천순</option>
      <option>댓글순</option>
      <option>스크랩순</option>
      <option>조회순</option>
    </select>
  </div>`;
  const createButton = /* HTML */ `<div class="button-wrapper create-button">
    <button><span>${icons.write}</span><span>글쓰기</span></button>
  </div>`;
  return /* HTML */ `<div class="ground-contents">
    <div class="ground-board-buttons">${contentButtons}${createButton}</div>
    <div class="ground-board-wrapper">
      ${groundBoard({
        ground,
        category,
        contents,
        contentCount,
        page,
        itemsPerPage,
      })}
    </div>
    <div class="ground-board-prev-next">${groundPagination()}</div>
  </div>`;
};

const groundBoard = ({
  ground,
  category,
  contents,
  contentCount,
  page,
  itemsPerPage,
}) => {
  const categoryNav = categoryBar(ground, category);
  const contentList = contentListTable({
    ground,
    contents,
    contentCount,
    page,
    itemsPerPage,
  });
  return /* HTML */ `${categoryNav}${contentList}`;
};

const categoryBar = (ground, selected) => {
  let categories = '';
  const selectedStyle =
    'border: 1px solid lightgray; border-bottom-color: white; font-weight: bold;';
  ground.tab.forEach((category) => {
    if (selected === category) {
      categories += `<li style="${selectedStyle}">${category}</li>`;
      return;
    }
    categories += `<li>${category}</li>`;
  });

  return /* HTML */ `<div class="board-category-wrapper">
    <ul class="board-category">
      ${categories}
    </ul>
  </div>`;
};

const contentListTable = (state) => {
  return /* HTML */ `<div class="board-list-table">
    ${titleNoticeTable()}${articleTable(state)}
  </div>`;
};

const titleNoticeTable = () => {
  const tableTitle = /* HTML */ `<thead class="board-table-title">
    <tr>
      <th>번호</th>
      <th>제목</th>
      <th>작성자</th>
      <th>작성일</th>
      <th>조회수</th>
      <th>추천</th>
    </tr>
  </thead>`;
  const tableNotice = /* HTML */ `<tbody class="board-table-notice"></tbody>`;

  return /* HTML */ `<table>
    ${tableTitle}${tableNotice}
  </table>`;
};

const articleTable = ({
  ground,
  contents,
  contentCount,
  page,
  itemsPerPage,
}) => {
  let articles = ``;
  contents.forEach((content, index) => {
    const date = new Date(content.createdAt);
    articles += /* HTML */ `<tr>
      <td>${contentCount - itemsPerPage * (page - 1) - index}</td>
      <td>
        <div>
          <a href="/ground/${ground.id}/${content.url}">${content.title}</a>
        </div>
      </td>
      <td><a href="#">${content.authorInfo[0].nickname}</a></td>
      <td>
        <div>
          ${date
            .toLocaleString('ko-KR', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
            })
            .split(' ')
            .join('')
            .slice(0, -1)}
        </div>
      </td>
      <td>${content.view}</td>
      <td>${content.rate}</td>
    </tr>`;
  });

  const tableArticles = /* HTML */ `<tbody class="board-table-articles">
    ${articles}
  </tbody>`;

  return /* HTML */ `<table>
    ${tableArticles}
  </table>`;
};

const groundPagination = () => {
  return /* HTML */ `<ul class="page-wrapper"></ul>`;
};
