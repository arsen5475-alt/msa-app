const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Le service worker ne doit jamais rester bloqué en cache, sinon les mises à jour ne passent pas.
app.get('/sw.js', (req, res) => {
  res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.type('application/javascript');
  res.sendFile(path.join(__dirname, 'sw.js'));
});

app.use(express.static(__dirname));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`MSA app running on port ${PORT}`);
});
