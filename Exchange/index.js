const express = require('express');
const app = express();

app.use(require('cors')());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(require('morgan')('common'))

require('./routes')(app);

app.listen(process.env.EXCHANGE_PORT || 1337, () => {
    console.log(`Exchange Server Listening ${process.env.EXCHANGE_PORT || 1337}`)
})