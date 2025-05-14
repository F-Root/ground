import Component from '../../../components/core/Component.js';
import Content from '../../../components/content/content.js';
import BoardForm from '../../../components/board/board.js';
import { observable, observe } from '../../../components/core/observer.js';
import * as api from '../../../public/api.js';
import { icons } from '../../../public/icons.js';
import Quill from 'quill';
import {
  isEmpty,
  isNull,
  parseQueryStringToObj,
  createQueryStringByObj,
} from '../../../public/util.js';
import showErrorModal from '../../../components/common/ErrorModal.js';
import ErrorPage from '../../../components/common/errorPage.js';

export default class ViewWrapper extends Content {
  mounted() {
    const $viewBoard = this.$target.querySelector('.content-article-board');

    new ViewBoard($viewBoard);
  }
}

class ViewBoard extends BoardForm {
  mounted() {
    const $groundTitle = this.$target.querySelector('.ground-title');
    $groundTitle.insertAdjacentHTML(
      'afterend',
      '<div class="post-view-wrapper"></div>'
    );
    const $viewForm = this.$target.querySelector('.post-view-wrapper');

    new ViewForm($viewForm);
  }
}

class ViewForm extends Component {
  tagNow;
  commentsPerPage = 50;
  selectedCommentPage;
  replyIn;
  replyTo;
  mention;

  async setup() {
    try {
      this.state = observable(await this.initState());
      observe(() => {
        this.setEvent();
        this.render();
      });
      this.selectedCommentPage = renderCommentPagination(
        this.state.commentCount,
        this.commentsPerPage,
        this.state.commentPage
      );
      // document.readyState; -> readyState를 이용해 페이지 load 전에 데이터를 가져오려 했으나 비동기 방식으로 페이지를 load하기로 결정.

      //답글(대댓글) 알림을 통해 접속한 url 처리
      renderNotificatedReply(this.state.replyInfo);

      //렌더링시에 커스텀 이벤트 적용(코멘트 포커싱 & 새 코멘트 생성 후 포커싱)
      //쿠키에 데이터가 있는지 확인
      setFocusNotification();
      setFocusNewComment();

      //렌더링 후 댓글 길이에 따른 더보기 처리
      setSeeMoreButton();
    } catch (error) {
      if (error.name.includes('GroundNotExistError')) {
        new ErrorPage(this.$target);
      }
    }
  }
  template() {
    return /* HTML */ `${groundArticle({
      ...this.state,
    })} `;
  }
  renderComment({
    comments,
    commentPage,
    commentCount,
    pagingReplies,
    numberOfPagingReplies,
  }) {
    this.selectedCommentPage = renderCommentPagination(
      commentCount,
      this.commentsPerPage,
      commentPage
    );

    const target = document.querySelector('.comment-list');
    const replyForm = document.querySelector('.reply-form > textarea');
    target.innerHTML = commentListForm(
      comments,
      pagingReplies,
      numberOfPagingReplies
    );
    replyForm.value = '';
    replyForm.focus();
  }
  setEvent() {
    this.addEvent('click', '.comment-reply', (event) => {
      // replyIn : 답글이 달리는 댓글의 정보가 아닌, 답글이 달리는 댓글의 최상위 박스 정보 (즉 comment 정보)
      this.replyIn = event.target.closest('.comment-wrapper').id.split('c_')[1];
      // mention : 언급한 사람 닉네임
      this.mention = event.target
        .closest('.comment-info')
        .querySelector('.comment-writer')
        .textContent.trim();
      const commentId = event.target.closest('.reply-wrapper')
        ? event.target.closest('.reply-wrapper').id
        : event.target.closest('.comment-wrapper').id;
      const comment = document.querySelector(`#${commentId}`);
      const checkReplyForm = document.querySelector(`#reply_to_${commentId}`);
      // replyTo : 실질적으로 답글을 달 대상 정보 (id 저장)
      this.replyTo = commentId.split('c_')[1];

      if (checkReplyForm) {
        checkReplyForm.remove();
      } else {
        const replyForm = document.createElement('div');
        replyForm.classList.add('ground-comment-write-reply');
        replyForm.id = `reply_to_${commentId}`;
        replyForm.innerHTML = groundReplyForm({
          nickname: this.state.nickname,
          replyTo: this.mention,
        });
        comment.querySelector('.comment-item').after(replyForm);
        replyForm.querySelector('textarea').focus();

        removeAnotherReplyForm(replyForm.id);
      }

      function removeAnotherReplyForm(id) {
        const replyFormList = document.querySelectorAll(
          '.ground-comment-write-reply'
        );
        replyFormList.forEach((replyForm) => {
          if (replyForm.id !== id) replyForm.remove();
        });
      }
    });
    this.addEvent(
      'click',
      '.reply-form > button',
      this.handleSubmit.bind(this)
    );
    this.addEvent(
      'keydown',
      '.reply-form > button',
      this.handleSubmit.bind(this)
    );
    this.addEvent('click', '.error-close', (event) => {
      event.preventDefault();
      this.tagNow.focus();
    });
    this.addEvent('click', '.comment-page-numbers', (event) => {
      const commentPage = isNull(event.target.dataset.number)
        ? event.target.firstChild.dataset.number
        : event.target.dataset.number;
      location.href = `/ground/${this.state.ground.id}/${this.state.contentInfo.url}/?cp=${commentPage}#comments`;
    });
    this.addEvent('click', '#commentMoveToPrev', () => {
      const commentPage = this.selectedPage.prev;
      location.href = `/ground/${this.state.ground.id}/${this.state.contentInfo.url}/?&cp=${commentPage}#comments`;
    });
    this.addEvent('click', '#commentMoveToStart', () => {
      location.href = `/ground/${this.state.ground.id}/${this.state.contentInfo.url}/?cp=1#comments`;
    });
    this.addEvent('click', '#commentMoveToNext', () => {
      const commentPage = this.selectedPage.next;
      location.href = `/ground/${this.state.ground.id}/${this.state.contentInfo.url}/?cp=${commentPage}#comments`;
    });
    this.addEvent('click', '#commentMoveToEnd', () => {
      const lastCommentPage = this.selectedPage.totalPage;
      location.href = `/ground/${this.state.ground.id}/${this.state.contentInfo.url}/?cp=${lastCommentPage}#comments`;
    });
    this.addEvent('customFocus', '#comments', (event) => {
      const { newCommentUrl, notificationUrl } = event.detail;
      if (newCommentUrl) {
        focusEffect(newCommentUrl);
      } else if (notificationUrl) {
        focusEffect(notificationUrl);
      } else if (location.hash === '#comments') {
        event.target.focus();
        event.target.scrollIntoView();
      }

      function focusEffect(url) {
        const target = document.querySelector(`#c_${url}`);
        target.focus();
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'center',
        });
        target.classList.add('commentHighlight');
        setTimeout(() => {
          target.classList.remove('commentHighlight');
        }, 3000);
      }
    });
    this.addEvent('click', '.more-replies', async (event) => {
      const target = event.target.closest('.more-replies');
      const commentId = target
        .closest('.comment-wrapper')
        .id.split('c_')[1]
        .trim();
      const replyId = Array.from(
        target.closest('.comment-wrapper').querySelectorAll('.reply-wrapper')
      )
        .pop()
        .id.split('c_')[1]
        .trim();
      try {
        const query = `?comment=${commentId}&reply=${replyId}`;
        const { replies, comment, numberOfPagingReplies } = await api.get({
          endPoint: '/comment/replies/next',
          query,
        });
        target.insertAdjacentHTML(
          'beforebegin',
          replyListForm(replies, comment, numberOfPagingReplies)
        );
      } catch (error) {
        showErrorModal(error);
      }
    });
    this.addEvent('click', '.more-prev-replies', async (event) => {
      const target = event.target.closest('.more-prev-replies');
      const commentId = target
        .closest('.comment-wrapper')
        .id.split('c_')[1]
        .trim();
      const replyId = Array.from(
        target.closest('.comment-wrapper').querySelectorAll('.reply-wrapper')
      )
        .shift()
        .id.split('c_')[1]
        .trim();
      try {
        const query = `?comment=${commentId}&reply=${replyId}`;
        const { replies, comment, numberOfPagingReplies } = await api.get({
          endPoint: '/comment/replies/prev',
          query,
        });
        target.insertAdjacentHTML(
          'afterend',
          replyListForm(replies, comment, numberOfPagingReplies)
        );
      } catch (error) {
        showErrorModal(error);
      }
    });
    this.addEvent('click', '.see-more-button', (event) => {
      const seeMoreButton = event.target.closest('.see-more-button');
      // const commentMessage = seeMoreButton.closest('.comment-message');
      const commentMessage = seeMoreButton.previousElementSibling;
      const originalHeight = commentMessage.scrollHeight;
      const collapsedHeight =
        parseFloat(getComputedStyle(commentMessage).lineHeight) * 4;
      const isExpanded = commentMessage.classList.toggle('expanded');
      seeMoreButton.innerHTML = isExpanded
        ? /* HTML */ `<p>접기</p>
            ${icons.caretUpFill}`
        : /* HTML */ `<p>더보기</p>
            ${icons.caretDownFill}`;
      commentMessage.style.maxHeight = isExpanded
        ? `${originalHeight}px`
        : `${collapsedHeight}px`;
    });
  }
  async handleSubmit(event) {
    if (
      event.type !== 'click' &&
      !(event.type === 'keydown' && event.key === 'Enter')
    ) {
      return;
    }
    event.preventDefault();
    const isReply = event.target.closest('.ground-comment-write-reply');
    const formData = new FormData(document.querySelector('.reply-form'));
    const commentData = {};
    // 댓글인가?: isReply
    // 답글: this.replyIn
    // 누구에게: this.replyTo
    // 멘션: this.mention

    for (const pair of formData.entries()) {
      const result = checkInputValidate(pair[0], pair[1].trim());
      this.tagNow = document.querySelector(`#${pair[0]}`);

      if (!result.validate) {
        showErrorModal(result);
        return;
      }

      commentData[pair[0]] = pair[1].replace(/\n/g, '<br>');
    }
    commentData['url'] = this.state.contentInfo.url;

    if (isReply) {
      if (this.replyIn) {
        commentData['replyIn'] = this.replyIn;
      }
      if (this.replyTo) {
        commentData['replyTo'] = this.replyTo;
      }
      if (this.mention) {
        commentData['mention'] = this.mention;
      }
    }

    try {
      const { position, type, url } = await api.post({
        endPoint: '/comment/create',
        data: Object.freeze(commentData),
      });
      await setCommentFocus.call(this, { position, type, url });
    } catch (error) {
      showErrorModal(error);
    }
  }
  async initState() {
    const contentInfo = await getContentInfo();
    const articleData = getArticle(contentInfo);
    const {
      comments,
      commentPage,
      commentCount,
      pagingReplies,
      numberOfPagingReplies,
    } = await getCommentsAndCommentPage();
    const nickname = await getLoggedUserInfo();
    //본 게시물 읽음 처리 (notification-content)
    await setContentNotificateRead();
    //reply를 찾기 위한 정보 얻기 (comment는 최상단에 있어서 작업할 필요가 없음)
    const replyInfo = (await getReplyInfo()) ?? {};
    return {
      replyInfo,
      contentInfo,
      articleData,
      comments,
      commentPage,
      commentCount,
      pagingReplies,
      numberOfPagingReplies,
      nickname,
    };
  }
}

/* Functions */

async function setCommentFocus({ position, type, url }) {
  //댓글인지 대댓글인지 확인
  if (type === 'comment') {
    const countPage =
      position.rank % this.commentsPerPage === 0
        ? position.rank / this.commentsPerPage
        : Math.floor(position.rank / this.commentsPerPage) + 1;
    //리다이렉트
    const redirectUrl = `/ground/${this.state.ground.id}/${this.state.contentInfo.url}/?cp=${countPage}#comments`;
    location.href.replace(location.origin, '') === redirectUrl
      ? location.reload()
      : (location.href = redirectUrl);
  } else {
    const commentWrapper = document.querySelector(`#c_${position.url}`);
    const query = `?comment=${position.url}&reply=${url}`;
    const { replies, comment, numberOfPagingReplies } = await api.get({
      endPoint: '/comment/replies/prev/include',
      query,
    });
    // 뒤에서부터 구한 대댓글 + 새 대댓글(맨 마지막): replies
    // 대댓글 갯수: numberOfPagingReplies

    //새로 렌더링
    const repliesToRemove = Array.from(commentWrapper.children).filter(
      (child) => {
        return !child.classList.contains('comment-item');
      }
    );
    repliesToRemove.forEach((child) => child.remove());
    commentWrapper
      .querySelector('.comment-item')
      .insertAdjacentHTML(
        'afterend',
        replyListForm(replies, comment, numberOfPagingReplies)
      );
    setFocusNewComment();
  }
}

const getContentInfo = async () => {
  const urlPath = location.pathname.split('/').filter((entry) => entry !== '');
  const contentUrl = urlPath[2];
  return await api.get({
    endPoint: 'content',
    params: contentUrl,
  });
};

const getArticle = ({ content }) => {
  const tempContainer = document.createElement('div');
  const quillForm = new Quill(tempContainer);
  quillForm.setContents(content);

  return quillForm.root.innerHTML;
};

const getCommentsAndCommentPage = async () => {
  const urlPath = location.pathname.split('/').filter((entry) => entry !== '');
  const contentUrl = urlPath[2];
  const { cp } = parseQueryStringToObj(location.search);
  const query = createQueryStringByObj({ cp });
  return await api.get({
    endPoint: 'comment/content',
    params: contentUrl,
    query,
  });
};

const getLoggedUserInfo = async () => {
  const { nickname } = await api.get({ endPoint: '/user/loggedUser' });
  return nickname;
};

const setContentNotificateRead = async () => {
  const urlPath = location.pathname.split('/').filter((entry) => entry !== '');
  const url = urlPath[2];
  const endPoint = 'notificate/content';
  const query = `?url=${url}`;
  return await api.patch({ endPoint, query });
};

// 답글(대댓글) 정보 찾기 (cp-코멘트 페이지는 이미 전처리 되어있어서 신경쓰지 않아도 됨)
const getReplyInfo = async () => {
  const currentUrl = new URL(location.href);
  // url query에 reply가 존재할 때만 실행
  if (currentUrl.searchParams.has('reply')) {
    const replyUrl = currentUrl.searchParams.get('reply');
    return await api.get({
      endPoint: '/comment/position',
      query: `?reply=${replyUrl}`,
    });
  }
};

// 답글(대댓글) 찾은 후 렌더링
const renderNotificatedReply = ({
  replies,
  comment,
  numberOfPagingReplies,
}) => {
  const currentUrl = new URL(location.href);
  // url query에 reply가 존재할 때만 실행
  if (currentUrl.searchParams.has('reply')) {
    const commentWrapper = document.querySelector(`#c_${comment.url}`);
    // 기존 답글 목록 제거
    const repliesToRemove = Array.from(commentWrapper.children).filter(
      (child) => {
        return !child.classList.contains('comment-item');
      }
    );
    repliesToRemove.forEach((child) => child.remove());
    // 알림이 온 답글로 리스트 갱신
    commentWrapper
      .querySelector('.comment-item')
      .insertAdjacentHTML(
        'afterend',
        replyListForm(replies, comment, numberOfPagingReplies)
      );
  }
};

// 댓글, 답글 포커싱 처리
const setFocusNotification = () => {
  // url 찾기
  const currentUrl = new URL(location.href);
  const url = currentUrl.searchParams.has('comment')
    ? currentUrl.searchParams.get('comment')
    : currentUrl.searchParams.get('reply');

  const cookieValue = document.cookie
    .split('; ')
    .find((row) => row.startsWith(`noti-${url}`))
    ?.split('=')[1];
  const decodeValue = cookieValue
    ? JSON.parse(decodeURIComponent(cookieValue))
    : null;
  const customEvent = new CustomEvent('customFocus', {
    detail: { notificationUrl: decodeValue },
    bubbles: true,
  });
  const commentsHere = document.getElementById('comments');
  commentsHere.dispatchEvent(customEvent);
};

const checkInputValidate = (name, value) => {
  if (name === 'comment') {
    return checkComment(value);
  }
};

const checkComment = (comment) => {
  if (isEmpty(comment)) {
    return { validate: false, message: '! 댓글 내용을 입력해 주세요.' };
  }
  return { validate: true, message: '' };
};

const renderCommentPagination = (
  commentCount,
  commentsPerPage,
  currentPage
) => {
  if (commentCount < commentsPerPage) return;

  const commentWrapper = document.querySelector('.ground-article-comments');
  const existingPageWrapper =
    commentWrapper.querySelector('.comment-prev-next');
  if (existingPageWrapper) {
    existingPageWrapper.remove();
  }
  const pageWrapper = document.createElement('div');
  const listWrapper = document.createElement('ul');
  pageWrapper.classList.add('comment-prev-next');
  listWrapper.classList.add('comment-page-wrapper');
  commentWrapper.appendChild(pageWrapper);
  pageWrapper.appendChild(listWrapper);

  const totalCount = commentCount;
  const totalPage = Math.ceil(totalCount / commentsPerPage);
  const pageGroup = Math.ceil(currentPage / 10);

  let last = pageGroup * 10;
  if (last > totalPage) {
    last = totalPage;
  }

  let first = last - (10 - 1) <= 0 ? 1 : last - (10 - 1);
  let next = last + 1;
  let prev = first - 1;
  const selectedCommentPage = { prev, next, totalPage };

  if (prev > 0) {
    const moveToStart = document.createElement('li');
    moveToStart.id = 'commentMoveToStart';
    moveToStart.insertAdjacentHTML(
      'beforeend',
      `<a>${icons.chevronDoubleLeft}</a>`
    );

    const moveToPrev = document.createElement('li');
    moveToPrev.id = 'commentMoveToPrev';
    moveToPrev.insertAdjacentHTML('beforeend', `<a>${icons.chevronLeft}</a>`);

    listWrapper.appendChild(moveToStart);
    listWrapper.appendChild(moveToPrev);
  }

  for (let number = first; number <= last; number++) {
    const pageNumber = document.createElement('li');
    pageNumber.insertAdjacentHTML(
      'beforeend',
      `<a id="page-${number}" data-number="${number}">${number}</a>`
    );
    pageNumber.classList.add('comment-page-numbers');
    listWrapper.appendChild(pageNumber);
    if (currentPage == number) {
      pageNumber.style.backgroundColor = 'lightgray';
      pageNumber.style.border = '1.3px solid darkgreen';
      pageNumber.style.zIndex = '2';
    }
  }

  if (next < totalPage) {
    const moveToNext = document.createElement('li');
    moveToNext.id = 'commentMoveToNext';
    moveToNext.insertAdjacentHTML('beforeend', `<a>${icons.chevronRight}</a>`);

    const moveToEnd = document.createElement('li');
    moveToEnd.id = 'commentMoveToEnd';
    moveToEnd.insertAdjacentHTML(
      'beforeend',
      `<a>${icons.chevronDoubleRight}</a>`
    );

    listWrapper.appendChild(moveToNext);
    listWrapper.appendChild(moveToEnd);
  }

  return selectedCommentPage;
};

const setFocusNewComment = () => {
  const cookieValue = document.cookie
    .split('; ')
    .find((row) => row.startsWith('newComment='))
    ?.split('=')[1];
  const decodeValue = cookieValue
    ? JSON.parse(decodeURIComponent(cookieValue))
    : null;
  const customEvent = new CustomEvent('customFocus', {
    detail: { newCommentUrl: decodeValue },
    bubbles: true,
  });
  const commentsHere = document.getElementById('comments');
  commentsHere.dispatchEvent(customEvent);
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

const groundArticle = ({
  contentInfo,
  articleData,
  comments,
  nickname,
  pagingReplies,
  numberOfPagingReplies,
}) => {
  const articleHead = groundArticleHead(contentInfo);
  const articleBody = groundArticleBody(articleData);
  const articleRate = groundArticleRate();
  const articleMenu = groundArticleMenu();
  const articleComments = groundArticleCommentsAndReplies(
    comments,
    pagingReplies,
    numberOfPagingReplies
  );
  const articleReply = groundArticleWriteComment(nickname);

  return /* HTML */ `<div class="ground-article-wrapper">
    ${articleHead}${articleBody}${articleRate}${articleMenu}${articleComments}${articleReply}
  </div>`;
};

const groundArticleHead = (contentInfo) => {
  const date = new Date(contentInfo.createdAt);
  const titleRow = /* HTML */ `<div class="title-row">
    <div class="content-title">${contentInfo.title}</div>
  </div>`;
  const InfomationRow = /* HTML */ `<div class="info-row">
    <div class="writer-info">
      <div class="user-image"></div>
      <div class="user-nickname">${contentInfo.author.nickname}</div>
    </div>
    <div class="article-info">
      <div><span>추천</span><span>${contentInfo.rate}</span></div>
      <div><span>조회</span><span>${contentInfo.view}</span></div>
      <div>
        <span>작성일</span
        ><span
          >${date.toLocaleString('ko-KR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          })}</span
        >
      </div>
    </div>
  </div>`;

  return /* HTML */ `<div class="ground-article-head">
    ${titleRow}${InfomationRow}
  </div>`;
};

const groundArticleBody = (articleData) => {
  return /* HTML */ `<div class="ground-article-body">
    <div class="article">${articleData}</div>
  </div>`;
};

const groundArticleRate = () => {
  return /* HTML */ `<div class="ground-article-rate">
    <button>${icons.thumbsUp}</button><button>${icons.thumbsDown}</button>
  </div>`;
};

const groundArticleMenu = () => {
  return /* HTML */ `<div class="ground-article-menu">
    <button><span></span><span>스크랩</span></button>
    <button><span></span><span>공유</span></button>
    <button><span></span><span>신고</span></button>
  </div>`;
};

const groundArticleCommentsAndReplies = (
  comments,
  pagingReplies,
  numberOfPagingReplies
) => {
  return /* HTML */ `<div class="ground-article-comments" id="comments">
    <h3>댓글</h3>
    <ul class="comment-list">
      ${commentListForm(comments, pagingReplies, numberOfPagingReplies)}
    </ul>
  </div>`;
};

const commentListForm = (comments, pagingReplies, numberOfPagingReplies) => {
  let commentList = ``;
  comments.forEach((comment) => {
    const date = new Date(comment.createdAt);
    commentList += /* HTML */ `<li
      class="comment-wrapper"
      id="c_${comment.url}"
    >
      <div class="comment-item">
        <div class="comment-info">
          <div class="comment-writer">${comment.authorInfo[0].nickname}</div>
          <div class="comment-side-menu">
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
            <div>
              <strong>!</strong>
              <p>신고</p>
            </div>
            <div class="comment-reply">
              ${icons.reply}
              <p>답글</p>
            </div>
          </div>
        </div>
        <div class="comment-message">${comment.comment}</div>
      </div>
      ${replyListForm(pagingReplies, comment, numberOfPagingReplies)}
    </li>`;
  });
  return commentList;
};

const replyListForm = (pagingReplies, comment, numberOfPagingReplies) => {
  const { _id: commentId, url: commentUrl, replyCheck } = comment;
  let replyList = ''; //답글 목록
  let replyCount = isNull(document.querySelector(`#c_${commentUrl}`))
    ? 0
    : document
        .querySelector(`#c_${commentUrl}`)
        .querySelectorAll('.reply-wrapper').length; //현재 렌더링 된 답글 갯수

  pagingReplies.forEach(
    ({ replyIn, author: { nickname }, mention, url, comment, createdAt }) => {
      if (replyIn === commentId) {
        const date = new Date(createdAt);
        const replyTo = nickname !== mention ? checkReplyTo(mention) : '';

        replyCount++;
        replyList += /* HTML */ `<div class="reply-wrapper" id="c_${url}">
          <div class="comment-item">
            <div class="comment-info">
              <div class="comment-writer">${nickname}</div>
              <div class="comment-side-menu">
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
                <div>
                  <strong>!</strong>
                  <p>신고</p>
                </div>
                <div class="comment-reply">
                  ${icons.reply}
                  <p>답글</p>
                </div>
              </div>
            </div>
            <div class="comment-message">
              ${replyTo}
              <div>${comment}</div>
            </div>
          </div>
        </div>`;
      }
    }
  );

  // 더보기 버튼 처리
  // 버튼 아이디
  // const buttonId =
  //   replyCheck?.period === 'early'
  //     ? `reply-prev#${commentUrl}`
  //     : `reply-next#${commentUrl}`;
  const buttonId = {
    early: `reply-prev#${commentUrl}`,
    lately: `reply-next#${commentUrl}`,
  };
  // 이전,이후 댓글 더보기
  const { early, lately } = replyCheck || {};
  if (replyCheck) {
    if (lately || lately === null) {
      moreButton('more-replies', lately, buttonId.lately);
    }
    if (early || early === null) {
      moreButton('more-prev-replies', early, buttonId.early);
    }
  }
  // 모든 댓글의 대댓글 더보기(처음 렌더링 될 때 실행됨. -> 맨 첫 답글부터 보여줌)
  else if (numberOfPagingReplies[commentId] > replyCount) {
    moreButton(
      'more-replies',
      numberOfPagingReplies[commentId],
      buttonId.lately
    );
  }

  function moreButton(className, reply, buttonId) {
    const $more = document.querySelectorAll(`.${className}`);
    const checkExist = Array.from($more).filter(
      (more) => more.getAttribute('data-more') === buttonId
    );

    if (!isNull(reply) && isEmpty(checkExist)) {
      createMoreButton(className, buttonId);
    }
    if (isNull(reply)) {
      const buttonCheck = document.querySelector(`[data-more="${buttonId}"`);
      if (buttonCheck) {
        buttonCheck.style.display = 'none';
      }
    }
  }

  function createMoreButton(className, buttonId) {
    if (className === 'more-replies') {
      replyList += /* HTML */ `<div
        class="${className}"
        data-more="${buttonId}"
      >
        <span>답글 더보기</span>${icons.caretDownFill}
      </div>`;
    } else {
      // if (numberOfPagingReplies[commentId] > replyCount) { -> 요거 왜 해놨는지 까먹음...
      replyList =
        /* HTML */ `<div class="${className}" data-more="${buttonId}">
        <span>이전 답글 더보기</span>${icons.caretUpFill}
      </div>` + replyList;
      // }
    }
  }

  return replyList;
};

const setSeeMoreButton = () => {
  const originalReplies = document.querySelectorAll('.comment-message');
  const seeMoreButton = /* HTML */ `<div class="see-more-button">
    <p>더보기</p>
    ${icons.caretDownFill}
  </div>`;

  originalReplies.forEach((reply) => {
    reply.insertAdjacentHTML('afterend', seeMoreButton);
    const originalHeight = reply.scrollHeight;
    const collapsedHeight = parseFloat(getComputedStyle(reply).lineHeight) * 4;
    const moreButton = reply.nextElementSibling;

    if (originalHeight <= collapsedHeight) {
      moreButton.style.display = 'none';
    }
  });
};

const groundArticleWriteComment = (nickname) => {
  return /* HTML */ `<div class="ground-article-write-comment">
    ${groundReplyForm({ nickname })}
  </div>`;
};

const groundReplyForm = ({ nickname, replyTo }) => {
  const replyInfo = /* HTML */ `<div class="reply-info">
    <span>${nickname}</span>
  </div>`;
  const mention = checkReplyTo(replyTo);
  const replyForm = /* HTML */ `<form class="reply-form">
    <textarea
      maxlength="5000"
      required="required"
      placeholder="댓글 작성"
      name="comment"
      id="comment"
    ></textarea>
    <button>작성</button>
  </form>`;

  return /* HTML */ `<div class="reply-form-container">
    ${replyInfo}${nickname !== replyTo ? mention : ''}${replyForm}
  </div>`;
};

const checkReplyTo = (replyTo) => {
  if (!isNull(replyTo)) {
    return /* HTML */ `<p class="reply-mention">
      <strong>@${replyTo}</strong>
    </p>`;
  }
  return '';
};
