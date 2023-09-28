const errorHandler = (error, req, res, next) => {
  const warningColor = '\x1b[33m'; //yellow
  const resetColor = '\x1b[0m'; //reset to default
  console.log(`${warningColor}${error.stack}${resetColor}`); //express console

  res.status(400).json({ result: 'error', reason: error.message });
};

export { errorHandler };
