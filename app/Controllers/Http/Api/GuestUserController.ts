import ApiBaseController from 'App/Controllers/Http/Api/ApiBaseController'
import {HttpContextContract} from '@ioc:Adonis/Core/HttpContext'
import GuestUserRepo from "App/Repos/GuestUserRepo";
import GuestUserValidator from "App/Validators/GuestUserValidator";
import Attachment from "App/Models/Attachment";


export default class GuestUserController extends ApiBaseController {

    constructor() {
        super(GuestUserRepo)
    }

    async store(ctx: HttpContextContract, instanceType?: number) {
        await super.validateBody(ctx,GuestUserValidator)
        let input = ctx.request.only(this.repo.fillables())
        let row = await GuestUserRepo.store(input, ctx.request, instanceType || Attachment.TYPE[this.repo.model.name.toUpperCase()])
        return this.apiResponse('Record Added Successfully', row)
    }

    async update(ctx: HttpContextContract, instanceType?: number): Promise<{ data: any; message: string; status: boolean }> {
        await super.validateBody(ctx,GuestUserValidator)
        return super.update(ctx, instanceType)
    }

}
