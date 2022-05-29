const express = require('express');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

require('./routes')(app);

app.listen(process.env.port || 1337, () => {
    console.log(`Server Listening ${process.env.port || 1337}`)
})