import Component from '../components/core/Component.js';

// uses Quill editor / link - https://quilljs.com/
import 'quill/dist/quill.snow.css';
import Quill from 'quill/core';
import Toolbar from 'quill/modules/toolbar';
import Snow from 'quill/themes/snow';

import Bold from 'quill/formats/bold';
import Italic from 'quill/formats/italic';
import Underline from 'quill/formats/underline';
import Header from 'quill/formats/header';

Quill.register({
  'modules/toolbar': Toolbar,
  'themes/snow': Snow,
  'formats/bold': Bold,
  'formats/italic': Italic,
  'formats/underline': Underline,
  'formats/header': Header,
});

const options = {
  // debug: 'info',
  modules: {
    toolbar: true,
  },
  placeholder: '게시물을 작성해 주세요...',
  theme: 'snow',
};

// const quill = new Quill('#editor', options);

export default class WysiwigForm extends Component {
  editor;
  constructor($target, props) {
    super($target, props);
    this.initQuill();
  }
  template() {
    return /* HTML */ `<div id="editor"></div>`;
  }
  initQuill() {
    const wysiwig = new Quill('#editor', options);
    // this.editor = wysiwig.editor;
    this.editor = wysiwig;
  }
  getQuill() {
    return this.editor;
  }
  setQuill() {}
}
