import { JSX, ReactNode } from "react";

type TitleLevel = 1 | 2 | 3 | 4 | 5 | 6;

interface TitleProps {
    level?: TitleLevel;
    children: ReactNode;
    className?: string;
}

const Title = ({
    level = 1,
    children,
    className = "",
}: TitleProps) => {
    const Tag = `h${level}` as keyof JSX.IntrinsicElements;

    return (
        <Tag className={`title title-${level} ${className}`.trim()}>
            {children}
        </Tag>
    );
};

export default Title;
