import {rules, schema} from '@ioc:Adonis/Core/Validator'
import {HttpContextContract} from '@ioc:Adonis/Core/HttpContext'
import BaseValidator from 'App/Validators/BaseValidator'

export default class SendGuestVerificationCodeValidator extends BaseValidator {
  constructor(protected ctx: HttpContextContract) {
    super()
  }
  public schema = schema.create({
    transaction_id: schema.number([
      rules.exists({
        table: 'payments',
        column: 'id',
        where: {
          deleted_at: null
        }
      }),
      rules.unsigned()
    ])
  })
}
