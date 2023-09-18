import Component from './components/common/Component.js';
import Header from './components/header.js';
import Content from './components/contents.js';

export default class App extends Component {
  template() {
    return /* HTML */ `
      <div data-component="header"></div>
      <div data-component="content"></div>
    `;
  }
  mounted() {
    const $header = this.$target.querySelector('[data-component="header"]');
    const $content = this.$target.querySelector('[data-component="content"]');

    new Header($header);
    new Content($content);
  }
}
