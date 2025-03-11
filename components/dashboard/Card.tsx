import React from "react";

interface CardProps {
  title: string;
  value: string;
  color: string;
  icon: React.ReactNode;
}

const Card = ({ title, value, color, icon }: CardProps) => {
  return (
    <div
      className={`p-6 rounded-lg shadow-md text-white ${color} transition-transform transform hover:scale-105 hover:shadow-lg`}
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">{title}</h2>
          <p className="text-2xl font-bold">{value}</p>
        </div>
        <div className="text-3xl">{icon}</div>
      </div>
    </div>
  );
};

export default Card;