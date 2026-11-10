const fs = require('fs');
const path = 'src/components/hospital/LiveTranslationPanel.jsx';
const content = fs.readFileSync(path, 'utf8');
const lines = content.split(/\r?\n/);

if (lines[101] && lines[101].trim().includes('(Update Bottom Status UI)')) {
    lines.splice(101, 37);
    fs.writeFileSync(path, lines.join('\n'));
    console.log('Successfully deleted garbage lines.');
} else {
    console.log('Line 102 does not match expected content. Aborting.');
    console.log('Actual Line 102:', lines[101]);
}
