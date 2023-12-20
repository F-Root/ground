import Component from '../common/Component.js';
import Header from '../common/header/header.js';
import Content from '../common/content/content.js';
import Footer from '../common/footer/footer.js';

export default class App extends Component {
  template() {
    return /* HTML */ `
      <div data-component="header"></div>
      <div data-component="content"></div>
      <div data-component="footer"></div>
    `;
  }
  mounted() {
    const $header = this.$target.querySelector('[data-component="header"]');
    const $content = this.$target.querySelector('[data-component="content"]');
    const $footer = this.$target.querySelector('[data-component="footer"]');

    new Header($header);
    new Content($content);
    new Footer($footer);
  }
}
