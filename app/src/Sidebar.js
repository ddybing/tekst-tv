import React from 'react';

const Sidebar = ({ archive, selectedChannel, selectedDate, onChannelChange, onDateChange, crtEffectsEnabled, onCrtEffectToggle }) => {
  const channels = archive ? Object.keys(archive) : [];

  const handleChannelChange = (event) => {
    onChannelChange(event.target.value);
  };

  const handleDateChange = (event) => {
    onDateChange(event.target.value);
  };

  return (
    <div className="sidebar">
      <div className="dropdown-container">
        <label htmlFor="channel-select">Kanal</label>
        <select id="channel-select" value={selectedChannel || ''} onChange={handleChannelChange}>
          <option value="" disabled>Velg en kanal</option>
          {channels.map(channel => (
            <option key={channel} value={channel}>{channel}</option>
          ))}
        </select>
      </div>
      <div className="dropdown-container">
        <label htmlFor="date-select">Dato</label>
        <select id="date-select" value={selectedDate || ''} onChange={handleDateChange} disabled={!selectedChannel}>
          <option value="" disabled>Velg en dato</option>
          {selectedChannel && archive[selectedChannel] && Object.keys(archive[selectedChannel]).map(date => (
            <option key={date} value={date}>{date}</option>
          ))}
        </select>
      </div>
      <div className="checkbox-container">
        <label htmlFor="crt-effect-toggle">CRT Effects</label>
        <input
          type="checkbox"
          id="crt-effect-toggle"
          checked={crtEffectsEnabled}
          onChange={onCrtEffectToggle}
        />
      </div>
    </div>
  );
};

export default Sidebar;