const express = require('express');
const app = express();
const PORT = process.env.PORT || 9000;

const path = require('path');
const compression = require('compression')

// compress all responses
app.use(compression());

// middleware to enable SharedBuffer to be used
app.use(function(req, res, next) {
  res.header("Cross-Origin-Embedder-Policy", "require-corp");
  res.header("Cross-Origin-Opener-Policy", "same-origin");
  next();
});

app.use(express.static(path.join(__dirname, "public")));

app.listen(PORT, () => {
  console.log(`FFmpeg App is listening on port ${PORT}!`)
});