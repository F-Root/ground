import Component from './Component.js';

export default class LoadingModal extends Component {
  template() {
    return /* HTML */ `<div class="loading-modal">
      <div class="loading-modal-content">
        <div class="loading-spinner" id="spinner"></div>
        <div class="loading-message">${this.props}</div>
      </div>
    </div>`;
  }
}
