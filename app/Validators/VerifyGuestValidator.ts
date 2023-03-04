import {rules, schema} from '@ioc:Adonis/Core/Validator'
import {HttpContextContract} from '@ioc:Adonis/Core/HttpContext'
import BaseValidator from 'App/Validators/BaseValidator'

export default class SendGuestVerificationCodeValidator extends BaseValidator {
  constructor(protected ctx: HttpContextContract) {
    super()
  }
  public schema = schema.create({
    guest_user_id: schema.number([
      rules.exists({
        table: 'guest_users',
        column: 'id',
        where: {
          deleted_at: null
        }
      }),
    ]),
    code : schema.string([rules.trim(),rules.minLength(4),rules.maxLength(4)])
  })
}
