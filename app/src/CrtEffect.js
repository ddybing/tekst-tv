import React from 'react';
import './CrtEffect.css';

const CrtEffect = ({ children, crtEffectsEnabled, pageContent }) => {
  return (
    <div className="tvFrame">
      <div className="crtScreen">
        <div className="screenContent">
          {children}
        </div>
        {crtEffectsEnabled && (
          <>
            <div className="scanlines"></div>
            <div className={`screenBand ${pageContent ? 'hide-band' : ''}`}></div>
          </>
        )}
        <div className={`snow ${pageContent ? 'hide-snow' : ''}`}></div>
      </div>
    </div>
  );
};

export default CrtEffect;
