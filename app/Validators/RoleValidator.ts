import {rules, schema} from '@ioc:Adonis/Core/Validator'
import {HttpContextContract} from '@ioc:Adonis/Core/HttpContext'
import BaseValidator from 'App/Validators/BaseValidator'

export default class RoleValidator extends BaseValidator {
  constructor(protected ctx: HttpContextContract) {
    super()
  }
  public refs = schema.refs({
    establishmentId : this.ctx.auth.use('api').user?.establishmentId || this.ctx.request.input('establishment_id',null),
    updateId : this.ctx.params?.id || null
  })
  public schema = schema.create({
    name: schema.string([
      rules.maxLength(100),
      rules.trim(),
      rules.unique({
        table: 'roles', column: 'name',
        where: {
          establishment_id : this.refs.establishmentId.value, // to make sure that the name exist in this establishment
          deleted_at: null
        },
        whereNot:{
          id: this.refs.updateId,
        }
      }),
    ]),
    display_name: schema.string.optional([rules.maxLength(100),rules.trim()]),
    description: schema.string.optional([rules.maxLength(400),rules.trim()]),
    establishment_id: schema.number.optional([
      rules.exists({
        table: 'establishments',
        column: 'id',
        where:{
          deleted_at:null
        }
      }),
      rules.unsigned(),
    ]),
    permissions: schema.array().members(
      schema.object().members({
        module_id: schema.number([
          rules.exists({
            table: 'modules',
            column: 'id'
          }),
          rules.unsigned(),
        ]),
        create : schema.boolean.optional(),
        read : schema.boolean.optional(),
        update : schema.boolean.optional(),
        delete : schema.boolean.optional(),
      })
    )
  })
}
