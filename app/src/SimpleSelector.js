import React, { useState, useEffect } from 'react';

const SimpleSelector = ({ archive, onSelectPage }) => {
  const [selectedChannel, setSelectedChannel] = useState('');
  const [selectedDate, setSelectedDate] = useState('');

  useEffect(() => {
    // Set default selected channel if archive is loaded
    if (archive && Object.keys(archive).length > 0 && !selectedChannel) {
      setSelectedChannel(Object.keys(archive)[0]);
    }
  }, [archive, selectedChannel]);

  useEffect(() => {
    // Set default selected date if channel changes and dates are available
    if (selectedChannel && archive[selectedChannel] && Object.keys(archive[selectedChannel]).length > 0 && !selectedDate) {
      setSelectedDate(Object.keys(archive[selectedChannel])[0]);
    } else if (selectedChannel && archive[selectedChannel] && Object.keys(archive[selectedChannel]).length === 0) {
      setSelectedDate(''); // Clear date if no dates for channel
    }
  }, [selectedChannel, archive, selectedDate]);

  const handleChannelChange = (event) => {
    setSelectedChannel(event.target.value);
    setSelectedDate(''); // Reset date when channel changes
  };

  const handleDateChange = (event) => {
    setSelectedDate(event.target.value);
  };

  const handleViewPage = () => {
    if (selectedChannel && selectedDate) {
      onSelectPage(selectedChannel, selectedDate);
    }
  };

  return (
    <div>
      <h2>Simple Selector</h2>
      <div>
        <label htmlFor="channel-select">Select Channel:</label>
        <select id="channel-select" value={selectedChannel} onChange={handleChannelChange}>
          <option value="">--Please choose a channel--</option>
          {archive && Object.keys(archive).map(channel => (
            <option key={channel} value={channel}>{channel}</option>
          ))}
        </select>
      </div>

      {selectedChannel && archive[selectedChannel] && (
        <div>
          <label htmlFor="date-select">Select Date:</label>
          <select id="date-select" value={selectedDate} onChange={handleDateChange}>
            <option value="">--Please choose a a date--</option>
            {Object.keys(archive[selectedChannel]).map(date => (
              <option key={date} value={date}>{date}</option>
            ))}
          </select>
        </div>
      )}

      <button onClick={handleViewPage} disabled={!selectedChannel || !selectedDate}>
        View Page
      </button>
    </div>
  );
};

export default SimpleSelector;
