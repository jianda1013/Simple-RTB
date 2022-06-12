const express = require('express');
const app = express();

app.use(require('cors')());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(require('morgan')('common'))

require('./routes')(app);

app.listen(process.env.BIDDER_PORT || 8080, () => {
    console.log(`Bidder Listening ${process.env.BIDDER_PORT || 8080}`)
})