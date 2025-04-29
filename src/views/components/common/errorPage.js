import Component from './Component';

export default class ErrorPage extends Component {
  template() {
    return /* HTML */ `<div class="error-page">
      <div class="show-error">
        <h1>오류</h1>
        <div>존재하지 않는 그라운드입니다.</div>
        <div class="link-wrapper">
          <a href="/">HOME</a>
          <a href="javascript:history.back()">PREVIOUS PAGE</a>
        </div>
      </div>
      <div class="show-error-code">
        <p class="neon marquee">ERROR 404</p>
      </div>
    </div>`;
  }
}
