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

export function integerValidation(object) {
    const schema = joi.object({
        id: joi.number().integer().min(1).required(),
    });
    const error = schema.validate(object).error;
    return error ? false : parseInt(object.id);
}

export function cartValidation(object) {
    const schema = joi.object({
        userId: joi.number().integer().min(1).required(),
        productId: joi.number().integer().min(1).required(),
        quantity: joi.number().integer().min(1).required(),
    });
    const error = schema.validate(object).error;
    return error
        ? false
        : {
              userId: object.userId,
              productId: object.productId,
              quantity: object.quantity,
          };
}

export function cartUpdateValidation(object) {
    const schema = joi.object({
        productId: joi.number().integer().min(1).required(),
        quantity: joi.number().integer().min(1).required(),
    });
    const error = schema.validate(object).error;
    return error
        ? false
        : {
              productId: object.productId,
              quantity: object.quantity,
          };
}

export function checkoutValidation(object) {
    const today = new Date();
    const currentMonth = String(today.getMonth()).padStart(2, "0");
    const currentYear = String(today.getFullYear()).substring(2);
    const schema = joi.object({
        name: joi.string().trim().required(),
        address: joi.string().trim().required(),
        creditCard: joi
            .string()
            .pattern(/^\d{16}$/)
            .required(),
        expiration: joi
            .string()
            .pattern(/^\d{2}\/\d{2}$/)
            .required(),
        cvv: joi
            .string()
            .pattern(/^\d{3}$/)
            .required(),
        totalPrice: joi.number().integer().min(1).max(2000000000).required(),
    });
    const error = schema.validate(object).error;
    if (error) {
        return false;
    }
    if (parseInt(object.expiration.substring(3)) < currentYear) {
        return false;
    }
    if (
        parseInt(object.expiration.substring(3)) === currentYear &&
        parseInt(object.expiration.substring(0, 2)) < currentMonth
    ) {
        return false;
    }
    return {
        name: object.name.trim(),
        address: object.address.trim(),
        creditCard: object.creditCard,
        expiration: object.expiration,
        cvv: object.cvv,
        totalPrice: parseInt(object.totalPrice),
    };
}
