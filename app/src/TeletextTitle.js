import React from 'react';
import './TeletextTitle.css';

const TeletextTitle = () => {
  const text = "Tekst-TV";
  return (
    <div className="teletext-title-container">
      {text.split('').map((char, index) => (
        <span key={index} className={`teletext-title-char char-${index % 2}`}>
          {char}
        </span>
      ))}
    </div>
  );
};

export default TeletextTitle;
