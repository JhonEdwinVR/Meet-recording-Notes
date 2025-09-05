
import React from 'react';

const Spinner: React.FC = () => {
  return (
    <div
      className="w-12 h-12 rounded-full animate-spin
      border-4 border-solid border-cyan-400 border-t-transparent"
    ></div>
  );
};

export default Spinner;
