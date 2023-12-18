import { isNull } from '../views/public/util.js';

class AppError extends Error {
  name = 'error';
  httpCode;
  message;

  constructor(name, message, httpCode) {
    super(message);
    this.httpCode = httpCode ?? 500;
    this.message = message;
    if (!isNull(name)) {
      this.name = name;
    }
  }
}

const errorHandler = (error, req, res, next) => {
  const warningColor = '\x1b[33m'; //yellow
  const resetColor = '\x1b[0m'; //reset to default
  console.log(`${warningColor}${error.stack}${resetColor}`); //express console

  if (error instanceof AppError) {
    res
      .status(error.httpCode)
      .json({ type: error.name, description: error.message });
  } else {
    res.status(500).json({ type: 'error', description: error.message });
  }
};

export { AppError, errorHandler };
