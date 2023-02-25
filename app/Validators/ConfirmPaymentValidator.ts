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
    guest_user_id: schema.number([
      rules.exists({
        table: 'guest_users',
        column: 'id',
      }),
      rules.unsigned(),
    ]),
    payment_order_items: schema.array([rules.minLength(1)]).members(
      schema.object().members({
        name: schema.string([rules.maxLength(50),rules.trim()]),
        price: schema.number([rules.unsigned()]),
        extra: schema.string.optional([rules.trim(),rules.maxLength(255),]),
        qty: schema.number([rules.unsigned()]),
      })
    ),
  })
}
