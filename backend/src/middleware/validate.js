/**
 * Express middleware to validate request payload against a Zod schema.
 */
export const validate = (schema, source = 'body') => {
  return async (req, res, next) => {
    try {
      const dataToValidate = req[source];
      const validated = await schema.parseAsync(dataToValidate);
      req[source] = validated;
      next();
    } catch (error) {
      next(error);
    }
  };
};
