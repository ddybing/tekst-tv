import React from 'react';

const Sidebar = ({ archive, selectedChannel, selectedDate, selectedTime, onChannelChange, onDateChange, onTimeChange, crtEffectsEnabled, onCrtEffectToggle, carouselEnabled, onCarouselToggle, pageNumberInput, onPageNumberChange, onGoToPage }) => {
  const channels = archive ? Object.keys(archive) : [];
  const dates = selectedChannel && archive[selectedChannel] ? Object.keys(archive[selectedChannel]) : [];
  const times = selectedDate && dates.length > 0 && archive[selectedChannel][selectedDate] && !Array.isArray(archive[selectedChannel][selectedDate]) ? Object.keys(archive[selectedChannel][selectedDate]) : [];

  const handleChannelChange = (event) => {
    onChannelChange(event.target.value);
  };

  const handleDateChange = (event) => {
    onDateChange(event.target.value);
  };

  const handleTimeChange = (event) => {
    onTimeChange(event.target.value);
  };

  const handleGoToPageClick = () => {
    onGoToPage(pageNumberInput);
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      onGoToPage(pageNumberInput);
    }
  };


  return (
    <div className="sidebar">
      <div className="dropdown-container">
        <label htmlFor="channel-select">Channel</label>
        <select id="channel-select" value={selectedChannel || ''} onChange={handleChannelChange}>
          <option value="" disabled>Select a channel</option>
          {channels.map(channel => (
            <option key={channel} value={channel}>{channel}</option>
          ))}
        </select>
      </div>
      <div className="dropdown-container">
        <label htmlFor="date-select">Date</label>
        <select id="date-select" value={selectedDate || ''} onChange={handleDateChange} disabled={!selectedChannel}>
          <option value="" disabled>Select a date</option>
          {dates.map(date => (
            <option key={date} value={date}>{date}</option>
          ))}
        </select>
      </div>
      {times.length > 1 && (
        <div className="dropdown-container">
          <label htmlFor="time-select">Time</label>
          <select id="time-select" value={selectedTime || ''} onChange={handleTimeChange} disabled={!selectedDate}>
            <option value="" disabled>Select a time</option>
            {times.map(time => (
              <option key={time} value={time}>{time}</option>
            ))}
          </select>
        </div>
      )}
      <div className="page-jump-container">
        <label htmlFor="page-number-input">Page</label>
        <input
          type="text" // Changed to text to allow underscores
          id="page-number-input"
          value={pageNumberInput}
          onChange={onPageNumberChange}
          onKeyPress={handleKeyPress}
          placeholder="Page number"
          disabled={!selectedDate}
          autoComplete="off"
        />
        <button onClick={handleGoToPageClick} disabled={!selectedDate}>Go</button>
      </div>
      <div className="checkbox-container">
        <label htmlFor="crt-effect-toggle">CRT Effect</label>
        <input
          type="checkbox"
          id="crt-effect-toggle"
          checked={crtEffectsEnabled}
          onChange={onCrtEffectToggle}
        />
      </div>
      <div className="checkbox-container">
        <label htmlFor="carousel-toggle" title="Toggle automatic subpage cycling">Toggle subpages</label>
        <input
          type="checkbox"
          id="carousel-toggle"
          checked={carouselEnabled}
          onChange={onCarouselToggle}
          title="Veksle mellom undersider automatisk"
        />
      </div>
      <div className="description-container">
        <p>Select channel and date to view teletext. Use the numbers on your keyboard to type in the page number, e.g., 103 for page 103.</p>
      </div>
    </div>
  );
};

export default Sidebar;