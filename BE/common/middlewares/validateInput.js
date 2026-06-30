const HttpError = require("../httpError");
const validateInput = (schema, propety) => {
  return function (req, res, next) {
    const input = req[propety];
    const { error } = schema.validate(input);
    const valid = error == null;
    if (valid) {
      next();
    } else {
      const { details } = error;
      const message = details.map((i) => i.message).join(",");
      throw new HttpError(message, 400);
    }
  };
};

module.exports = validateInput;
