import {rules, schema} from '@ioc:Adonis/Core/Validator'
import {HttpContextContract} from '@ioc:Adonis/Core/HttpContext'
import BaseValidator from 'App/Validators/BaseValidator'
import User from 'App/Models/User'
import Role from 'App/Models/Role'

export default class RegisterUserOrVendorValidator extends BaseValidator {
  public schema = schema.create({
    email: schema.string({trim: true}, [
      rules.email(),
      rules.unique({table: 'users', column: 'email', where: {'is_verified': 1}}),
      rules.trim()
    ]),

    phone: schema.string( [
      rules.mobile({
        strict: true
      }),
      rules.unique({table: 'users', column: 'phone', where: {'is_verified': 1}}),
      rules.trim()
    ]),
    password: schema.string([
      rules.minLength(6),
      rules.trim(),
      rules.confirmed()
    ]),
    full_name: schema.string([rules.trim()]),
    image: schema.string.optional([rules.trim()]),
    device_type: schema.enum([User.DEVICE_TYPES.MOBILE, User.DEVICE_TYPES.WEB] as const),
    device_token: schema.string([rules.trim()]),
    role_id: schema.enum([Role.TYPES.USER, Role.TYPES.VENDOR] as const),
    business_name: schema.string.optional([
      rules.requiredWhen('role_id', '=', Role.TYPES.VENDOR)
    ]),
    business_address: schema.string.optional([
      rules.requiredWhen('role_id', '=', Role.TYPES.VENDOR)
    ]),
    bank_account_number: schema.string.optional([
      rules.requiredWhen('role_id', '=', Role.TYPES.VENDOR)
    ]),
    bank_routing_number: schema.string.optional([
      rules.requiredWhen('role_id', '=', Role.TYPES.VENDOR)
    ]),
    tax_id_number: schema.string.optional([
      rules.requiredWhen('role_id', '=', Role.TYPES.VENDOR)
    ]),
    website_url: schema.string.optional([
      rules.requiredWhen('role_id', '=', Role.TYPES.VENDOR)
    ]),
  })

  constructor(protected ctx: HttpContextContract) {
    super()
  }


}


