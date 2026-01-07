import React from "react";

interface FooterWrapperProps {
    children: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
}

const FooterWrapper = ({ children, className = "", style }: FooterWrapperProps) => {
    return (
        <footer
            className={`footer-wrapper bg-main-primary py-12 px-24 flex flex-row ${className}`}
            style={style}
        >
            {children}
        </footer>
    );
};

export default FooterWrapper;
