import React, { useState, useEffect } from 'react';
import './Header.css';

const Header = () => {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  const date = now.toLocaleDateString('en-GB').replace(/\//g, '-');
  const time = now.toTimeString().substring(0, 8); // Show seconds

  return (
    <div className="teletext-header">
      <span className="channel">P100 Teletext</span>
      <span className="date">{date}</span>
      <span className="time">{time}</span>
    </div>
  );
};

export default Header;
