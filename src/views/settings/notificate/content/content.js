import Component from '../../../components/core/Component.js';
import Content from '../../../components/content/content.js';
import { observable, observe } from '../../../components/core/observer.js';
import * as api from '../../../public/api.js';
import { settingNavBar } from '../../common/navbar.js';
import ErrorModal from '../../../components/common/ErrorModal.js';
import { isEmpty } from '../../../public/util.js';
import { icons } from '../../../public/icons.js';

export default class NotificateWrapper extends Content {
  mounted() {
    const $notificateForm = this.$target.querySelector(
      '.content-article-board'
    );

    new NotificateForm($notificateForm);
  }
}

class NotificateForm extends Component {
  async setup() {
    this.state = observable(await this.initState());
    observe(() => {
      this.setEvent();
      this.render();
    });
  }
  template() {
    return /* HTML */ `<div class="notificate-wrapper">
        <div class="setting-notificate">
          ${settingNavBar()}${notificateView(this.state)}
        </div>
      </div>
      <div class="error-modal-container"></div>`;
  }

  setEvent() {
    this.addEvent('click', '#reply-notificate', async (event) => {
      event.preventDefault();
      const comment = document.getElementById('comment-selector').value;
      const reply = document.getElementById('reply-selector').value;
      try {
        await api.patch({
          endPoint: '/user/comment/notificate',
          data: { comment, reply },
        });
        location.reload();
      } catch (error) {
        showErrorModal(error);
      }
    });
    this.addEvent('click', '#ground-notificate', async (event) => {
      event.preventDefault();
      const formData = new FormData(
        document.querySelector('.ground-notification')
      );
      //notificate data에 ground추가
      const notificateData = Array.from(
        document.querySelectorAll('.notificate-grounds')
      ).reduce((notificate, ground) => {
        const groundId = ground.getAttribute('data-ground-id');
        //알림 취소 확인
        const canceled =
          ground.firstElementChild.classList.contains('canceled');
        if (canceled) {
          notificate[groundId] = { canceled: true };
        } else {
          notificate[groundId] = { sort: [], tab: [] };
        }
        return notificate;
      }, {});
      //수신할 알림 항목(데이터)
      for (const pair of formData.entries()) {
        const [name, value] = pair;
        const id = name.split('-')[1];
        if (['best', 'all'].includes(value)) {
          notificateData[id].sort?.push(value);
        } else {
          notificateData[id].tab?.push(value);
        }
      }

      try {
        await api.patch({
          endPoint: '/user/notification',
          data: Object.freeze(notificateData),
        });
        location.reload();
      } catch (error) {
        showErrorModal(error);
      }
    });
    this.addEvent('click', '.notificate-best', (event) => {
      const checkbox = event.target.closest('.notificate-best');
      if (checkbox.checked) {
        checkNotificate(checkbox);
      } else {
        unCheckNotificate(checkbox);
      }
    });
    this.addEvent('click', '.notificate-all', (event) => {
      const checkbox = event.target.closest('.notificate-all');
      const choicebox = event.target.closest('.sub-col-2');
      if (checkbox.checked) {
        checkNotificate(checkbox);
        // 전체글 클릭 시 tablist 생성
        choicebox.querySelector('.tab-list-wrapper').style.display = 'block';
        // 전체탭만 check 활성화
        Array.from(choicebox.getElementsByClassName('notificate-tab')).forEach(
          (tab) => {
            if (tab.value === '전체' && tab.checked === false) {
              checkNotificate(tab);
              tab.checked = true;
            }
          }
        );
      } else {
        unCheckNotificate(checkbox);
        // 전체글 클릭 시 tablist 제거
        choicebox.querySelector('.tab-list-wrapper').style.display = 'none';
        // 해당 ground의 모든 탭 리스트 check 해제
        Array.from(choicebox.getElementsByClassName('notificate-tab')).forEach(
          (tab) => {
            unCheckNotificate(tab);
            tab.checked = false;
          }
        );
      }
    });
    this.addEvent('click', '.notificate-tab', (event) => {
      const checkbox = event.target.closest('.notificate-tab');
      if (checkbox.checked) {
        //맨 처음 전체글을 선택할 때, 전체탭은 default로 체크되어 있음.
        //전체 외의 탭을 클릭 시 전체탭은 클릭 해제됨.
        checkTabList(checkbox);
      } else {
        unCheckTabList(checkbox);
      }
    });
    this.addEvent('click', '.notificate-cancel', (event) => {
      event.preventDefault();
      const cancelButton = event.target.closest('.notificate-cancel');
      const ground = cancelButton.closest('.notificate-grounds');
      if (cancelButton.classList.contains('canceled')) {
        cancelButton.classList.remove('canceled');
        cancelButton.innerHTML = icons.minusCircle;
        ground.querySelector('.sub-col-1').classList.remove('canceled');
        ground.querySelector('.sub-col-2').classList.remove('canceled');
      } else {
        cancelButton.classList.add('canceled');
        cancelButton.innerHTML = icons.plusCircle;
        ground.querySelector('.sub-col-1').classList.add('canceled');
        ground.querySelector('.sub-col-2').classList.add('canceled');
      }
    });
  }
  async initState() {
    return await getUserNotificate();
  }
}

/* Functions */

const getUserNotificate = async () => {
  return await api.get({ endPoint: '/user/notificate/grounds' });
};

const showErrorModal = (error) => {
  const errorModalContainer = document.querySelector('.error-modal-container');
  new ErrorModal(errorModalContainer, error.message);
  errorModalContainer.style.zIndex = '2';
  errorModalContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.3)';
  document.querySelector('.error-close').focus();
};

const checkNotificate = (checkbox) => {
  const label = document.querySelector(`label[for="${checkbox.id}"]`);
  label.classList.add('notificate-checked');
  label.insertAdjacentHTML('afterbegin', icons.check);
};

const unCheckNotificate = (checkbox) => {
  const label = document.querySelector(`label[for="${checkbox.id}"]`);
  label.classList.remove('notificate-checked');
  label.querySelector('svg')?.remove();
};

const checkTabList = (checkbox) => {
  const tablist = checkbox.closest('.tab-list');
  const tabCheckList = tablist.querySelectorAll('.notificate-tab');
  //전체탭이 check되었으면 나머지 탭 모두 check 해제.
  if (checkbox.value === '전체') {
    checkNotificate(checkbox);
    Array.from(tabCheckList).forEach((tab) => {
      if (tab.value !== '전체') {
        tab.checked = false;
        unCheckNotificate(tab);
      }
    });
  } else {
    //전체탭이 아닌 다른 탭이 check되었으면 전체 탭 check 해제
    checkNotificate(checkbox);
    Array.from(tabCheckList).forEach((tab) => {
      if (tab.value === '전체') {
        tab.checked = false;
        unCheckNotificate(tab);
      }
    });
  }
};

const unCheckTabList = (checkbox) => {
  const tablist = checkbox.closest('.tab-list');
  const tabCheckList = tablist.querySelectorAll('.notificate-tab');
  //전체탭은 클릭해도 check 해제되지 않음.
  if (checkbox.value === '전체') {
    checkbox.checked = true;
  } else {
    unCheckNotificate(checkbox);
    //전체탭을 제외한 모든 탭이 check 해제 되면 전체 탭 check 처리
    let tabAll; //전체탭
    const checklist = Array.from(tabCheckList).filter((tab) => {
      if (tab.value === '전체') {
        tabAll = tab;
      }
      if (tab.value !== '전체' && tab.checked === false) {
        return tab;
      }
    });
    //tab list + 1 (전체탭) = 모든 탭 리스트의 길이
    if (checklist.length + 1 === tabCheckList.length) {
      tabAll.checked = true;
      checkNotificate(tabAll);
    }
  }
};

/* HTML Forms */

const notificateView = ({ comment, reply, content }) => {
  return /* HTML */ `<div class="notificate-form-box">
    ${replyNotification({ comment, reply })}${groundNotification(content)}
  </div>`;
};

const replyNotification = ({ comment, reply }) => {
  return /* HTML */ `<div class="notificate-reply">
    <h2>댓글 알림 관리</h2>
    <form class="notificate-form comment-notification">
      <div>
        <label class="notificate-form-label" for="image"
          >게시글 댓글 알림</label
        >
        <div class="comment-notificate-select-wrapper">
          <select name="comment-selector" id="comment-selector">
            ${optionSetting(comment)}
          </select>
        </div>
      </div>
      <div>
        <label class="notificate-form-label" for="image">답글 알림</label>
        <div class="reply-notificate-select-wrapper">
          <select name="reply-selector" id="reply-selector">
            ${optionSetting(reply)}
          </select>
        </div>
      </div>
      <button id="reply-notificate">저장</button>
    </form>
  </div>`;
};

const optionSetting = (value) => {
  const on = /* HTML */ `<option value="on" selected>켜기</option>
    <option value="off">끄기</option> `;
  const off = /* HTML */ `<option value="on">켜기</option>
    <option value="off" selected>끄기</option> `;
  return value ? on : off;
};

const groundNotification = (content) => {
  return /* HTML */ `<div class="notificate-ground">
    <h2>그라운드 알림 관리</h2>
    <form class="notificate-form ground-notification">
      <div>
        <label class="notificate-form-label">그라운드 목록</label>
        <div class="grounds-list-notificate-wrapper">
          ${notificateList(content)}
        </div>
      </div>
      <button id="ground-notificate">저장</button>
    </form>
  </div>`;
};

const notificateList = (content) => {
  const header = /* HTML */ `<div class="notificate-header">
    <div class="sub-col sub-col-1">그라운드 이름</div>
    <div class="sub-col sub-col-2">알림 선택</div>
    <div class="sub-col sub-col-3">알림 설정</div>
  </div>`;
  const groundList = content.reduce((list, { ground, sort, tab }) => {
    if (ground) {
      const { name, id, tab: tablist } = ground;
      return (list += /* HTML */ `<div
        class="notificate-grounds"
        data-ground-id="${id}"
      >
        <div class="sub-col sub-col-1">${name} 그라운드</div>
        <div class="sub-col sub-col-2">
          ${setTypeButton({ id, sort, tab, tablist })}
        </div>
        <div class="sub-col sub-col-3 notificate-cancel">
          ${icons.minusCircle}
        </div>
      </div>`);
    }
    return list;
  }, '');
  return /* HTML */ `<div class="notificate-list">${header}${groundList}</div>`;
};

const setTypeButton = ({ id, sort, tab, tablist }) => {
  const tabListPopup = createTabListBox({ id, tab, tablist });
  return /* HTML */ `<input
      type="checkbox"
      name="notificate-${id}-best"
      id="notificate-${id}-best"
      class="noti-checkboxes notificate-best"
      data-id="${id}"
      value="best"
      ${sort.includes('best') ? 'checked' : ''}
    />
    <label
      for="notificate-${id}-best"
      class="check-button sort ${sort.includes('best')
        ? 'notificate-checked'
        : ''}"
      >${sort.includes('best') ? icons.check : ''}개념글</label
    >
    <input
      type="checkbox"
      name="notificate-${id}-all"
      id="notificate-${id}-all"
      class="noti-checkboxes notificate-all"
      data-id="${id}"
      value="all"
      ${sort.includes('all') ? 'checked' : ''}
    />
    <label
      for="notificate-${id}-all"
      class="check-button sort ${sort.includes('all')
        ? 'notificate-checked'
        : ''}"
      >${sort.includes('all') ? icons.check : ''}전체글</label
    >
    ${tabListPopup}`;
};

const createTabListBox = ({ id, tab, tablist }) => {
  const tabList = tablist.reduce(
    (a, tabNow) =>
      (a += /* HTML */ `<li>
        <input
          type="checkbox"
          name="notificate-${id}-${encodeURIComponent(tabNow)}"
          id="notificate-${id}-${encodeURIComponent(tabNow)}"
          class="noti-checkboxes notificate-tab"
          data-id="${id}"
          value="${tabNow}"
          ${isEmpty(tab) && tabNow === '전체'
            ? 'checked'
            : tab.includes(tabNow)
            ? 'checked'
            : ''}
        />
        <label
          for="notificate-${id}-${encodeURIComponent(tabNow)}"
          class="check-button tabs ${isEmpty(tab) && tabNow === '전체'
            ? 'notificate-checked'
            : tab.includes(tabNow)
            ? 'notificate-checked'
            : ''}"
          >${isEmpty(tab) && tabNow === '전체'
            ? icons.check
            : tab.includes(tabNow)
            ? icons.check
            : ''}${tabNow}</label
        >
      </li>`),
    ''
  );
  return /* HTML */ `<div
    class="tab-list-wrapper"
    ${isEmpty(tab) ? '' : 'style="display: block;"'}
  >
    <ul class="tab-list">
      ${tabList}
    </ul>
  </div>`;
};
