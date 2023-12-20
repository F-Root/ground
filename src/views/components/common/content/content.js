import Component from '../Component.js';

export default class Content extends Component {
  template() {
    return /* HTML */ `<div class="content-wrapper">
      <div class="content">
        <article class="content-article">
          <div class="content-article-board"></div>
        </article>
        <aside class="content-aside">
          <div class="content-aside-popular"></div>
          <div class="content-aside-news"></div>
        </aside>
      </div>
    </div>`;
  }
  setEvent() {
    this.addEvent();
  }
}
