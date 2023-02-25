import {rules, schema} from '@ioc:Adonis/Core/Validator'
import {HttpContextContract} from '@ioc:Adonis/Core/HttpContext'
import BaseValidator from 'App/Validators/BaseValidator'

export default class InitiatePaymentValidator extends BaseValidator {
  constructor(protected ctx: HttpContextContract) {
    super()
  }
  public schema = schema.create({
    payment_method_id: schema.string([rules.trim(),rules.maxLength(255),]),
    amount: schema.number([rules.unsigned()]),
    user_phone: schema.string( [
      rules.mobile({
        strict: true
      }),
      rules.trim()
    ]),
  })
}
