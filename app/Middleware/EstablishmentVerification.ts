import type {HttpContextContract} from '@ioc:Adonis/Core/HttpContext'

export default class EstablishmentVerification {
  public async handle({request, params}: HttpContextContract, next: () => Promise<void>) {
    // const allowedMethods = ['PUT','PATCH','DELETE','GET']
    // if(allowedMethods.includes(request.method())){
    //   const paramId = params.id
    //
    // }


    await next()
  }
}
