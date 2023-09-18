import Component from './common/Component.js';

export default class Content extends Component {
  setup() {}
  template() {
    return /* HTML */ `<div class="contents-wrapper">
      <div class="contents">
        <article class="contents-article">
          <div class="contents-article-board"></div>
        </article>
        <aside class="contents-aside">
          <div class="contents-aside-popular"></div>
          <div class="contents-aside-news"></div>
        </aside>
      </div>
    </div>`;
  }
}
