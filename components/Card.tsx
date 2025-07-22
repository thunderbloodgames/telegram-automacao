
import React from 'react';

interface CardProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ title, icon, children }) => {
  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl shadow-lg">
      <div className="flex items-center p-4 border-b border-slate-700">
        <div className="text-sky-400 mr-3">{icon}</div>
        <h2 className="text-lg font-bold text-slate-100">{title}</h2>
      </div>
      <div className="p-6">
        {children}
      </div>
    </div>
  );
};

export default Card;
