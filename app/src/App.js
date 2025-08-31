import React, { useState, useEffect } from 'react';
import './App.css';
import Header from './Header';
import TeletextTitle from './TeletextTitle';
import CrtEffect from './CrtEffect';
import Sidebar from './Sidebar';
import './Sidebar.css';

function App() {
  const [archive, setArchive] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [pageContent, setPageContent] = useState('');
  const [pageNumberInput, setPageNumberInput] = useState('');

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

  useEffect(() => {
    if (selectedChannel && selectedDate && archive && archive[selectedChannel] && archive[selectedChannel][selectedDate]) {
      const pages = archive[selectedChannel][selectedDate];
      if (pages.length > 0) {
        const pageFilename = pages[currentPageIndex];
        const pageUrl = `/archive/${selectedChannel}/${selectedDate}/${pageFilename}`;
        fetch(pageUrl)
          .then(response => response.text())
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
      setPageContent('');
    }
  }, [selectedChannel, selectedDate, currentPageIndex, archive]);

  const handleChannelChange = (channel) => {
    setSelectedChannel(channel);
    setSelectedDate(null);
    setCurrentPageIndex(0);
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    setCurrentPageIndex(0);
  };

  const handleBackClick = () => {
    if (selectedDate) {
      setSelectedDate(null);
    } else if (selectedChannel) {
      setSelectedChannel(null);
    }
    setCurrentPageIndex(0);
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
      setPageNumberInput('');
    } else {
      alert('Page not found!');
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
      <Sidebar
        archive={archive}
        selectedChannel={selectedChannel}
        selectedDate={selectedDate}
        onChannelChange={handleChannelChange}
        onDateChange={handleDateChange}
      />
      <div className="main-content">
        <Header />
        <TeletextTitle />
        {archive && !selectedChannel && <h2>Kanaler</h2>}
        <CrtEffect>
          {loading && <p>Loading...</p>}
          {error && <p>Error: {error.message}</p>}
          {archive && selectedChannel && (
            <div>
              <button className="teletext-button" onClick={handleBackClick}>Back</button>
              {!selectedDate ? (
                <>
                  <h2>{selectedChannel} - Dates</h2>
                  <ul>
                    {Object.keys(archive[selectedChannel]).map((date, index) => (
                      <li key={date}>
                        <div className="date-item" onClick={() => handleDateChange(date)}>
                          <span className="date-number">{100 + index}</span>
                          <span className="date-name">{date}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
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
        </CrtEffect>
      </div>
    </div>
  );
}

export default App;