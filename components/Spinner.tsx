
import React from 'react';

const Spinner: React.FC = () => {
  return (
    <div
      className="w-5 h-5 rounded-full animate-spin
      border-2 border-solid border-slate-200 border-t-transparent"
      role="status"
      aria-label="Loading..."
    ></div>
  );
};

export default Spinner;