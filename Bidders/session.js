const redis = require('./redis');

// ((bid - floor_price) / (average - floor_price)) ^ estimated_traffic >= impression_remain;
// Pr(Win) * estimated_traffic >= impression_remain;
// ((bid - Flr) / (Avg - Flr)) * estimated_traffic >= impression_remain;
// bid - Flr >= impression_remain * (Avg - Flr) / estimated_traffic
// bid >= impression_remain * (Avg - Flr) / estimated_traffic + Flr
// 
const algorithm = async ({ session_id, floor_price }) => {
    return new Promise((resolve, reject) => {
        redis.getSession(session_id).then(data => {
            data = JSON.parse(data)
            let { impression_goal, impression_now, estimated_traffic, budget } = data
            let impression_remain = (impression_goal - impression_now.length)
            let average = (budget / impression_remain)
            data.estimated_traffic -= 1;
            redis.createSession({ session_id, data }).then(() => {
                // more than expect, don't bit
                if (average < floor_price)
                    resolve(-1);
                // to achieve the goal, need spend all
                else if (estimated_traffic === impression_remain)
                    resolve(average.toFixed(2))
                else {
                    let bid = impression_remain * (average - floor_price) / estimated_traffic + floor_price;
                    console.log({ bid });
                    resolve(bid.toFixed(2));
                }
            })
        }).catch(err => reject(err))
    })
}

// if won't win => pass
const checkWinPossible = (session_id, user_id) => {
    return new Promise((resolve, reject) => {
        redis.getSession(session_id).then(data => {
            let { impression_goal, impression_now, estimated_traffic } = JSON.parse(data)
            // already impress
            if (impression_now.includes(user_id))
                resolve(false);
            // impossible achieve
            else if (impression_goal > estimated_traffic - impression_now.length)
                resolve(false);
            // achieve goal
            else if (impression_now.length > impression_goal)
                resolve(false);
            else
                resolve(true)
        }).catch(err => { reject(err) })
    })
}

// put session info into redis
const newSession = ({ session_id, estimated_traffic, budget, impression_goal }) => {
    return new Promise((resolve, reject) => {
        redis.createSession({ session_id, data: { estimated_traffic, budget, impression_goal, impression_now: [] } }).then(() => {
            resolve(true);
        }).catch(err => { reject(err) })
    })
}

const newBidRequest = ({ floor_price, timeout_ms, session_id, user_id, request_id }) => {
    return new Promise((resolve, reject) => {
        checkWinPossible(session_id, user_id).then(canWin => {
            if (!canWin)
                resolve({ session_id, request_id, price: -1 });
            // save request info into redis for easy searching if win
            else redis.createRequst({ request_id, user_id, timeout_ms }).then(() => {
                algorithm({ session_id, floor_price }).then(price => {
                    resolve({ session_id, request_id, price });
                }).catch(err => { reject(err) })
            }).catch(err => { reject(err) })
        }).catch(err => { reject(err) })
    })
}

const winBid = ({ session_id, request_id, clear_price }) => {
    return new Promise((resolve, reject) => {
        redis.getSession(session_id).then(data => {
            data = JSON.parse(data);
            redis.getRequst(request_id).then(user => {
                // save impression person
                data.budget -= clear_price;
                data.impression_now.push(user);
                redis.createSession({ session_id, data })
                    .then(() => resolve(true))
                    .catch(err => { reject(err) });
            }).catch(err => { reject(err) })
        }).catch(err => { reject(err) })
    })
}

const endSession = ({ session_id }) => {
    return new Promise((resolve, reject) => {
        redis.delete(session_id).then(result => resolve(result)).catch(err => { reject(err) })
    })
}

module.exports = {
    newSession, newBidRequest, winBid, endSession
}