const { bidRequestValidate, initSessionValidate, endSessionValidate } = require('./validation');

module.exports = (app) => {
    app.post('/bid_request', (req, res) => {
        bidRequestValidate.validateAsync(req.body)
            .then(data => { console.log(data); res.send('ok') })
            .catch(err => { res.status(400).send(err) })
    })


    app.post('/init_session', (req, res) => {
        initSessionValidate.validateAsync(req.body)
            .then(data => { console.log(data); res.send('ok') })
            .catch(err => { res.status(400).send(err) })
    })

    app.post('/end_session', (req, res) => {
        endSessionValidate.validateAsync(req.body)
            .then(data => { console.log(data); res.send('ok') })
            .catch(err => { res.status(400).send(err) })
    })
}