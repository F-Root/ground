import Component from '../../components/common/Component.js';
import Content from './content/content.js';

export default class App extends Component {
  template() {
    return /* HTML */ `<div data-component="content"></div>`;
  }
  mounted() {
    const $content = this.$target.querySelector('[data-component="content"]');

    new Content($content);
  }
}
