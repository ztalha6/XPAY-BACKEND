import BaseRepo from 'App/Repos/BaseRepo'
import Payment from 'App/Models/Payment'
import {RequestContract} from '@ioc:Adonis/Core/Request'
import UserBusinessDetail from 'App/Models/UserBusinessDetail'
import ExceptionWithCode from 'App/Exceptions/ExceptionWithCode'
import Env from '@ioc:Adonis/Core/Env'
import User from 'App/Models/User'
import {HttpContext} from '@adonisjs/core/build/standalone'
import Role from 'App/Models/Role'

const stripe = require('stripe')(Env.get('STRIPE_SECRET'))

class PaymentRepo extends BaseRepo {
  model

    constructor() {
        const relations = []
      const scopes = []
      super(Payment, relations, scopes)
        this.model = Payment
    }

  async initiatePayment(input, request? : RequestContract, _instanceType?: number, _deleteOldMedia = false, _trx?: any) {
    const vendorApiKey = request?.header('x-api-key')
    const ctx: any = HttpContext.get()

    if(!vendorApiKey) throw new ExceptionWithCode('Invalid vendor',400)

    // Verify the vendor API key
    const vendor = await UserBusinessDetail.query().where('api_key', vendorApiKey).first()
    if (!vendor) {
      throw new ExceptionWithCode('Invalid vendor',400)
    }

    const userPhone = ctx.request.input('user-phone')

    const user = await User.query().whereHas('roles', (rolesQuery) => {
      rolesQuery.where('id', Role.TYPES.USER)
    }).where('phone',userPhone).first()

    if(!user) throw new ExceptionWithCode('User not found',400)

    const paymentIntent = await stripe.paymentIntents.create({
      amount: input.amount,
      currency: 'usd',
      payment_method: input.payment_method_id, // add payment method here
    })

    return {payment_intent_id : paymentIntent.id,client_secret: paymentIntent.client_secret,user_id: user.id}
  }

  async confirmPayment(input, request? : RequestContract, _instanceType?: number, _deleteOldMedia = false, trx?: any) {
    const vendorApiKey = request?.header('x-api-key')
    const ctx: any = HttpContext.get()

    if(!vendorApiKey) throw new ExceptionWithCode('Invalid vendor',400)

    // Verify the vendor API key
    const vendor = await UserBusinessDetail.query().where('api_key', vendorApiKey).first()
    if (!vendor) {
      throw new ExceptionWithCode('Invalid vendor',400)
    }

    const userId = ctx.request.input('user-id')

    const user = await User.query().whereHas('roles', (rolesQuery) => {
      rolesQuery.where('id', Role.TYPES.USER)
    }).where('id',userId).first()

    if(!user) throw new ExceptionWithCode('User not found',400)

    // Use the Stripe API to confirm the payment
    const paymentIntent = await stripe.paymentIntents.confirm(input.payment_method_id, {
      payment_method: input.payment_method_id
    });
    if (paymentIntent.status !== 'succeeded') {
      throw new ExceptionWithCode('Payment failed',400)
    }

    let row = await this.model.create({
      vendor_id: vendor.id,
      user_id: user.id,
      payment_method_id: paymentIntent.payment_method,
      payment_intent_id: paymentIntent.id,
      status : paymentIntent.status,
      amount : paymentIntent.amount / 100,
      last_payment_error: paymentIntent.last_payment_error
    }, {client: trx})

    return {payment_status: row.status}
  }
}

export default new PaymentRepo()
