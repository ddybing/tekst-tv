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
  const [subPageIndex, setSubPageIndex] = useState(0);
  const [subPages, setSubPages] = useState([]);
  const [pageContent, setPageContent] = useState('');
  const [pageNumberInput, setPageNumberInput] = useState('');
  const [crtEffectsEnabled, setCrtEffectsEnabled] = useState(true);
  const [carouselEnabled, setCarouselEnabled] = useState(true);

  const [numberBuffer, setNumberBuffer] = useState('');

  const pageContentContainerRef = useRef(null);
  const carouselTimeoutRef = useRef(null);

  const handleGoToPage = useCallback((targetPageNumber) => {
    if (isNaN(targetPageNumber)) return;

    const targetPage = targetPageNumber.toString();
    setPageNumberInput(targetPage);

    const pages = archive[selectedChannel][selectedDate];
    if (!pages) return;

    const pagesWithSameBase = pages.filter(page => page.startsWith(targetPage + '.') || page.startsWith(targetPage + '-'));

    if (pagesWithSameBase.length > 0) {
      const firstSubPageIndex = pages.indexOf(pagesWithSameBase[0]);
      setCurrentPageIndex(firstSubPageIndex);
      setSubPageIndex(0);
      setSubPages(pagesWithSameBase);
    } else {
      const targetPageIndex = pages.findIndex(page => parseInt(page.replace('.html', ''), 10) === parseInt(targetPageNumber, 10));
      if (targetPageIndex !== -1) {
        setCurrentPageIndex(targetPageIndex);
        setSubPageIndex(0);
        setSubPages([]);
      }
    }
  }, [archive, selectedChannel, selectedDate]);

  useEffect(() => {
    if (subPages.length > 1 && carouselEnabled) {
      carouselTimeoutRef.current = setInterval(() => {
        setSubPageIndex(prevSubPageIndex => (prevSubPageIndex + 1) % subPages.length);
      }, 10000); // 10 seconds
    }
    return () => {
      if (carouselTimeoutRef.current) {
        clearInterval(carouselTimeoutRef.current);
      }
    };
  }, [subPages, carouselEnabled]);

  useEffect(() => {
    if (!selectedChannel || !selectedDate) {
      return;
    }

    const handleKeyDown = (event) => {
      if (event.target.tagName === 'INPUT' || event.target.tagName === 'SELECT' || event.target.tagName === 'TEXTAREA') {
        return;
      }

      const isNumber = event.key >= '0' && event.key <= '9';

      if (event.key === 'Enter') {
        event.preventDefault();
        if (numberBuffer.length === 3) {
          const pageNumber = parseInt(numberBuffer, 10);
          handleGoToPage(pageNumber);
        }
        setNumberBuffer('');
      } else if (isNumber) {
        event.preventDefault();
        setNumberBuffer((prevBuffer) => {
          let newBuffer = prevBuffer + event.key;
          if (newBuffer.length === 3) {
            const pageNumber = parseInt(newBuffer, 10);
            handleGoToPage(pageNumber);
            return '';
          } else if (newBuffer.length > 3) {
            newBuffer = newBuffer.substring(newBuffer.length - 3);
          }
          return newBuffer;
        });
      } else {
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
        let pageFilename;
        if (subPages.length > 0) {
          pageFilename = subPages[subPageIndex];
        } else {
          pageFilename = pages[currentPageIndex];
        }

        const pageUrl = `/archive/${selectedChannel}/${selectedDate}/${pageFilename}`;
        fetch(pageUrl)
          .then(response => response.text())
          .then(html => {
            setPageContent(html);
            const pageNumber = parseInt(pageFilename.replace('.html', '').split('-')[0], 10);
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
  }, [selectedChannel, selectedDate, currentPageIndex, subPageIndex, subPages, archive]);

  useEffect(() => {
    const container = pageContentContainerRef.current;
    if (!container) return;

    const handleClick = (event) => {
        if (event.target.tagName === 'A') {
            event.preventDefault();

            const href = event.target.getAttribute('href');
            if (href) {
                const pageNumber = parseInt(href.replace('.html', ''), 10);
                if (!isNaN(pageNumber)) {
                    handleGoToPage(pageNumber);
                }
            }
        }
    };

    container.addEventListener('click', handleClick);

    return () => {
        container.removeEventListener('click', handleClick);
    };
  }, [pageContent, handleGoToPage]);

  const handleChannelChange = (channel) => {
    setSelectedChannel(channel);
    setSelectedDate(null);
    setCurrentPageIndex(0);
    setSubPageIndex(0);
    setSubPages([]);
    setPageNumberInput('');
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    setCurrentPageIndex(0);
    setSubPageIndex(0);
    setSubPages([]);
    setPageNumberInput('');
  };

  const handleCrtEffectToggle = () => {
    setCrtEffectsEnabled(!crtEffectsEnabled);
  };

  const handleCarouselToggle = () => {
    setCarouselEnabled(!carouselEnabled);
  };

  const handleBackClick = () => {
    if (selectedDate) {
      setSelectedDate(null);
    } else if (selectedChannel) {
      setSelectedChannel(null);
    }
    setCurrentPageIndex(0);
    setSubPageIndex(0);
    setSubPages([]);
  };

  const handlePageNumberChange = (event) => {
    setPageNumberInput(event.target.value);
  };

  const handlePageNavigation = (direction) => {
    const pages = archive[selectedChannel][selectedDate];
    if (!pages) return;

    const currentPageFilename = pages[currentPageIndex];
    const currentPageBase = currentPageFilename.split('-')[0];

    let newIndex = currentPageIndex;
    if (direction === 'next') {
      newIndex = (currentPageIndex + 1) % pages.length;
      while(pages[newIndex].split('-')[0] === currentPageBase) {
        newIndex = (newIndex + 1) % pages.length;
      }
    } else if (direction === 'prev') {
      newIndex = (currentPageIndex - 1 + pages.length) % pages.length;
      const newPageBase = pages[newIndex].split('-')[0];
      while(pages[newIndex].split('-')[0] === newPageBase) {
        newIndex = (newIndex - 1 + pages.length) % pages.length;
      }
      newIndex = (newIndex + 1) % pages.length;
    }
    
    const newPageFilename = pages[newIndex];
    const newPageBase = newPageFilename.split('-')[0].split('.')[0];
    handleGoToPage(parseInt(newPageBase, 10));
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
        carouselEnabled={carouselEnabled}
        onCarouselToggle={handleCarouselToggle}
        pageNumberInput={pageNumberInput}
        onPageNumberChange={handlePageNumberChange}
        onGoToPage={handleGoToPage}
      />
      <div className="main-content">
        <Header numberBuffer={numberBuffer} currentPageIndex={currentPageIndex} subPageIndex={subPageIndex} subPages={subPages} selectedChannel={selectedChannel} selectedDate={selectedDate} archive={archive} />
        <TeletextTitle />
        <CrtEffect crtEffectsEnabled={crtEffectsEnabled} pageContent={pageContent}>
          {loading && <p>Loading...</p>}
          {error && <p>Error: {error.message}</p>}
          {pageContent && (
            <div ref={pageContentContainerRef} dangerouslySetInnerHTML={{ __html: pageContent }} />
          )}
        </CrtEffect>
      </div>
    </div>
  );
}

export default App;