import React from "react";
import { UseFormRegisterReturn, FieldError } from "react-hook-form";
import { FormattedMessage } from "react-intl";
import "./FormInput.scss";

interface FormInputProps {
    label?: React.ReactNode;
    type?: React.HTMLInputTypeAttribute;
    placeholder?: string;

    /** react-hook-form register */
    register?: UseFormRegisterReturn;

    /** controlled mode */
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;

    required?: boolean;
    disabled?: boolean;

    className?: string;
    inputClassName?: string;

    error?: FieldError;
}

const FormInput: React.FC<FormInputProps> = ({
    label,
    type = "text",
    placeholder,
    register,
    value,
    onChange,
    required,
    disabled,
    className = "",
    inputClassName = "",
    error,
}) => {
    return (
        <div className={`form-item ${className}`}>
            {label && (
                <label className="form-label">
                    {label}
                    {required && <span className="text-red-4 ml-4">*</span>}
                </label>
            )}

            <input
                type={type}
                placeholder={placeholder}
                disabled={disabled}
                className={`form-input ${error ? "is-error" : ""} ${inputClassName}`}
                {...register}
                value={value}
                onChange={onChange}
            />

            {error?.message && (
                <span className="form-error">
                    <FormattedMessage id={error.message} />
                </span>
            )}
        </div>
    );
};

export default FormInput;
