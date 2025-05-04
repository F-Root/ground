import Component from '../../components/core/Component.js';
import Content from '../../components/content/content.js';
import { observable, observe } from '../../components/core/observer.js';
import * as api from '../../public/api.js';

export default class MainWrapper extends Content {
  mounted() {
    const $mainForm = this.$target.querySelector('.content-article-board');

    new MainForm($mainForm);
  }
}

class MainForm extends Component {
  setup() {
    this.setupAsync();
  }
  async setupAsync() {
    this.state = observable(await this.initState());
    observe(() => {
      this.setEvent();
      this.render();
    });
  }
  template() {
    return /* HTML */ `<div class="main-wrapper">${boardBox(this.state)}</div>`;
  }

  setEvent() {
    this.addEvent();
  }
  async initState() {
    const grounds = await getAllGrounds();
    const contents = await getContentsByGrounds(grounds);
    const comments = await getCommentsCountByContents(contents);
    return { grounds, contents, comments };
  }
}

/* Functions */

const loadMainView = () => {};

const getAllGrounds = async () => {
  return await api.get({ endPoint: '/ground' });
};

const getContentsByGrounds = async (grounds) => {
  const query = `?grounds=${encodeURIComponent(JSON.stringify(grounds))}`;
  return await api.get({ endPoint: '/content', query });
};

const getCommentsCountByContents = async (contents) => {
  const allContentsUrl = contents.flatMap((content) =>
    content.posts.map((post) => post.url)
  );
  const query = `?contents=${encodeURIComponent(
    JSON.stringify(allContentsUrl)
  )}`;
  return await api.get({ endPoint: '/comment', query });
};

const getTime = (updateAt) => {
  const updatedDate = new Date(updateAt);
  const now = new Date();

  // 두 시각의 차이를 밀리초 단위로 계산
  const diff = now - updatedDate;

  // 밀리초를 초, 분, 시간으로 변환
  const diffSeconds = Math.floor(diff / 1000);
  const diffMinutes = Math.floor(diff / (60 * 1000));
  const diffHours = Math.floor(diff / (60 * 60 * 1000));
  const diffDays = Math.floor(diff / (24 * 60 * 60 * 1000));

  let when = '';
  if (diffSeconds < 60) {
    // 1분 미만이면 초 단위
    when = `${diffSeconds}초전`;
  } else if (diffMinutes < 60) {
    // 1시간 미만이면 분 단위
    when = `${diffMinutes}분전`;
  } else if (diffHours < 24) {
    // 24시간 미만이면 시간 단위
    when = `${diffHours}시간전`;
  } else {
    // 24시간 이상이면 일 단위
    when = `${diffDays}일전`;
  }

  return when;
};

/* HTML Forms */

const boardBox = ({ grounds, contents, comments }) => {
  return /* HTML */ `<div class="board-box">
    ${boardList(grounds, contents, comments)}
  </div>`;
};

const boardList = (grounds, contents, comments) => {
  let boardList = '';
  grounds.forEach((ground) => {
    boardList += boardWrapper(ground, contents, comments);
  });
  return boardList;
};

const boardWrapper = (ground, contents, comments) => {
  let contentBox = '';
  contents.forEach((content) => {
    if (content._id === ground.id) {
      contentBox = contentList(content.posts, comments);
    }
  });
  return /* HTML */ `<div class="board-wrapper">
    <a href="/ground/${ground.id}" class="board-title">
      ${ground.name} 그라운드
    </a>
    ${contentBox}
  </div>`;
};

const contentList = (contents, comments) => {
  let contentList = '';
  contents.forEach((content) => {
    const { groundId, title, updatedAt, url } = content;
    const time = /* HTML */ `<time class="time" datetime=${updatedAt}>
      ${getTime(updatedAt)}
    </time>`;
    const commentsCount = comments[url] ? comments[url] : 0;
    contentList += /* HTML */ `<div class="content-title">
      <a href="/ground/${groundId}/${url}">
        ${title}
        <p>[${commentsCount}]</p>
      </a>
      ${time}
    </div>`;
  });
  return /* HTML */ `<div class="content-list">${contentList}</div>`;
};

const groundBox = () => {
  return /* HTML */ ``;
};
