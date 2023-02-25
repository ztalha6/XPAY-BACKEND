import {schema, rules} from '@ioc:Adonis/Core/Validator'
import {HttpContextContract} from '@ioc:Adonis/Core/HttpContext'
import BaseValidator from "App/Validators/BaseValidator";

export default class PaymentOrderItemValidator extends BaseValidator {
    constructor(protected ctx: HttpContextContract) {
        super()
    }
    public schema = schema.create({
		name: schema.string({trim:true},[rules.maxLength(50),]),
		price: schema.number([]),
		extra: schema.string.optional({trim:true},[rules.maxLength(255),]),

    })
}
