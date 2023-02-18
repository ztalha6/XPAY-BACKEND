import {beforeCreate, beforeUpdate, column, manyToMany, ManyToMany} from '@ioc:Adonis/Lucid/Orm'
import CommonModel from 'App/Models/CommonModel'
import Module from 'App/Models/Module'
import {HttpContext} from '@adonisjs/core/build/standalone'

export default class Role extends CommonModel {

  static TYPES = {
    ADMIN: 1,
    USER: 2,
    VENDOR: 3
  }

  @column()
  public id: number

  @column()
  public name: string

  @column()
  public displayName: string

  @column()
  public description: string

  @column()
  public establishmentId: string|null

  @column()
  public createdById: number

  @column()
  public updatedById: number

  /*
  * ######################### RELATIONS ##########################
  * */


  @manyToMany(()=> Module,{
    pivotTable:'role_permissions',
    pivotColumns: ['create','read','update','delete'], //By default pivot only include default pivot columns, but we need to explicitly mention other columns.
  })
  public permissions: ManyToMany<typeof Module>

  /*
    * ######################### HOOKS ##########################
    * */
  @beforeCreate()
  public static async setCreator (role:Role) {
    const ctx: any = HttpContext.get()
    const user = ctx.auth.use('api').user
    role.createdById = user.id
  }



  @beforeUpdate()
  public static async setUpdater (role:Role) {
    const ctx: any = HttpContext.get()
    const user = ctx.auth.use('api').user
    role.updatedById = user.id
  }

}
