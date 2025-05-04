import Component from '../../../components/core/Component.js';
import Content from '../../../components/content/content.js';
import { observable, observe } from '../../../components/core/observer.js';
import * as api from '../../../public/api.js';
import { settingNavBar } from '../../common/navbar.js';
import ErrorModal from '../../../components/common/ErrorModal.js';
import { icons } from '../../../public/icons.js';

export default class GroundsWrapper extends Content {
  mounted() {
    const $groundsForm = this.$target.querySelector('.content-article-board');

    new GroundsForm($groundsForm);
  }
}

class GroundsForm extends Component {
  #draggedRow = null;
  async setup() {
    this.state = observable(await this.initState());
    observe(() => {
      this.setEvent();
      this.render();
    });
    setFocusToSubscribes();
  }
  template() {
    return /* HTML */ `<div class="grounds-wrapper">
        <div class="setting-grounds">
          ${settingNavBar()}${groundsView(this.state)}
        </div>
      </div>
      <div class="error-modal-container"></div>
      <div class="success-modal-container"></div>`;
  }

  setEvent() {
    // 비동기 setup에서는 load같은 window 이벤트가 작동 안됨.
    // this.addWindowEvent('DOMContentLoaded', () => {
    //   if (location.hash === '#subscribes') {
    //     document.querySelector('.subscribe-grounds > h2').scrollIntoView();
    //   }
    // });
    // 따라서 커스텀 이벤트 생성
    this.addEvent('customFocus', '.subscribe-grounds > h2', (event) => {
      if (location.hash === '#subscribes') {
        event.target.scrollIntoView();
      }
    });
    this.addEvent('click', '#go-update-page', (event) => {
      event.preventDefault();
      const id = document.querySelector('#ground-selector').value;
      location.href = `/ground/update/${id}`;
    });
    this.addEvent('click', '#update-subscribes', async (event) => {
      event.preventDefault();
      const subscribeList = Array.from(
        document.querySelectorAll('.subscribes-grounds')
      ).map((ground) => ground.getAttribute('data-ground-id'));
      try {
        await api.put({
          endPoint: '/user/subscribes',
          data: Object.freeze(subscribeList),
        });
        location.reload();
      } catch (error) {
        showErrorModal(error);
      }
    });
    this.addEvent('click', '.subscribe-cancel', async (event) => {
      const element = event.target.closest('.subscribes-grounds');
      const groundId = element.getAttribute('data-ground-id');
      const query = '?clickForSubscribe=false';
      try {
        await api.patch({
          endPoint: '/user/subscribe',
          params: groundId,
          query,
        });
        location.reload();
      } catch (error) {
        showErrorModal(error);
      }
    });
    /* drag events */
    // col-1 버튼을 클릭하는 중에는 draggable = true로 변경
    this.addEvent('mousedown', '.sub-col-1', (event) => {
      const element = event.target.closest('.subscribes-grounds');
      element.draggable = true;
    });
    this.addEvent('mouseup', '.sub-col-1', (event) => {
      const element = event.target.closest('.subscribes-grounds');
      element.draggable = false;
    });
    // 모든 drag handle button에 dragstart 이벤트 등록
    this.addEvent('dragstart', '.subscribes-grounds', (event) => {
      this.#draggedRow = event.target.closest('.subscribes-grounds');
      event.dataTransfer.effectAllowed = 'move';
    });
    /* 드래그 중 즉시 순서가 변경되도록 수정 */
    // 모든 row에 dragover 이벤트 등록
    this.addEvent('dragover', '.subscribes-grounds', (event) => {
      event.preventDefault();
      const element = event.target.closest('.subscribes-grounds');
      const list = document.querySelector('.subscribes-list');
      if (!this.#draggedRow || this.#draggedRow === element) return;

      const rowsArray = Array.from(list.children);
      const draggedIndex = rowsArray.indexOf(this.#draggedRow);
      const targetIndex = rowsArray.indexOf(element);

      // 대상 행의 bounding rectangle
      const rect = element.getBoundingClientRect();
      // 마우스의 Y 좌표
      const mouseY = event.clientY;
      // 대상 행의 중간값
      const threshold = rect.top + rect.height / 2;

      // draggedRow가 위에 있는데 아래로 내려갈 경우, 또는 draggedRow가 아래에 있는데 위로 올라갈 경우
      if (
        (draggedIndex < targetIndex && mouseY > threshold) ||
        (draggedIndex > targetIndex && mouseY < threshold)
      ) {
        // FLIP 애니메이션을 위해 교체 전 전체 row의 위치 기록 (First 단계)
        const allRows = Array.from(list.children);
        const oldPositions = new Map();
        allRows.forEach((row) => {
          oldPositions.set(row, row.getBoundingClientRect());
        });

        // DOM 상의 위치 변경: draggedRow를 대상 행의 바로 앞이나 뒤로 삽입
        if (draggedIndex < targetIndex) {
          list.insertBefore(this.#draggedRow, element.nextSibling);
        } else {
          list.insertBefore(this.#draggedRow, element);
        }

        // FLIP 애니메이션 실행: 각 행이 이전 위치에서 새로운 위치로 부드럽게 이동
        animateRows(oldPositions);
      }
    });
    // 드래그 종료 시 draggedRow 초기화
    this.addEvent('dragend', '.subscribes-grounds', () => {
      this.#draggedRow = null;
    });
    // // 모든 ground에 dragover, dragleave, drop 이벤트 등록
    // this.addEvent('dragover', '.subscribes-grounds', (event) => {
    //   event.preventDefault();
    //   event.dataTransfer.dropEffect = 'move';
    //   const element = event.target.closest('.subscribes-grounds');
    //   element.classList.add('drag-over');
    // });
    // this.addEvent('dragleave', '.subscribes-grounds', (event) => {
    //   const element = event.target.closest('.subscribes-grounds');
    //   element.classList.remove('drag-over');
    // });
    // this.addEvent('drop', '.subscribes-grounds', (event) => {
    //   event.preventDefault();
    //   const element = event.target.closest('.subscribes-grounds');
    //   const list = document.querySelector('.subscribes-list');
    //   element.classList.remove('drag-over');
    //   if (this.#draggedRow && this.#draggedRow !== element) {
    //     // 현재 list의 자식들(행들) 배열을 가져옴
    //     const rows = Array.from(list.children);

    //     // FLIP 애니메이션을 위해 먼저 기존 위치 기록 (First 단계)
    //     const oldPositions = new Map();
    //     rows.forEach((row) => {
    //       oldPositions.set(row, row.getBoundingClientRect());
    //     });

    //     // DOM 순서 변경 (드래그한 행을 새로운 위치로 이동)
    //     const draggedIndex = rows.indexOf(this.#draggedRow);
    //     const targetIndex = rows.indexOf(element);

    //     // 간단하게 DOM에서 draggedRow의 위치를 targetRow 위치로 이동
    //     if (draggedIndex < targetIndex) {
    //       list.insertBefore(this.#draggedRow, element.nextSibling);
    //     } else {
    //       list.insertBefore(this.#draggedRow, element);
    //     }

    //     // DOM 순서가 바뀐 후 FLIP 애니메이션 실행
    //     animateRows(oldPositions);
    //   }
    // });
  }
  async initState() {
    const grounds = await getMyGroundsInfo();
    const subscribes = await getSubscribesInfo();
    return { grounds, subscribes };
  }
}

/* Functions */

// 구독 중인 그라운드 포커싱 처리
const setFocusToSubscribes = () => {
  // bubbles option을 설정해야 커스텀 이벤트가 트리거됨.
  const customEvent = new CustomEvent('customFocus', { bubbles: true });
  document.querySelector('.subscribe-grounds > h2').dispatchEvent(customEvent);
};

const getMyGroundsInfo = async () => {
  return await api.get({ endPoint: '/ground/info/managing' });
};

const getSubscribesInfo = async () => {
  return await api.get({ endPoint: '/user/subscribe/grounds' });
};

const showErrorModal = (error) => {
  const errorModalContainer = document.querySelector('.error-modal-container');
  new ErrorModal(errorModalContainer, error.message);
  errorModalContainer.style.zIndex = '2';
  errorModalContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.3)';
  document.querySelector('.error-close').focus();
};

/* drag event FLIP animation */
// FLIP 애니메이션을 위한 함수: DOM 순서 변경 후 각 row의 이동을 부드럽게 보이게 함.
function animateRows(oldPositions) {
  const list = document.querySelector('.subscribes-list');
  // 변경된 후 각 row의 새로운 위치 측정
  Array.from(list.children).forEach((row) => {
    const newRect = row.getBoundingClientRect();
    const oldRect = oldPositions.get(row);
    const deltaY = oldRect.top - newRect.top; // 이동한 y 거리
    if (deltaY) {
      // 우선 transition 없이 바로 오프셋을 적용
      row.style.transition = 'none';
      row.style.transform = `translateY(${deltaY}px)`;
      // 강제로 reflow를 일으킴 (requestAnimationFrame 사용)
      requestAnimationFrame(() => {
        // 이제 transform이 0이 되도록 애니메이션 시작
        row.style.transition = 'transform 300ms ease';
        row.style.transform = '';
      });
    }
  });
}

/* HTML Forms */

const groundsView = ({ grounds, subscribes }) => {
  return /* HTML */ `<div class="grounds-form-box">
    ${myGrounds(grounds)}${subscribeGrounds(subscribes)}
  </div>`;
};

const myGrounds = (grounds) => {
  const options = grounds.reduce(
    (a, { name, id }) =>
      (a += /* HTML */ `<option value="${id}">${name}</option>`),
    ''
  );
  return /* HTML */ `<div class="my-grounds">
    <h2>내 그라운드 관리</h2>
    <form class="grounds-form">
      <div>
        <label class="grounds-form-label" for="ground-selector">
          그라운드 목록
        </label>
        <div class="grounds-list-select-wrapper">
          <select name="ground-selector" id="ground-selector">
            ${options}
          </select>
        </div>
      </div>
      <button id="go-update-page">관리 페이지로 이동</button>
    </form>
  </div>`;
};

const subscribeGrounds = (subscribes) => {
  return /* HTML */ `<div class="subscribe-grounds">
    <h2>구독 중인 그라운드 관리</h2>
    <form class="grounds-form">
      <div>
        <label class="grounds-form-label">그라운드 목록</label>
        <div class="grounds-list-subscribes-wrapper">
          ${subscribeList(subscribes)}
        </div>
      </div>
      <button id="update-subscribes">저장</button>
    </form>
  </div>`;
};

const subscribeList = (subscribes) => {
  const header = /* HTML */ `<div class="subscribes-header">
    <div class="sub-col sub-col-1"></div>
    <div class="sub-col sub-col-2">그라운드 이름</div>
    <div class="sub-col sub-col-3">구독 취소</div>
  </div>`;
  const groundList = subscribes.reduce(
    (a, { name, id }) =>
      (a += /* HTML */ `<div
        class="subscribes-grounds"
        data-ground-id="${id}"
        draggable="false"
      >
        <div class="sub-col sub-col-1">${icons.drawer}</div>
        <div class="sub-col sub-col-2">${name} 그라운드</div>
        <div class="sub-col sub-col-3 subscribe-cancel">취소</div>
      </div>`),
    ''
  );
  return /* HTML */ `<div class="subscribes-list">${header}${groundList}</div>`;
};
