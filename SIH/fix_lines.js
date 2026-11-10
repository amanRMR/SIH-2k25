const fs = require('fs');
const path = 'src/components/hospital/LiveTranslationPanel.jsx';
const content = fs.readFileSync(path, 'utf8');
const lines = content.split(/\r?\n/);
// Remove lines 102 to 138 (1-based), which is index 101 to 137.
// Count: 138-102+1 = 37 lines.
// Ensure we are deleting the right lines by checking content
if (lines[101].trim().includes('(Update Bottom Status UI)')) {
    lines.splice(101, 37);
    fs.writeFileSync(path, lines.join('\n'));
    console.log('Successfully deleted garbage lines.');
} else {
    console.log('Line 102 does not match expected content. Aborting.');
    console.log('Actual Line 102:', lines[101]);
}
