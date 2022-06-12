const Joi = require('joi');

const bidRequestValidate = Joi.object({
    floor_price: Joi.number().min(0).required(),

    timeout_ms: Joi.number().integer().min(1).required(),

    session_id: Joi.string().required(),

    user_id: Joi.string().required(),

    request_id: Joi.string().required()
})

const notifyWinValidate = Joi.object({
    session_id: Joi.string().required(),

    request_id: Joi.string().required(),

    clear_price: Joi.number().min(0).required()
})

const initSessionValidate = Joi.object({
    session_id: Joi.string().required(),

    estimated_traffic: Joi.number().integer().min(0).max(1000000).required(),

    budget: Joi.number().min(0).required(),

    impression_goal: Joi.number().integer().min(0).max(1000000).required(),

})

const endSessionValidate = Joi.object({
    session_id: Joi.string().required()
})

module.exports = {
    bidRequestValidate,
    notifyWinValidate,
    initSessionValidate,
    endSessionValidate
}