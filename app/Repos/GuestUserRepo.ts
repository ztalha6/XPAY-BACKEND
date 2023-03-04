import BaseRepo from 'App/Repos/BaseRepo'
import GuestUser from 'App/Models/GuestUser'
import {RequestContract} from '@ioc:Adonis/Core/Request'
import Payment from 'App/Models/Payment'
import ExceptionWithCode from 'App/Exceptions/ExceptionWithCode'


class GuestUserRepo extends BaseRepo {
  model

  constructor() {
    const relations = []
    const scopes = []
    super(GuestUser, relations, scopes)
    this.model = GuestUser
  }



  async sendVerificationCode(request : RequestContract) {

    /*Generate Verification Code*/
    // let verification_code = Math.floor(1000 + Math.random() * 9000);
    let verification_code = "0000"

    const payment = await Payment.query().where('id',request.input('transaction_id')).preload('guest_user').first()

    await GuestUser.updateOrCreate(
      {
        id: payment?.guest_user.id,
      },
      {
        verificationCode: verification_code
      }
    )
    return {
      guest_user_id: payment?.guest_user.id
    }
  }

  async verifyGuestUser(id, code) {
    const guestUser = await GuestUser.query()
      .where('id', id)
      .where('verification_code', code)
      .first()
    if (!guestUser) throw new ExceptionWithCode('Invalid Code', 422)
    guestUser.merge({
      verificationCode: null,
    })
    await guestUser.save()
    return this.show(id)
  }
}

export default new GuestUserRepo()
