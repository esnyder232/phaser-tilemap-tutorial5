const express = require('express');
const path = require('path');
const app = express();
const port = 5000;

//index
app.get('/', (req, res) => {res.sendFile(path.join(__dirname, "index.html"));});
app.get('/index.html', (req, res) => {res.sendFile(path.join(__dirname, "index.html"));});

//static files
app.use('/assets', express.static(path.join(__dirname, "/assets")));
app.use('/src', express.static(path.join(__dirname, "/src")));


//run the server
app.listen(port, () => console.log(`first_phaser_project listening on port ${port}!`));

