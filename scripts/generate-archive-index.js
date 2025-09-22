const fs = require('fs');
const path = require('path');

const providedArchivePath = process.argv[2];
const archivePath = providedArchivePath ? path.resolve(providedArchivePath) : path.join(__dirname, '..', 'archive');
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

    // Sort dates chronologically
    dates.sort((a, b) => {
      const partsA = a.split('-').map(Number); // [DD, MM, YYYY]
      const partsB = b.split('-').map(Number); // [DD, MM, YYYY]
      const dateA = new Date(partsA[2], partsA[1] - 1, partsA[0]);
      const dateB = new Date(partsB[2], partsB[1] - 1, partsB[0]);
      return dateA - dateB;
    });

    archiveIndex[channel] = {};

    for (const date of dates) {
      const datePath = path.join(channelPath, date);
      const timeDirs = getDirectories(datePath);

      if (timeDirs.length > 0 && /^\d{4}$/.test(timeDirs[0])) {
        // This date has time-based captures
        archiveIndex[channel][date] = {};
        for (const time of timeDirs) {
          const timePath = path.join(datePath, time);
          const pages = getFiles(timePath);

          pages.sort((a, b) => {
            const pageNumA = a.split('.')[0].split('-').map(Number);
            const pageNumB = b.split('.')[0].split('-').map(Number);
            if (pageNumA[0] !== pageNumB[0]) return pageNumA[0] - pageNumB[0];
            const subPageA = pageNumA.length > 1 ? pageNumA[1] : 0;
            const subPageB = pageNumB.length > 1 ? pageNumB[1] : 0;
            return subPageA - subPageB;
          });

          archiveIndex[channel][date][time] = pages;
        }
      } else {
        // This date has pages directly under it (backward compatibility)
        const pages = getFiles(datePath);

        pages.sort((a, b) => {
          const pageNumA = a.split('.')[0].split('-').map(Number);
          const pageNumB = b.split('.')[0].split('-').map(Number);
          if (pageNumA[0] !== pageNumB[0]) return pageNumA[0] - pageNumB[0];
          const subPageA = pageNumA.length > 1 ? pageNumA[1] : 0;
          const subPageB = pageNumB.length > 1 ? pageNumB[1] : 0;
          return subPageA - subPageB;
        });

        archiveIndex[channel][date] = pages;
      }
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
