import ApiBaseController from 'App/Controllers/Http/Api/ApiBaseController'
import {HttpContextContract} from '@ioc:Adonis/Core/HttpContext'
import PaymentOrderItemRepo from "App/Repos/PaymentOrderItemRepo";
import PaymentOrderItemValidator from "App/Validators/PaymentOrderItemValidator";
import Attachment from "App/Models/Attachment";


export default class PaymentOrderItemController extends ApiBaseController {

    constructor() {
        super(PaymentOrderItemRepo)
    }

    async store(ctx: HttpContextContract, instanceType?: number) {
        await super.validateBody(ctx,PaymentOrderItemValidator)
        let input = ctx.request.only(this.repo.fillables())
        let row = await PaymentOrderItemRepo.store(input, ctx.request, instanceType || Attachment.TYPE[this.repo.model.name.toUpperCase()])
        return this.apiResponse('Record Added Successfully', row)
    }

    async update(ctx: HttpContextContract, instanceType?: number): Promise<{ data: any; message: string; status: boolean }> {
        await super.validateBody(ctx,PaymentOrderItemValidator)
        return super.update(ctx, instanceType)
    }

}
