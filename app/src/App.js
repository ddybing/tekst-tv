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
  const [crtEffectsEnabled, setCrtEffectsEnabled] = useState(true);

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

  const handleCrtEffectToggle = () => {
    setCrtEffectsEnabled(!crtEffectsEnabled);
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
        crtEffectsEnabled={crtEffectsEnabled}
        onCrtEffectToggle={handleCrtEffectToggle}
      />
      <div className="main-content">
        <Header />
        <TeletextTitle />
        <CrtEffect crtEffectsEnabled={crtEffectsEnabled}>
          {loading && <p>Loading...</p>}
          {error && <p>Error: {error.message}</p>}
          {archive && selectedChannel && (
            <div>
              
              {!selectedDate ? (
                null
              ) : (
                <>
                  
                  
                  
                  
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