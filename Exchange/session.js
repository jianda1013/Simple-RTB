const axios = require('axios').default
const redis = require('./redis');

// Timeout if No Response
const promiseWithTimeout = (timeout_ms, promise) => {
    return Promise.race([
        promise,
        new Promise((resolve) => setTimeout(() => resolve(null), timeout_ms)),
    ]).catch(() => { return; });
}

// Choose Winner
const determinBid = (receive_datas, floor_price) => {
    let win_bid = null;
    for (let data of receive_datas)
        if (data.price < floor_price)
            continue
        else if (win_bid === null || data.price > win_bid.price)
            win_bid = data
    return win_bid;
}

// Send Bid Request to Bidders
const sendBidRequest = ({ floor_price, timeout_ms, session_id, user_id, request_id }) => {
    return new Promise((resolve, reject) => {
        let promise = [], bid_responses = [];
        redis.getSession(session_id).then(session => {
            session = JSON.parse(session);
            // Send All Bidders
            for (let bidder of session)
                promise.push(
                    promiseWithTimeout(timeout_ms, axios.post(`${bidder.endpoint}/bid_request`, { floor_price, timeout_ms, session_id, user_id, request_id }))
                        .catch(() => { return; }).then(response => bid_responses.push({ bidder, price: response?.data?.price }))
                )
            Promise.all(promise)
                .then(() => resolve(bid_responses))
                .catch(err => { console.log({ err }); reject('BIDDERS_RESPONSE_ERROR') })
        }).catch(err => reject(err))
    })
}

const sendWinBid = ({ win_bid, session_id, request_id }) => {
    return new Promise((resolve, reject) => {
        axios.post(`${win_bid.bidder.endpoint}/notify_win_bid`, { session_id, request_id, clear_price: win_bid.price })
            .then(() => resolve(true))
            .catch(err => { console.log({ err }); reject('BIDDERS_RESPONSE_ERROR') })
    })
}

// new Session comes, save bidders infomation into redis
const newSession = ({ session_id, estimated_traffic, bidders, bidder_setting: { budget, impression_goal } }) => {
    return new Promise((resolve, reject) => {
        redis.createSession({ session_id, data: bidders }).then(() => {
            let promise = [];
            for (let bidder of bidders)
                promise.push(axios.post(`${bidder.endpoint}/init_session`, { session_id, estimated_traffic, budget, impression_goal }).catch((err) => { console.log(err); return; }))
            Promise.all(promise)
                .then(() => { resolve(true) })
                .catch(err => { console.log({ err }); reject('BIDDERS_RESPONSE_ERROR') })
        }).catch(err => reject(err))
    })
}

const bidRequest = ({ floor_price, timeout_ms, session_id, user_id, request_id }) => {
    return new Promise((resolve, reject) => {
        sendBidRequest({ floor_price, timeout_ms, session_id, user_id, request_id }).then(bid_responses => {
            bid_responses = bid_responses.filter(item => { return item.price >= 0 })
            win_bid = determinBid(bid_responses, floor_price)
            if (win_bid) {
                resolve({ session_id, request_id, win_bid: { name: win_bid.bidder.name, price: win_bid.price }, bid_responses });
                sendWinBid({ win_bid, session_id, request_id }).catch(err => console.log(err))
            }
            else resolve({ session_id, request_id, win_bid: null, bid_responses })
        }).catch(err => { reject(err) })
    })
}

// rm from redis
const endSession = ({ session_id }) => {
    return new Promise((resolve, reject) => {
        let promise = [];
        redis.getSession(session_id).then(session => {
            if (session)
                for (let bidder of JSON.parse(session))
                    promise.push(axios.post(`${bidder.endpoint}/end_session`, { session_id }).catch(() => { return; }))
            redis.delete(session_id).then(() => {
                Promise.all(promise)
                    .then(() => resolve(true))
                    .catch(err => { console.log({ err }); reject('BIDDERS_RESPONSE_ERROR') })
            }).catch(err => { reject(err) })
        }).catch(err => { reject(err) })
    })
}

module.exports = {
    newSession, bidRequest, endSession
}