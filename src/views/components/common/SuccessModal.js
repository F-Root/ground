import Component from '../core/Component.js';

class SuccessModal extends Component {
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

const showSuccessModal = (data) => {
  const successModalContainer = document.querySelector(
    '.success-modal-container'
  );
  new SuccessModal(successModalContainer, data);
  successModalContainer.style.zIndex = '2';
  successModalContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.3)';
  document.querySelector('.success-close').focus();
};

export default showSuccessModal;
