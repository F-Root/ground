import Component from './components/common/Component.js';
import Header from './components/header.js';

export default class App extends Component {
  template() {
    return /* HTML */ ` <div data-component="header"></div> `;
  }
  mounted() {
    const $header = this.$target.querySelector('[data-component="header"]');

    new Header($header);
  }
}
