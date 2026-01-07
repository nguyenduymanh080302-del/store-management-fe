import * as yup from "yup";

/* ===== Login ===== */
export const loginSchema = yup.object({
    username: yup
        .string()
        .required("message.account.name.is-required")
        .min(2, "message.account.username.min-length-is-2")
        .max(32, "message.account.username.max-length-is-32"),

    password: yup
        .string()
        .required("message.account.name.is-required")
        .min(6, "message.account.password.min-length-is-6")
        .max(32, "message.account.password.max-length-is-32"),
});

export const signupSchema = yup.object({
    name: yup
        .string()
        .required("message.account.name.is-required")
        .min(2, "message.account.name.min-length-is-2")
        .max(64, "message.account.name.max-length-is-64"),

    username: yup
        .string()
        .required("message.account.name.is-required")
        .min(2, "message.account.username.min-length-is-2")
        .max(32, "message.account.username.max-length-is-32"),

    password: yup
        .string()
        .required("message.account.name.is-required")
        .min(6, "message.account.password.min-length-is-6")
        .max(32, "message.account.password.max-length-is-32"),

    roleId: yup
        .number()
        .required("message.account.name.is-required")
        .typeError("message.account.role.must-is-number"),

    email: yup
        .string()
        .email("message.account.email.wrong-format")
        .optional(),

    phone: yup
        .string()
        .matches(/^[0-9]{9,11}$/, "message.account.phone.invalid")
        .optional(),

    address: yup
        .string()
        .max(64, "message.account.address.max-length-is-64")
        .optional(),
});

export type SignupSchema = yup.InferType<typeof signupSchema>;
export type LoginSchema = yup.InferType<typeof loginSchema>;
