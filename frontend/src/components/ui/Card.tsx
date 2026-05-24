import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = "",
  onClick,
  hoverable = false,
}) => {
  return (
    <div
      onClick={onClick}
      className={`
        glass rounded-2xl p-6 border border-white/5 
        ${hoverable ? "cursor-pointer hover:border-white/10 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1" : ""}
        ${className}
      `}
    >
      {children}
    </div>
  );
};
