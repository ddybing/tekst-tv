import React from 'react';
import './CrtEffect.css';

const CrtEffect = ({ children }) => {
  return (
    <div className="tvFrame">
      <div className="crtScreen">
        <div className="screenContent">
          {children}
        </div>
        <div className="scanlines"></div>
        <div className="screenBand"></div>
        <div className="snow"></div>
      </div>
    </div>
  );
};

export default CrtEffect;
