const { bidRequestValidate, notifyWinValidate, initSessionValidate, endSessionValidate } = require('./validation');
const sessions = require('./session');

module.exports = (app) => {
    app.post('/bid_request', (req, res) => {
        bidRequestValidate.validateAsync(req.body).then(() => {
            sessions.newBidRequest(req.body)
                .then(result => res.json(result)).catch(err => { res.status(400).send(err) })
        }).catch(err => { res.status(400).send(err) })
    })

    app.post('/notify_win_bid', (req, res) => {
        notifyWinValidate.validateAsync(req.body).then(() => {
            sessions.winBid(req.body)
                .then(() => res.send('ok')).catch(err => { res.status(400).send(err) })
        }).catch(err => { res.status(400).send(err) })
    })


    app.post('/init_session', (req, res) => {
        initSessionValidate.validateAsync(req.body).then(() => {
            sessions.newSession(req.body)
                .then(() => res.send('ok')).catch(err => { res.status(400).send(err) })
        }).catch(err => { console.log(err); res.status(400).send(err) })
    })

    app.post('/end_session', (req, res) => {
        endSessionValidate.validateAsync(req.body).then(() => {
            sessions.endSession(req.body)
                .then(() => res.send('ok')).catch(err => { res.status(400).send(err) })
        }).catch(err => { res.status(400).send(err) })
    })
}