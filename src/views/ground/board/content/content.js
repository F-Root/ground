import Content from '../../../components/content/content.js';
import BoardForm from '../../../components/board/board.js';

export default class BoardWrapper extends Content {
  mounted() {
    const $boardForm = this.$target.querySelector('.content-article-board');

    new BoardForm($boardForm);
  }
}
