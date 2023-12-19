import Component from './Component.js';

export default class ErrorModal extends Component {
  template() {
    return /* HTML */ `
      <div class="error-modal">
        <div class="error-notice-modal">
          <h2 class="error-notice">Warning</h2>
          <div class="error-description">${this.props}</div>
          <button class="error-close">확인</button>
        </div>
      </div>
    `;
  }
  setEvent() {
    this.addEvent('click', '.error-close', () => {
      this.$target.innerHTML = '';
      this.$target.style.zIndex = '0';
      this.$target.style.backgroundColor = '';
    });
  }
}
