import ApiBaseController from 'App/Controllers/Http/Api/ApiBaseController'
import {HttpContextContract} from '@ioc:Adonis/Core/HttpContext'
import PaymentRepo from 'App/Repos/PaymentRepo'
import Attachment from 'App/Models/Attachment'
import InitiatePaymentValidator from 'App/Validators/InitiatePaymentValidator'
import ConfirmPaymentValidator from 'App/Validators/ConfirmPaymentValidator'


export default class PaymentController extends ApiBaseController {

  constructor() {
    super(PaymentRepo)
  }

  async getPaymentByUser(ctx: HttpContextContract) {
    const res = await PaymentRepo.getPaymentByUser(ctx.request.param('id'))
    return this.apiResponse('Record fetched successfully!', res)
  }

  async initiatePayment(ctx: HttpContextContract, instanceType?: number) {
    await super.validateBody(ctx,InitiatePaymentValidator)
    let input = ctx.request.only(this.repo.fillables())
    let row = await PaymentRepo.initiatePayment(input, ctx.request, instanceType || Attachment.TYPE[this.repo.model.name.toUpperCase()])
    return this.apiResponse('Payment Initiated Successfully', row)
  }

  async confirmPayment(ctx: HttpContextContract, instanceType?: number) {
    await super.validateBody(ctx,ConfirmPaymentValidator)
    let input = ctx.request.only(this.repo.fillables())
    let row = await PaymentRepo.confirmPayment(input, ctx.request, instanceType || Attachment.TYPE[this.repo.model.name.toUpperCase()])
    return this.apiResponse('Payment Successful', row)
  }


}
