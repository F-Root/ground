import Component from '../../components/core/Component.js';
import Header from '../../components/header/header.js';
import Footer from '../../components/footer/footer.js';
import AccountWrapper from './content/content.js';

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
    new AccountWrapper($content);
    new Footer($footer);
  }
}
