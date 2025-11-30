const validationRules = {
  username: {
    test: (value) =>
      /^[A-Z0-9._%+-]+$/i.test(value),
    message: "Username must be a valid",
  },
  email: {
    test: (value) => /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(value),
    message: "Email is invalid",
  },
  password: {
    test: (value) => value.length >= 4,
    message: "Password must be at least 4 characters long",
  }
};

export const validateField = (id, value, inputErrors, password = "") => {
  const errors = { ...inputErrors };

  if (validationRules[id]) {
    if (!validationRules[id].test(value, password)) {
      errors[id] = validationRules[id].message;
    } else {
      delete errors[id];
    }
  }

  return errors;
};

export const hasNoFieldErrors = (inputErrors) => {
  return Object.keys(inputErrors).length === 0;
};

export const validateAllFields = (inputValues, inputErrors) => {
  let errors = { ...inputErrors };

  Object.keys(inputValues).forEach((key) => {
    const value = inputValues[key];
    errors = { ...errors, ...validateField(key, value, errors) };
  });

  return errors;
};
