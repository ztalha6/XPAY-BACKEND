import {rules, schema} from '@ioc:Adonis/Core/Validator'
import {HttpContextContract} from '@ioc:Adonis/Core/HttpContext'
import BaseValidator from 'App/Validators/BaseValidator'
import User from 'App/Models/User'
import Role from 'App/Models/Role'

export default class UserValidator extends BaseValidator {
  constructor(protected ctx: HttpContextContract) {
    super()
  }


  public schema = schema.create({
    phone: schema.string( [
      rules.mobile({
        strict: true
      }),
      rules.trim(),
      rules.unique({table: 'users', column: 'phone',
        where: {'is_verified': 1},
      }),
    ]),
    password: schema.string.optional( [
      rules.trim(),
      rules.minLength(6),
    ]),
    full_name: schema.string([rules.trim()]),
    image: schema.string.optional([rules.trim()]),
    device_type: schema.enum([User.DEVICE_TYPES.MOBILE, User.DEVICE_TYPES.WEB] as const),
    device_token: schema.string([rules.trim()]),
    establishment_id: schema.number.optional([
      rules.exists({
        table: 'establishments',
        column: 'id',
        where: {
          deleted_at: null
        },
      }),
    ]),
    role_id: schema.number([
      rules.exists({
        table: 'roles',
        column: 'id',
        where: {
          deleted_at: null
        },
        whereNot: {
          id: [Role.TYPES.ADMIN,Role.TYPES.USER]
        }
      })
    ])
  })


}


