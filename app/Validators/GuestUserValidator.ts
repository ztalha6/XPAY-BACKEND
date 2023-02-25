import {schema, rules} from '@ioc:Adonis/Core/Validator'
import {HttpContextContract} from '@ioc:Adonis/Core/HttpContext'
import BaseValidator from "App/Validators/BaseValidator";

export default class GuestUserValidator extends BaseValidator {
    constructor(protected ctx: HttpContextContract) {
        super()
    }
    public schema = schema.create({
		verification_code: schema.string.optional({trim:true},[rules.maxLength(10),]),
		phone: schema.string({trim:true},[rules.maxLength(255),]),

    })
}
