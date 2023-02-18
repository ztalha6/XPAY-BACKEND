import {rules, schema} from '@ioc:Adonis/Core/Validator'
import {HttpContextContract} from '@ioc:Adonis/Core/HttpContext'
import BaseValidator from 'App/Validators/BaseValidator'

export default class ForgotPasswordValidator extends BaseValidator {
  constructor(protected ctx: HttpContextContract) {
    super()
  }

  public schema = schema.create({
    email: schema.string.optional( [
      rules.trim(),
      rules.requiredIfExists('email'),
      rules.email({})
    ]),
    phone: schema.string.optional( [
      rules.requiredIfNotExists('email'),
      rules.mobile({
        strict: true
      }),
      rules.trim(),
      rules.unique({table: 'users', column: 'phone', where: {'is_verified': 1}}),
    ])
  })

}
