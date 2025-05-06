import Component from '../core/Component.js';

class ErrorModal extends Component {
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

const showErrorModal = (
  error,
  element = '.error-modal-container',
  zIndex = '4'
) => {
  const errorModalContainer = document.querySelector(element);
  new ErrorModal(errorModalContainer, error.message);
  errorModalContainer.style.zIndex = zIndex;
  errorModalContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.3)';
  document.querySelector('.error-close').focus();
};

export default showErrorModal;
