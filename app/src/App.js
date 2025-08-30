import React, { useState, useEffect } from 'react';
import './App.css';

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
      <header className="App-header">
        <h1>Teletext Archive</h1>
        {loading && <p>Loading...</p>}
        {error && <p>Error: {error.message}</p>}
        {archive && (
          <div>
            <h2>Channels</h2>
            <ul>
              {Object.keys(archive).map(channel => (
                <li key={channel}>
                  <h3>{channel}</h3>
                  {Object.keys(archive[channel]).length > 0 ? (
                    <ul>
                      {Object.keys(archive[channel]).map(date => (
                        <li key={date}>
                          <h4>{date}</h4>
                          <ul>
                            {archive[channel][date].map(page => (
                              <li key={page}>{page}</li>
                            ))}
                          </ul>
                        </li>
                      ))}
                    </ul>
                  ) : <p>No dates available for this channel.</p>}
                </li>
              ))}
            </ul>
          </div>
        )}
      </header>
    </div>
  );
}

export default App;
