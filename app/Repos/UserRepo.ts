// import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import BaseRepo from 'App/Repos/BaseRepo'
import User from 'App/Models/User'
import {RequestContract} from '@ioc:Adonis/Core/Request'
import Mail from '@ioc:Adonis/Addons/Mail'
import constants from 'Config/constants'
import Attachment from 'App/Models/Attachment'
import Role from 'App/Models/Role'
import ExceptionWithCode from 'App/Exceptions/ExceptionWithCode'
import {HttpContext} from '@adonisjs/core/build/standalone'
import UnauthorizedAccess from 'App/Exceptions/UnauthorizedAccess'
import Database from '@ioc:Adonis/Lucid/Database'

class UserRepo extends BaseRepo {
  model

  constructor() {
    const relations = ['roles']
    const scopes = []
    super(User, relations, scopes)
    this.model = User
  }

  async getRestaurantUsers(orderByColumn,orderByValue,page,perPage){
    const ctx: any = HttpContext.get()
    const user = ctx.auth.use('api').user
    let query = this.model.query()
    query.whereHas('roles',(roleBuilder)=>{
      roleBuilder.where('id','>',Role.TYPES.RESTAURANT_ADMIN)
    })

    const establishmentId = user.establishmentId || ctx.request.input('establishment_id',null)
    if (establishmentId) {
      query.where({
        'establishment_id': establishmentId,
      })
    }
    for (let relation of this.relations) query.preload(relation)
    return query.orderBy(orderByColumn, orderByValue).paginate(page, perPage)
  }

  // @ts-ignore
  async store(input, request?: RequestContract, instanceType?: number): Promise<void> {
    delete input.password_confirmation
    return super.store(input, request, Attachment.TYPE.PROFILE_PICTURE);
  }

  async update(id: number, input, request?: RequestContract, _instanceType?: number, _deleteOldMedia: boolean = false, _trx?: any): Promise<any> {
    const user:User = await Database.transaction( async (_trx)=>{
      const row:User = await super.update(id,input,request,_instanceType,_deleteOldMedia,_trx)
      await row.related('roles').sync([request?.input('role_id')]);
      return row
    })

    return this.show(user.id)
  }

  async updateVerificationCode(user, verification_code) {
    await this.model.query().where('id', user.id).update({verification_code});
  }

  async generateAndSendOTP(receiver, type) {
    /*Generate OTP*/
    // let otp_code = Math.floor(1000 + Math.random() * 9000);
    let otp_code = "0000"

    let user = await this.model.findByOrFail(type, receiver)
    await this.updateVerificationCode(user, otp_code)

    switch (type) {
      case 'email':
        /*Send Email*/
        await Mail.sendLater((message) => {
          message
            .from(constants.APP_NAME)
            .to(receiver)
            .subject(`OTP Code - ${constants.APP_NAME}`)
            .htmlView('emails/verification-code', {
              name: user.full_name,
              verification_code: otp_code
            })
        })
        break

      case 'phone':
      /*Implement Twilio here*/
    }

  }

  async socialLogin(request) {
    let input = request.only(['username', 'email', 'social_platform', 'client_id', 'token'])
    input.full_name = input.username;
    input.is_verified = 1;
    input.is_approved = 1;
    input.is_social_login = 1;
    input.password = Math.random().toString(36).substring(2, 15)
    let res = await super.store(input, request);
    if (request.input('media', null)) {
      await Attachment.updateOrCreate({
        //@ts-ignore
        instance_type: Attachment.TYPE.PROFILE_PICTURE,
        instance_id: res.id,
      }, {
        path: request.input('media'),
        //@ts-ignore
        instance_type: Attachment.TYPE.PROFILE_PICTURE,
        instance_id: res.id,
        mime_type: "url"
      })
    }
    return res;
  }

  async findByEmail(email) {
    return this.model.query().where('email', email).first();
  }

  async findSocialLogin(request) {
    return this.model.query().where({
      social_platform: request.input('social_platform'),
      client_id: request.input('client_id'),
    }).first();

  }

  async updateSocialProfile(user, request) {
    let input = request.only(['username', 'social_platform', 'client_id', 'token'])
    input.full_name = input.username
    await this.model.query().where('id', user.id).update(input)
    if (request.input('media', null)) {
      await Attachment.updateOrCreate({
        //@ts-ignore
        instance_type: Attachment.TYPE.PROFILE_PICTURE,
        instance_id: user.id,
      }, {
        path: request.input('media'),
        //@ts-ignore
        instance_type: Attachment.TYPE.PROFILE_PICTURE,
        instance_id: user.id,
        mime_type: "url"
      })
    }
  }

  /*
  * Verify the establishment belongs to the same person OR
  * The restaurant Owner OR
  * The Super Admin
  * */
  async authorizedForEstablishmentLevelTask(){
    const ctx = HttpContext.get()
    const user = ctx?.auth.use('api').user
    if(!user) throw new UnauthorizedAccess()
    const exists = await this.model.query().where({establishment_id:user.establishmentId, id:user.id}).orWhere((whereBuilder)=>{
      whereBuilder.where({id: user.id}).whereHas('roles',(builder)=>{
        builder.whereIn('id',[Role.TYPES.ADMIN,Role.TYPES.RESTAURANT_ADMIN])
      })
    }).first()
    if (!exists) throw new ExceptionWithCode("Permission denied", 403)
  }
}

/*Create a singleton instance*/
export default new UserRepo()
