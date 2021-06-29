import joi from "joi";

const emailRegEx =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

export function signInValidation(object) {
    const schema = joi.object({
        email: joi.string().trim().pattern(emailRegEx).required(),
        password: joi.string().required(),
    });
    const error = schema.validate(object).error;
    return error
        ? false
        : {
              email: object.email.trim(),
              password: object.password,
          };
}

export function signUpValidation(object) {
    const schema = joi.object({
        name: joi.string().trim().replace(/[<>]/g, "").required(),
        email: joi.string().trim().pattern(emailRegEx).required(),
        password: joi.string().required(),
    });
    const error = schema.validate(object).error;
    return error
        ? false
        : {
              name: object.name.replace(/[<>]/g, "").trim(),
              email: object.email.trim(),
              password: object.password,
          };
}

export function newTransactionValidation(object) {
    const schema = joi.object({
        description: joi.string().replace(/[<>]/g, "").trim().required(),
        value: joi.number().integer().min(1).max(999999999).required(),
        type: joi
            .string()
            .pattern(/^(expense|income)$/)
            .required(),
    });
    const error = schema.validate(object).error;
    return error
        ? false
        : {
              description: object.description.replace(/[<>]/g, "").trim(),
              value: object.value,
              type: object.type,
          };
}
