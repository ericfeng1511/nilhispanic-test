// src/components/FactCard.tsx
import React from 'react';

interface FactCardProps {
  title: string;
  body: React.ReactNode;
}

const FactCard: React.FC<FactCardProps> = ({ title, body }) => {
  return (
    <div className="flex flex-col bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:-translate-y-2 h-full">
      <h3 className="text-xl font-bold text-white bg-nil-orange p-4">{title}</h3>
  <div className="p-6">
        <p className="text-nil-dark-gray">{body}</p>
      </div>
    </div>
  );
};

export default FactCard;
