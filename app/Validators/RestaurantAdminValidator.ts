import {rules, schema} from '@ioc:Adonis/Core/Validator'
import {HttpContextContract} from '@ioc:Adonis/Core/HttpContext'
import BaseValidator from 'App/Validators/BaseValidator'
import User from "App/Models/User";

export default class RestaurantAdminValidator extends BaseValidator {
  constructor(protected ctx: HttpContextContract) {
    super()
  }

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
      rules.trim()
    ]),
    full_name: schema.string([rules.trim()]),
    image: schema.string.optional([rules.trim()]),
    device_type: schema.enum([User.DEVICE_TYPES.MOBILE, User.DEVICE_TYPES.WEB,User.DEVICE_TYPES.POS] as const),
    device_token: schema.string([rules.trim()])
  })


}


