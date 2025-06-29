import React from 'react';

interface Props {
  title: string;
  value: number | string;
  color?: string;
}

const StatCard = ({ title, value, color = 'bg-blue-600' }: Props) => {
  return (
    <div className={`rounded-xl p-4 text-white ${color}`}>
      <h4 className="text-md font-medium">{title}</h4>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
};

export default StatCard;
