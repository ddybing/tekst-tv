import React, { useState, useEffect, useRef, useCallback } from 'react';
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

  const [numberBuffer, setNumberBuffer] = useState('');

  const pageContentRef = useRef(null);

  const handleGoToPage = useCallback((targetPageNumber) => {
    const pages = archive[selectedChannel][selectedDate];
    if (!pages) return;
    if (isNaN(targetPageNumber)) return;
    const targetPageIndex = pages.findIndex(page => parseInt(page.replace('.html', ''), 10) === targetPageNumber);
    if (targetPageIndex !== -1) {
      setCurrentPageIndex(targetPageIndex);
      setPageNumberInput(targetPageNumber.toString());
    } else {
      // Page not found, do nothing (stay on current page)
    }
  }, [archive, selectedChannel, selectedDate]);

  useEffect(() => {
    if (!selectedChannel || !selectedDate) {
      return; // Do not attach listener if channel or date not selected
    }

    const handleKeyDown = (event) => {
      // Ignore key presses if an input field is focused
      if (event.target.tagName === 'INPUT' || event.target.tagName === 'SELECT' || event.target.tagName === 'TEXTAREA') {
        return;
      }

      const isNumber = event.key >= '0' && event.key <= '9';

      if (event.key === 'Enter') {
        event.preventDefault(); // Prevent default Enter behavior
        if (numberBuffer.length === 3) {
          const pageNumber = parseInt(numberBuffer, 10);
          handleGoToPage(pageNumber);
        }
        setNumberBuffer(''); // Always clear buffer on Enter
      } else if (isNumber) {
        event.preventDefault(); // Prevent default number key behavior
        setNumberBuffer((prevBuffer) => {
          let newBuffer = prevBuffer + event.key;
          if (newBuffer.length === 3) {
            const pageNumber = parseInt(newBuffer, 10);
            handleGoToPage(pageNumber);
            return ''; // Clear buffer after 3 digits
          } else if (newBuffer.length > 3) {
            newBuffer = newBuffer.substring(newBuffer.length - 3);
          }
          return newBuffer;
        });
      } else {
        // Clear buffer if a non-numeric key is pressed
        setNumberBuffer('');
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleGoToPage, selectedChannel, selectedDate]);

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
        // Convert selectedDate from YYYY-MM-DD to DD-MM-YYYY for folder name
        const [year, month, day] = selectedDate.split('-');
        const folderDate = `${day}-${month}-${year}`;

        const pageUrl = `/archive/${selectedChannel}/${folderDate}/${pageFilename}`;
        fetch(pageUrl)
          .then(response => response.text())
          .then(html => {
            setPageContent(html);
            const pageNumber = parseInt(pageFilename.replace('.html', ''), 10);
            setPageNumberInput(pageNumber.toString());
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
    setPageNumberInput(''); // Clear page number input
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    setCurrentPageIndex(0);
    setPageNumberInput(''); // Clear page number input
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
        pageNumberInput={pageNumberInput}
        onPageNumberChange={handlePageNumberChange}
        onGoToPage={handleGoToPage}
      />
      <div className="main-content">
        <Header numberBuffer={numberBuffer} currentPageIndex={currentPageIndex} selectedChannel={selectedChannel} selectedDate={selectedDate} archive={archive} />
        <TeletextTitle />
        <CrtEffect crtEffectsEnabled={crtEffectsEnabled} pageContent={pageContent}>
          {loading && <p>Loading...</p>}
          {error && <p>Error: {error.message}</p>}
          {pageContent && (
            <div dangerouslySetInnerHTML={{ __html: pageContent }} />
          )}
        </CrtEffect>
      </div>
    </div>
  );
}

export default App;