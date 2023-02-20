import ApiBaseController from 'App/Controllers/Http/Api/ApiBaseController'
import UserRepo from 'App/Repos/UserRepo'
import {HttpContextContract} from '@ioc:Adonis/Core/HttpContext'
import UserValidator from 'App/Validators/UserValidator'
import constants from 'Config/constants'
import Mail from '@ioc:Adonis/Addons/Mail'
import ForgotPasswordValidator from 'App/Validators/ForgotPasswordValidator'
import ExceptionWithCode from 'App/Exceptions/ExceptionWithCode'
import VerifyOTPValidator from 'App/Validators/VerifyOTPValidator'
import ResetPasswordValidator from 'App/Validators/ResetPasswordValidator'
import Hash from '@ioc:Adonis/Core/Hash'
import ChangePasswordValidator from 'App/Validators/ChangePasswordValidator'
import UserDevicesRepo from 'App/Repos/UserDevicesRepo'
import UniqueValidation from 'App/Validators/UniqueValidation'
import LoginValidator from 'App/Validators/LoginValidator'
import InvalidRoleAccess from 'App/Exceptions/InvalidRoleAccess'
import SocialAccountRepo from 'App/Repos/SocialAccountRepo'
import SocialLoginValidator from 'App/Validators/SocialLoginValidator'
import Role from 'App/Models/Role'
import EditUserValidator from 'App/Validators/EditUserValidator'
import Attachment from 'App/Models/Attachment'
import RegisterUserOrVendorValidator from 'App/Validators/RegisterUserOrVendorValidator'
import * as crypto from 'crypto'

export default class UserController extends ApiBaseController {

  constructor() {
    super(UserRepo);
  }



  async me(ctx: HttpContextContract) {
    const user: any = ctx.auth.user;
    let profile = await UserRepo.show(user.id)
    return super.apiResponse("Profile fetched successfully", {profile})
  }

  async login(ctx: HttpContextContract) {
    await super.validateBody(ctx,LoginValidator)
    const password = ctx.request.input('password')
    let phone = ctx.request.input('phone', null)
    let email = ctx.request.input('email', null)
    let accessToken = await ctx.auth.attempt(email || phone, password, {
      expiresIn: constants.AUTH_TOKEN_EXPIRY
    })
    let user:any

    user = await this.repo.model.query().where('email', email).first()

    if (!user) throw new InvalidRoleAccess()

    user = await UserRepo.show(user.id)

    /*
    * Save Device Token
    * */
    await UserDevicesRepo.store(ctx.request, user.id)

    return super.apiResponse("Logged in successfully", {user, access_token: accessToken})
  }


  async onlineLogin(ctx: HttpContextContract) {
    await super.validateBody(ctx,LoginValidator)
    const password = ctx.request.input('password')
    let email = ctx.request.input('email', null)
    let accessToken = await ctx.auth.attempt(email, password, {
      expiresIn: constants.AUTH_TOKEN_EXPIRY
    })
    let user:any

    user = await this.repo.model.query().where('email', email).whereHas('roles',(rolesQB)=>{
      rolesQB.where({role_id: Role.TYPES.USER})
    }).first()

    if (!user) throw new InvalidRoleAccess()

    if(user.isVerified === 0){
      await UserRepo.generateAndSendOTP(user.email,'email')
    }

    user = await UserRepo.show(user.id)

    /*
    * Save Device Token
    * */
    await UserDevicesRepo.store(ctx.request, user.id)

    return super.apiResponse("Logged in successfully", {user, access_token: accessToken})
  }







  async logout(ctx: HttpContextContract) {
    const user = ctx.auth.use('api').user
    if(user){
      await ctx.auth.use('api').revoke()
      await UserDevicesRepo.model.query().where({user_id: user.id}).delete()
    }
    return super.apiResponse("Logged out successfully")
  }

  async register(input, ctx) {

    let data: any = {}
    let user = await UserRepo.model.updateOrCreate({
      email: input.email,
      is_verified: 0
    }, input)
    data.access_token = await ctx.auth.use('api').generate(user)

    /*
    * Save Device Token
    * */
    await UserDevicesRepo.store(ctx.request, user.id)

    /*
    * Send OTP
    * */
    await UserRepo.generateAndSendOTP(input.email, 'email');

    const roleId = ctx.request.input('role_id')


    /*
    * Attach user roles
    * */
    await user.related('roles').sync([roleId], false);

    if(roleId == Role.TYPES.VENDOR){
      const apiKey = crypto.randomBytes(16).toString('hex');
      const userBusinessDetail = {
        business_name: ctx.request.input('business_name'),
        business_address: ctx.request.input('business_address'),
        bank_account_number: ctx.request.input('bank_account_number'),
        bank_routing_number: ctx.request.input('bank_routing_number'),
        tax_id_number: ctx.request.input('tax_id_number'),
        api_key: apiKey
      }
      await user.related('userBusinessDetail').create(userBusinessDetail)
    }

    /*Send Welcome Email*/
    if (user.email) {
      await Mail.sendLater((message) => {
        message
          .from(constants.APP_NAME)
          .to(user.email)
          .subject('Welcome Onboard!')
          .htmlView('emails/welcome', {user: user, app_name: constants.APP_NAME})
      })
    }

    data.user = await UserRepo.show(user.id)

    return super.apiResponse(`A new user has been created successfully`, data)
  }

  async registerUser(ctx: HttpContextContract) {
    await super.validateBody(ctx,UserValidator)
    let fillables: any = UserRepo.fillables()
    let input = ctx.request.only(fillables)
    input.is_verified = 1
    return this.register(input, ctx)
  }



  async registerEndUserOrVendor(ctx: HttpContextContract) {
    //todo: Add middleware to restrict other users cannot be able to create restaurant Admin
    await super.validateBody(ctx,RegisterUserOrVendorValidator)
    let fillables: any = UserRepo.fillables()
    let input = ctx.request.only(fillables)
    return this.register(input, ctx)
  }


  async forgotPassword({request}: HttpContextContract) {
    await request.validate(ForgotPasswordValidator)
    let user = await UserRepo.model.findByOrFail('email', request.input('email'));

    let verification_code = Math.floor(1000 + Math.random() * 9000);
    await Mail.sendLater((message) => {
      message
        .from(constants.APP_NAME)
        .to(user.email)
        .subject('Forgot Password Verification Code')
        .htmlView('emails/verify', {
          name: user.full_name,
          app_name: constants.APP_NAME,
          verification_code
        })
    })
    await UserRepo.updateVerificationCode(user, verification_code)
    return super.apiResponse("Verification Code Send To Your Email")
  }

  async resendOTP(ctx: HttpContextContract) {
    await super.validateBody(ctx,ForgotPasswordValidator)
    let phone = ctx.request.input('phone')
    let email = ctx.request.input('email')

    if (email) {
      await UserRepo.generateAndSendOTP(email, 'email');
    } else if (phone) {
      await UserRepo.generateAndSendOTP(phone, 'phone');
    }
    return this.apiResponse("Code has been sent successfully")
  }

  async verifyOTP({request}) {
    await request.validate(VerifyOTPValidator)
    let phone = request.input('phone')
    let email = request.input('email')
    let user
    if (phone) {
      user = await UserRepo.model.query().where({
        verification_code: request.input('otp_code'),
        phone
      }).first()
    } else if (email) {
      user = await UserRepo.model.query().where({
        verification_code: request.input('otp_code'),
        email
      }).first()
    }
    if (user == null) {
      throw new ExceptionWithCode("Invalid OTP Code", 400)
    }

    user.merge({
      is_verified: 1
    })
    await user.save()

    return super.apiResponse("Code Verified", {user: user})
  }

  async resetPassword({request}) {
    await request.validate(ResetPasswordValidator)

    let user = await UserRepo.model.query().where({
      'email': request.input('email'),
      'verification_code': request.input('otp_code')
    }).first()
    if (user == null) {
      throw new ExceptionWithCode("Invalid OTP Code", 400)
    }

    user.password = request.input('password')
    user.verification_code = null
    await user.save()

    return super.apiResponse("Password Changed Successfully")
  }

  async changePassword({request, auth}) {
    await request.validate(ChangePasswordValidator)
    let user = await UserRepo.model.findOrFail(auth.user.id)
    let verify = await Hash.verify(user.password, request.input('current_password'))
    if (!verify) {
      throw new ExceptionWithCode("Wrong password", 400)
    }
    user.password = request.input('password')
    await user.save()
    return super.apiResponse("Password Changed Successfully")
  }

  async uniqueValidation(ctx) {
    await super.validateBody(ctx,UniqueValidation)
    // let otp_code:any = Math.round(Math.random() * (90000 - 10000) + 10000);
    let otp_code: any = '0000'
    let data = {
      verification_code: otp_code,
      email: ctx.request.input('email', null),
      phone: ctx.request.input('phone', null),
      is_completed: UserRepo.model.PROFILE_COMPLETE_STATUS.INCOMPLETE
    }
    await UserRepo.model.updateOrCreate({
      email: ctx.request.input('email', null),
      phone: ctx.request.input('phone', null),
      is_completed: UserRepo.model.PROFILE_COMPLETE_STATUS.INCOMPLETE
    }, data)

    if (ctx.request.input('email', null)) {
      await Mail.sendLater((message) => {
        message
          .from(constants.APP_NAME)
          .to(ctx.request.input('email', null))
          .subject('Verification Code!')
          .htmlView('emails/verification-code', {verification_code: otp_code})
      })
    }


    if (ctx.request.input('phone', null)) {
      /*
      * Send sms through twilio
      * */
    }

    return super.apiResponse("Verification code has been sent successfully!", {code: otp_code})
  }

  async socialLogin(ctx: HttpContextContract) {
    await super.validateBody(ctx,SocialLoginValidator)
    let fillables: any = UserRepo.fillables()
    let input = ctx.request.only(fillables)

    /*
    * Find User based on email
    * */
    let userExists = await this.repo.model.query().where({email:input.email, is_social_login: 0}).first()
    if(userExists) throw new ExceptionWithCode("You already have an account with your email. Continue with email instead.", 400)

    let socialAccount = await SocialAccountRepo.findSocialLogin(ctx.request)

    let user;
    if (socialAccount) {
      user = await UserRepo.model.query().where('id', socialAccount.user_id).first()
    }

    // let role_id = ctx.request.input('role_id')
    if (!user) {
      //let exists = await UserRepo.model.query().where({email: ctx.request.input('email')}).first()
      input.password = Math.random().toString(36).substring(2, 15)
      input.is_verified = 1;
      input.is_approved = 1;
      input.is_social_login = 1;
      user = await UserRepo.model.updateOrCreate({
        email: ctx.request.input('email', null)
      }, input)
      await user.related('roles').sync([Role.TYPES.USER])
      await SocialAccountRepo.store(ctx.request, user.id)

      if (input.image) {
        await UserRepo.model.query().where('id', user.id).update({image: input.image})
      }
    }


    await UserDevicesRepo.store(ctx.request, user.id)
    let token = await ctx.auth.use('api').generate(user)

    user = await UserRepo.show(user.id)

    return super.apiResponse(`Login Successfully`, {user, access_token: token})
  }

  async update(ctx: HttpContextContract, instanceType?: number): Promise<{ data: any; message: string; status: boolean }> {
    await super.validateBody(ctx,EditUserValidator)
    let input = ctx.request.only(this.repo.fillables(['establishment_id']))
    const res = await UserRepo.update(ctx.request.param('id'), input, ctx.request, instanceType || Attachment.TYPE[this.repo.model.name.toUpperCase()])
    return this.apiResponse('Record updated successfully!', res)
  }
}
