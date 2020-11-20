import { UserInput } from "src/resolvers/types";

export const validateRegister = ({ phone, email, birthDate }: UserInput) => {
  if (!phone) return;
  if (Number(birthDate.substr(0, 4)) >= 2017) {
    return [{ field: "birthDate", message: "incorrect date" }];
  }

  if (String(phone).length !== 7 && String(phone).length !== 10) {
    return [{ field: "phone", message: "incorrect phone" }];
  }

  const regex = /^[-\w.%+]{1,64}@(?:[A-Z0-9-]{1,63}\.){1,125}[A-Z]{2,63}$/i;
  if (!regex.test(email)) {
    return [{ field: "email", message: "incorrect email" }];
  }

  return null;
};
