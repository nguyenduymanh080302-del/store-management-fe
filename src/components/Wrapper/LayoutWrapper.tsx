import React from "react";

interface Props {
    children: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
}

const LayoutWrapper = ({ children, className = "", style }: Props) => {
    return (
        <div
            className={`layout-wrapper min-h-screen flex flex-col ${className}`}
            style={style}
        >
            {children}
        </div>
    );
};

export default LayoutWrapper;
