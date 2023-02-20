import {rules, schema} from '@ioc:Adonis/Core/Validator'
import {HttpContextContract} from '@ioc:Adonis/Core/HttpContext'
import BaseValidator from 'App/Validators/BaseValidator'

export default class ConfirmPaymentValidator extends BaseValidator {
  constructor(protected ctx: HttpContextContract) {
    super()
  }
  public schema = schema.create({
    payment_intent_id: schema.string([rules.trim(),rules.maxLength(255),]),
    payment_method_id: schema.string([rules.trim(),rules.maxLength(255),]),
    user_id: schema.number([
      rules.exists({
        table: 'users',
        column: 'id',
        where: {'is_verified': 1,'deleted_at': null},
      }),
      rules.unsigned(),
    ]),
  })
}
