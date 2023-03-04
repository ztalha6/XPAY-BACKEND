import {rules, schema} from '@ioc:Adonis/Core/Validator'
import {HttpContextContract} from '@ioc:Adonis/Core/HttpContext'
import BaseValidator from 'App/Validators/BaseValidator'
import Attachment from 'App/Models/Attachment'

export default class DisputeValidator extends BaseValidator {
  constructor(protected ctx: HttpContextContract) {
    super()
  }
  public schema = schema.create({
    comments: schema.string([rules.trim(),rules.maxLength(65535),]),
    payment_id: schema.number([
      rules.exists({
        table: 'payments',
        column: 'id',
        where: {
          deleted_at: null
        }
      }),
      rules.unique({table: 'disputes', column: 'payment_id'}),
      rules.unsigned()
    ]),
    dispute_media: schema.array.optional().members(
      schema.object().members({
        path: schema.string({}, [rules.maxLength(65535)]),
        type: schema.enum([Attachment.MIME_TYPE.IMAGE,Attachment.MIME_TYPE.VIDEO] as const)
      })
    ),
  })
}
