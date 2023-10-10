const validateRequestWith = (schema, paramLocation) => {
  return async (req, res, next) => {
    try {
      await schema.validateAsync(req[paramLocation]);
      next();
    } catch (error) {
      throw new Error(error.message);
    }
  };
};

export { validateRequestWith };
