const client = require("redis").createClient({ url: process.env.REDIS_URL || 'localhost:6379' });

client.on("error", err => {
    console.log(`Error ${err}`);
});
client.connect()

let self = module.exports = {

    createSession({ session_id, data }) {
        return new Promise((resolve, reject) => {
            client.set(`Session_${session_id}`, JSON.stringify(data))
                .then(result => resolve(result)).catch(err => { console.log(err); reject('REDIS_ERROR') })
        })
    },

    getSession(session_id) {
        return new Promise((resolve, reject) => {
            client.get(`Session_${session_id}`)
                .then(result => resolve(result)).catch(err => { console.log(err); reject('REDIS_ERROR') })
        })
    },

    delete(session_id) {
        return new Promise((resolve, reject) => {
            client.del(`Session_${session_id}`)
                .then(result => resolve(result)).catch(err => { console.log(err); reject('REDIS_ERROR') })
        })
    }
}