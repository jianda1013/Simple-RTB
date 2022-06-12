const client = require("redis").createClient({ url: process.env.REDIS_URL || 'localhost:6379' });

client.on("error", err => {
    console.log(`Error ${err}`);
});
client.connect()

let self = module.exports = {

    createSession({ session_id, data }) {
        return new Promise((resolve, reject) => {
            client.set(session_id, JSON.stringify(data))
                .then(result => resolve(result)).catch(err => { console.log(err); reject('REDIS_ERROR') })
        })
    },

    createRequst({ request_id, user_id, timeout_ms }) {
        return new Promise((resolve, reject) => {
            Promise.all([
                client.set(request_id, user_id),
                client.expire(request_id, parseInt(timeout_ms / 1000 + 10))
            ]).then(result => resolve(result)).catch(err => { console.log(err); reject('REDIS_ERROR') })
        })
    },

    getSession(session_id) {
        return new Promise((resolve, reject) => {
            client.get(session_id)
                .then(result => resolve(result)).catch(err => { console.log(err); reject('REDIS_ERROR') })
        })
    },

    getRequst(request_id) {
        return new Promise((resolve, reject) => {
            client.get(request_id)
                .then(result => resolve(result)).catch(err => { console.log(err); reject('REDIS_ERROR') })
        })
    },

    delete(key) {
        return new Promise((resolve, reject) => {
            client.del(key)
                .then(result => resolve(result)).catch(err => { console.log(err); reject('REDIS_ERROR') })
        })
    }
}