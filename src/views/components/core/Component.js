import { observable, observe } from './observer.js';

export default class Component {
  $target;
  props;
  state;
  constructor($target, props) {
    this.$target = $target;
    this.props = props;
    this.setup();
    // console.log('실행:', this.$target.parentElement, this.$target.lastChild);
  }
  setup() {
    this.state = observable(this.initState());
    observe(() => {
      this.setEvent();
      this.render();
    });
  }
  mounted() {}
  template() {
    return ``;
  }
  render() {
    this.$target.innerHTML = this.template();
    this.mounted();
  }
  initState() {
    return {};
  }
  /* setState는 observer로 대체 (상태관리) */
  // setState(newState) {
  //   this.state = { ...this.state, ...newState };
  //   this.render();
  // }
  setEvent() {}
  addEvent(eventType, selector, callback) {
    this.$target.addEventListener(eventType, (event) => {
      if (!event.target.closest(selector)) return false;
      callback(event);
    });
  }
  removeEvent(eventType, selector, callback) {
    this.$target.removeEventListener(eventType, (event) => {
      if (!event.target.closest(selector)) return false;
      callback(event);
    });
  }
  addWindowEvent(eventType, callback) {
    window.addEventListener(eventType, (event) => {
      callback(event);
    });
  }
  removeWindowEvent(eventType, callback) {
    window.removeEventListener(eventType, (event) => {
      callback(event);
    });
  }
}
