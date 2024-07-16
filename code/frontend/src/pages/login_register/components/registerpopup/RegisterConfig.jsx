
export const formFields = {
  username: {
    margin: "normal",
    required: true,
    fullWidth: true,
    id: "username",
    name: "username",
    autoComplete: "username",
    autoFocus: true,
    placeholder: "Username",
  },
  email: {
    margin: "normal",
    required: true,
    fullWidth: true,
    id: "email",
    name: "email",
    type: "email",
    autoComplete: "email",
    placeholder: "Email Address",
  },
  password: {
    margin: "normal",
    required: true,
    fullWidth: true,
    name: "password",
    type: "password",
    id: "password",
    autoComplete: "current-password",
    placeholder: "Password",
  },
  truename: {
    margin: "normal",
    required: true,
    fullWidth: true,
    id: "truename",
    name: "truename",
    autoComplete: "truename",
    placeholder: "Nome",
  },
  birthdate: {
    margin: "normal",
    required: true,
    fullWidth: true,
    id: "birthdate",
    name: "birthdate",
    autoComplete: "birthdate",
    placeholder: "Data di nascita",

  },
  confirmPassword: {
    margin: "normal",
    required: true,
    fullWidth: true,
    name: "confirmPassword",
    type: "password",
    id: "confirmPassword",
    autoComplete: "current-password",
    placeholder: "Conferma Password",
  },

};

export const formTitle = {
  login: "Login",
  register: "Registrati",
}
