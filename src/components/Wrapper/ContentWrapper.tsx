import React from "react";

interface ContentWrapperProps {
    children: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
}

const ContentWrapper = ({ children, className = "", style }: ContentWrapperProps) => {
    return (
        <main
            className={`content-wrapper bg-neutral-0 flex-1 ${className}`}
            style={style}
        >
            {children}
        </main>
    );
};

export default ContentWrapper;
