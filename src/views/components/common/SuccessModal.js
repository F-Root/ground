import Component from './Component.js';

export default class SuccessModal extends Component {
  template() {
    return /* HTML */ `
      <div class="success-modal">
        <div class="success-notice-modal">
          <h2 class="success-notice">Succeed</h2>
          <div class="success-description">${this.props}</div>
          <button class="success-close">확인</button>
        </div>
      </div>
    `;
  }
  setEvent() {
    this.addEvent('click', '.success-close', () => {
      this.$target.innerHTML = '';
      this.$target.style.zIndex = '0';
      this.$target.style.backgroundColor = '';
    });
  }
}
