import React, { useState, useEffect } from 'react';
import './App.css';
import Header from './Header';
import TeletextTitle from './TeletextTitle'; // Import TeletextTitle

function App() {
  const [archive, setArchive] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  return (
    <div className="App">
      <Header />
      <div className="teletext-page">
        <TeletextTitle /> {/* Add the TeletextTitle component */}
        {loading && <p>Loading...</p>}
        {error && <p>Error: {error.message}</p>}
        {archive && (
          <div>
            <h2>Kanaler</h2>
            <ul>
              {Object.keys(archive).map((channel, index) => (
                <li key={channel}>
                  <div className="channel-item">
                    <span className="channel-number">{100 + index}</span>
                    <span className="channel-name">{channel}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
