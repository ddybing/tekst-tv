import React, { useState, useEffect } from 'react';
import './Header.css';

const Header = ({ numberBuffer, currentPageIndex, selectedChannel, selectedDate, archive }) => {
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

  // Format the numberBuffer for display or show current page
  let pageDisplay = "P100"; // Default display
  if (numberBuffer.length > 0) {
    pageDisplay = numberBuffer;
    for (let i = numberBuffer.length; i < 3; i++) {
      pageDisplay += '_';
    }
  } else {
    // Display current page number if available
    if (selectedChannel && selectedDate && archive && archive[selectedChannel] && archive[selectedChannel][selectedDate]) {
      const pages = archive[selectedChannel][selectedDate];
      if (pages.length > 0) {
        const pageFilename = pages[currentPageIndex];
        pageDisplay = pageFilename.replace('.html', ''); // Extract page number from filename
      }
    }
  }

  return (
    <div className="teletext-header">
      <span className="channel">{pageDisplay} Teletext</span>
      <span className="date">{date}</span>
      <span className="time">{time}</span>
    </div>
  );
};

export default Header;
