import { isNull } from './util.js';

export default class AppError extends Error {
  name = 'error';
  message;

  constructor(name, message) {
    super(message);
    this.message = message;
    if (!isNull(name)) {
      this.name = name;
    }
  }
}
