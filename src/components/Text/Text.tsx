import { JSX, ReactNode } from "react";

type TextAs = "p" | "span" | "small" | "div";

interface TextProps {
    as?: TextAs;
    children: ReactNode;
    className?: string;
}

const Text = ({
    as = "p",
    children,
    className = "",
}: TextProps) => {
    const Tag = as as keyof JSX.IntrinsicElements;

    return (
        <Tag className={`text ${className}`.trim()}>
            {children}
        </Tag>
    );
};

export default Text;
