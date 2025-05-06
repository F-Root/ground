import Component from '../core/Component.js';

class LoadingModal extends Component {
  template() {
    return /* HTML */ `<div class="loading-modal">
      <div class="loading-modal-content">
        <div class="loading-spinner" id="spinner"></div>
        <div class="loading-message">${this.props}</div>
      </div>
    </div>`;
  }
}

const showLoadingModal = (message) => {
  const loadingModalContainer = document.querySelector(
    '.loading-modal-container'
  );
  new LoadingModal(loadingModalContainer, message);
  loadingModalContainer.style.zIndex = '2';
  loadingModalContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.3)';
};

export default showLoadingModal;
