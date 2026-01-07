import React from "react";

interface Props extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
}

const HeaderWrapper = ({ children, className = "", style, ...rest }: Props) => {
    return (
        <header
            className={`header-wrapper bg-main-primary py-12 px-24 flex flex-row items-center ${className}`}
            style={style}
            {...rest}
        >
            {children}
        </header>
    );
};

export default HeaderWrapper;
