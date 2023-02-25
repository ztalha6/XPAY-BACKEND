import BaseRepo from 'App/Repos/BaseRepo'
import Payment from 'App/Models/Payment'
import {RequestContract} from '@ioc:Adonis/Core/Request'
import UserBusinessDetail from 'App/Models/UserBusinessDetail'
import ExceptionWithCode from 'App/Exceptions/ExceptionWithCode'
import Env from '@ioc:Adonis/Core/Env'
import {HttpContext} from '@adonisjs/core/build/standalone'
import GuestUser from 'App/Models/GuestUser'
import Database from '@ioc:Adonis/Lucid/Database'

const stripe = require('stripe')(Env.get('STRIPE_SECRET'))

class PaymentRepo extends BaseRepo {
  model

  constructor() {
    const relations = ['payment_order_items']
    const scopes = []
    super(Payment, relations, scopes)
    this.model = Payment
  }

  async getPaymentByUser(id) {
    const ctx: any = HttpContext.get()
    const relations = ctx.request.input('relations',[])

    let query = this.model.query()
    for (let relation of [...this.relations, ...relations]) query.preload(relation)
    for (let scope of this.scopes) query.withScopes((scopeBuilder) => scopeBuilder[scope].call())
    const res = await query.select('id','amount','status').where({id}).firstOrFail()
    return res
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

    const userPhone = ctx.request.input('user_phone')

    let guestUser = await GuestUser.updateOrCreate({
      phone: userPhone
    }, {
      phone: userPhone
    })

    // const paymentMethod = await stripe.paymentMethods.create({
    //   type: 'card',
    //   card: {
    //     number: '4242424242424242',
    //     exp_month: 8,
    //     exp_year: 2023,
    //     cvc: '314',
    //   },
    // });

    const paymentIntent = await stripe.paymentIntents.create({
      amount: input.amount,
      currency: 'usd',
      payment_method: input.payment_method_id, // add payment method here
    })

    return {payment_intent_id : paymentIntent.id,client_secret: paymentIntent.client_secret,guest_user_id: guestUser.id}
  }

  async confirmPayment(input, request? : RequestContract, _instanceType?: number, _deleteOldMedia = false, _trx?: any) {
    const payment: Payment = await Database.transaction(async (trx) => {
      const vendorApiKey = request?.header('x-api-key')
      const ctx: any = HttpContext.get()

      if(!vendorApiKey) throw new ExceptionWithCode('Invalid vendor',400)

      // Verify the vendor API key
      const vendor = await UserBusinessDetail.query().where('api_key', vendorApiKey).first()
      if (!vendor) {
        throw new ExceptionWithCode('Invalid vendor',400)
      }

      const guestUserId = ctx.request.input('guest_user_id')
      const paymentOrderItems = ctx.request.input('payment_order_items', [])


      // Use the Stripe API to confirm the payment
      const paymentIntent = await stripe.paymentIntents.confirm(input.payment_intent_id, {
        payment_method: input.payment_method_id
      });
      if (paymentIntent.status !== 'succeeded') {
        throw new ExceptionWithCode('Payment failed',400)
      }

      let row = await this.model.create({
        vendor_id: vendor.id,
        guest_user_id: guestUserId,
        payment_method_id: paymentIntent.payment_method,
        payment_intent_id: paymentIntent.id,
        status : paymentIntent.status,
        amount : paymentIntent.amount / 100,
      }, {client: trx})
      await row.related('payment_order_items').createMany([...paymentOrderItems])

      return row
    })

    return {payment_status: payment.status}
  }
}

export default new PaymentRepo()
