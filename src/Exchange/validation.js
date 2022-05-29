const Joi = require('joi');

const bidRequestValidate = Joi.object({
    floor_price: Joi.number().min(0).required(),

    timeout_ms: Joi.number().integer().min(1).required(),

    session_id: Joi.string().required(),

    user_id: Joi.string().required(),

    request_id: Joi.string().required()
})

const initSessionValidate = Joi.object({
    session_id: Joi.string().required(),

    estimated_traffic: Joi.number().integer().min(0).max(1000000).required(),

    bidders: Joi.array().items({
        name: Joi.string().required(),
        endpoint: Joi.string().required()
    }).required(),

    bidder_setting: Joi.object({
        budget: Joi.number().min(0).required(),
        impression_goal: Joi.number().integer().min(0).max(1000000).required(),
    }).required()

})

const endSessionValidate = Joi.object({
    session_id: Joi.string().required()
})

module.exports = {
    bidRequestValidate,
    initSessionValidate,
    endSessionValidate
}