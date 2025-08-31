import React, { useState, useEffect } from 'react';
import './App.css';
import Header from './Header';
import TeletextTitle from './TeletextTitle';
import SimpleSelector from './SimpleSelector';

function App() {
  const [archive, setArchive] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [viewMode, setViewMode] = useState('teletext');
  const [currentPageIndex, setCurrentPageIndex] = useState(0); // Index of the current page in the list
  const [pageContent, setPageContent] = useState(''); // Content of the current page
  const [pageNumberInput, setPageNumberInput] = useState(''); // New state for page number input

  useEffect(() => {
    fetch('/index.json')
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        setArchive(data);
        setLoading(false);
      })
      .catch(error => {
        setError(error);
        setLoading(false);
      });
  }, []);

  // Effect to fetch page content when channel, date, or page index changes
  useEffect(() => {
    if (selectedChannel && selectedDate && archive && archive[selectedChannel] && archive[selectedChannel][selectedDate]) {
      const pages = archive[selectedChannel][selectedDate];
      if (pages.length > 0) {
        const pageFilename = pages[currentPageIndex];
        const pageUrl = `/archive/${selectedChannel}/${selectedDate}/${pageFilename}`;
        fetch(pageUrl)
          .then(response => {
            if (!response.ok) {
              throw new Error('Network response was not ok');
            }
            return response.text(); // Get raw HTML content
          })
          .then(html => {
            setPageContent(html);
          })
          .catch(err => {
            console.error("Failed to fetch page content:", err);
            setPageContent(`<p>Error loading page: ${err.message}</p>`);
          });
      } else {
        setPageContent('<p>No pages available for this date.</p>');
      }
    } else {
      setPageContent(''); // Clear content if no selection
    }
  }, [selectedChannel, selectedDate, currentPageIndex, archive]);


  const handleChannelClick = (channel) => {
    setSelectedChannel(channel);
    setSelectedDate(null);
    setCurrentPageIndex(0); // Reset page index when channel changes
  };

  const handleDateClick = (date) => {
    setSelectedDate(date);
    setCurrentPageIndex(0); // Reset page index when date changes
  };

  const handleBackClick = () => {
    if (selectedDate) {
      setSelectedDate(null);
      setCurrentPageIndex(0); // Reset page index
    } else if (selectedChannel) {
      setSelectedChannel(null);
      setCurrentPageIndex(0); // Reset page index
    }
  };

  const handleSelectPageFromSimple = (channel, date) => {
    setSelectedChannel(channel);
    setSelectedDate(date);
    setCurrentPageIndex(0); // Reset page index
    setViewMode('teletext');
  };

  const handlePageNumberChange = (event) => {
    setPageNumberInput(event.target.value);
  };

  const handleGoToPage = () => {
    const pages = archive[selectedChannel][selectedDate];
    if (!pages) return;

    const targetPageNumber = parseInt(pageNumberInput, 10);
    if (isNaN(targetPageNumber)) return;

    const targetPageIndex = pages.findIndex(page => parseInt(page.replace('.html', ''), 10) === targetPageNumber);

    if (targetPageIndex !== -1) {
      setCurrentPageIndex(targetPageIndex);
      setPageNumberInput(''); // Clear input after jump
    } else {
      alert('Page not found!'); // Simple feedback for now
    }
  };

  const handlePageNavigation = (direction) => {
    const pages = archive[selectedChannel][selectedDate];
    if (!pages) return;

    let newIndex = currentPageIndex;
    if (direction === 'next') {
      newIndex = (currentPageIndex + 1) % pages.length;
    } else if (direction === 'prev') {
      newIndex = (currentPageIndex - 1 + pages.length) % pages.length;
    }
    setCurrentPageIndex(newIndex);
  };

  return (
    <div className="App">
      <Header />
      <div className="teletext-page">
        <button className="teletext-button" onClick={() => setViewMode(viewMode === 'teletext' ? 'simple' : 'teletext')}>
          Switch to {viewMode === 'teletext' ? 'Simple' : 'Teletext'} View
        </button>

        {viewMode === 'teletext' ? (
          <>
            <TeletextTitle />
            {loading && <p>Loading...</p>}
            {error && <p>Error: {error.message}</p>}
            {archive && (
              <div>
                {selectedChannel && (
                  <button className="teletext-button" onClick={handleBackClick}>Back</button>
                )}

                {!selectedChannel ? ( // Show channels
                  <>
                    <h2>Kanaler</h2>
                    <ul>
                      {Object.keys(archive).map((channel, index) => (
                        <li key={channel}>
                          <div className="channel-item" onClick={() => handleChannelClick(channel)}>
                            <span className="channel-number">{100 + index}</span>
                            <span className="channel-name">{channel}</span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </>
                ) : !selectedDate ? ( // Show dates for selected channel
                  <>
                    <h2>{selectedChannel} - Dates</h2>
                    <ul>
                      {Object.keys(archive[selectedChannel]).length > 0 ? (
                        Object.keys(archive[selectedChannel]).map((date, index) => (
                          <li key={date}>
                            <div className="date-item" onClick={() => handleDateClick(date)}>
                              <span className="date-number">{100 + index}</span>
                              <span className="date-name">{date}</span>
                            </div>
                          </li>
                        ))
                      ) : <p>No dates available for this channel.</p>}
                    </ul>
                  </>
                ) : ( // Show page content
                  <>
                    <h2>{selectedChannel} - {selectedDate} - Page {archive[selectedChannel][selectedDate][currentPageIndex].replace('.html', '')}</h2>
                    <div className="page-content" dangerouslySetInnerHTML={{ __html: pageContent }} />
                    <div className="page-navigation">
                      <button className="teletext-button" onClick={() => handlePageNavigation('prev')}>Prev</button>
                      <button className="teletext-button" onClick={() => handlePageNavigation('next')}>Next</button>
                    </div>
                    <div className="page-jump">
                      <input
                        type="number"
                        className="teletext-input"
                        value={pageNumberInput}
                        onChange={handlePageNumberChange}
                        placeholder="Page No."
                      />
                      <button className="teletext-button" onClick={handleGoToPage}>Go</button>
                    </div>
                  </>
                )}
              </div>
            )}
          </>
        ) : (
          <>
            <TeletextTitle /> {/* Add the TeletextTitle component */}
            <SimpleSelector archive={archive} onSelectPage={handleSelectPageFromSimple} />
          </>
        )}
      </div>
    </div>
  );
}

export default App;
