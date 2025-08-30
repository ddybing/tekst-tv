const fs = require('fs');
const path = require('path');

const archivePath = path.join(__dirname, '..', 'archive');
const outputPath = path.join(__dirname, '..', 'app', 'public', 'index.json');

function getDirectories(sourcePath) {
  if (!fs.existsSync(sourcePath)) return [];
  return fs.readdirSync(sourcePath).filter(file => {
    try {
      return fs.statSync(path.join(sourcePath, file)).isDirectory();
    } catch (e) {
      return false;
    }
  });
}

function getFiles(sourcePath) {
  if (!fs.existsSync(sourcePath)) return [];
  return fs.readdirSync(sourcePath).filter(file => {
    try {
      return fs.statSync(path.join(sourcePath, file)).isFile();
    } catch (e) {
      return false;
    }
  });
}

const archiveIndex = {};

try {
  const channels = getDirectories(archivePath);

  for (const channel of channels) {
    const channelPath = path.join(archivePath, channel);
    const dates = getDirectories(channelPath);
    archiveIndex[channel] = {};

    for (const date of dates) {
      const datePath = path.join(channelPath, date);
      const pages = getFiles(datePath);
      archiveIndex[channel][date] = pages;
    }
  }

  fs.writeFileSync(outputPath, JSON.stringify(archiveIndex, null, 2));
  console.log(`Successfully generated archive index at ${outputPath}`);

} catch (error) {
  console.error('Error generating archive index:', error);
  // Create an empty index if there is an error
  fs.writeFileSync(outputPath, JSON.stringify({}, null, 2));
  console.log(`Created an empty archive index at ${outputPath}`);
}
