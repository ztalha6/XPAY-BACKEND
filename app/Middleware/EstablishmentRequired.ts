import type {HttpContextContract} from '@ioc:Adonis/Core/HttpContext'
import UnauthorizedAccess from 'App/Exceptions/UnauthorizedAccess'
import Role from 'App/Models/Role'
import ExceptionWithCode from 'App/Exceptions/ExceptionWithCode'

export default class EstablishmentRequired {
  public async handle({auth,request}: HttpContextContract, next: () => Promise<void>) {
    const user = auth.use('api').user
    if(!user) throw new UnauthorizedAccess()

    const roles:any = await user.related('roles').query()
    const exists = roles.find((role)=>role.id ===  Role.TYPES.RESTAURANT_ADMIN || role.id ===  Role.TYPES.USER
    )

    // const exists = await User.query().where({id: user.id}).whereHas('roles',(builder)=>{
    //   builder.whereIn('id',[Role.TYPES.ADMIN,Role.TYPES.RESTAURANT_ADMIN])
    // }).first()

    if(exists){
      const establishmentId = request.input('establishment_id',null)
      if(!establishmentId) throw new ExceptionWithCode("Establishment id is Required", 422)
    }
    await next()
  }
}
