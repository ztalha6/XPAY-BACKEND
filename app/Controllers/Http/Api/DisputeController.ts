import ApiBaseController from 'App/Controllers/Http/Api/ApiBaseController'
import {HttpContextContract} from '@ioc:Adonis/Core/HttpContext'
import DisputeRepo from 'App/Repos/DisputeRepo'
import DisputeValidator from 'App/Validators/DisputeValidator'
import Attachment from 'App/Models/Attachment'


export default class DisputeController extends ApiBaseController {

  constructor() {
    super(DisputeRepo)
  }

  async store(ctx: HttpContextContract, instanceType?: number) {
    await super.validateBody(ctx,DisputeValidator)
    let input = ctx.request.only(this.repo.fillables())
    let row = await DisputeRepo.store(input, ctx.request, instanceType || Attachment.TYPE[this.repo.model.name.toUpperCase()])
    return this.apiResponse('Record Added Successfully', row)
  }

  async update(ctx: HttpContextContract, instanceType?: number): Promise<{ data: any; message: string; status: boolean }> {
    await super.validateBody(ctx,DisputeValidator)
    return super.update(ctx, instanceType)
  }

}
