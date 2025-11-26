const Joi = require('joi')

const account = Joi.string().alphanum().min(6).max(12).required()
const password = Joi.string().pattern(/^(?![0-9]+$)[a-z0-9]{1,50}$/).min(6).max(12).required()

exports.login_limit = {
    body: {
        account,
        password
    }
}