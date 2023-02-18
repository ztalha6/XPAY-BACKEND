import {
  beforeCreate,
  beforeSave,
  beforeUpdate,
  column,
  HasOne,
  hasOne,
  ManyToMany,
  manyToMany,
} from '@ioc:Adonis/Lucid/Orm'
import Hash from '@ioc:Adonis/Core/Hash'
import CommonModel from 'App/Models/CommonModel'
import Role from 'App/Models/Role'
import {HttpContext} from '@adonisjs/core/build/standalone'
import UserBusinessDetail from 'App/Models/UserBusinessDetail'

export default class User extends CommonModel {
  public serializeExtras = true

  static PROFILE_COMPLETE_STATUS = {
    COMPLETED : 10
  }

  static DEVICE_TYPES = {
    WEB: 'web',
    MOBILE: 'mobile'
  }

  /*For pos notification purpose*/
  static PLATFORM = {
    IOS: 'ios',
    ANDROID: 'android',
    WEB: 'web'
  }

  static END_USER_TYPES = {
    USER: 10,
    VENDOR: 20
  }

  @column({isPrimary: true})
  public id: number

  @column()
  public fullName: string

  @column()
  public email: string

  @column({
    serializeAs: null
  })
  public password: string

  @column()
  public isVerified: number

  @column()
  public isCompleted: number

  @column()
  public phone: string

  @column()
  public image: string

  @column()
  public isSocialLogin: number

  @column()
  public isApproved: number

  @column()
  public pushNotification: number

  @column()
  public createdById: number

  @column()
  public updatedById: number


  @beforeSave()
  public static async hashPassword(user: User) {
    if (user.$dirty.password) {
      user.password = await Hash.make(user.password)
    }
  }


  //Many To Many Role
  @manyToMany(() => Role,{
    onQuery: query => query.preload('permissions')
  })
  public roles: ManyToMany<typeof Role>

  @hasOne(() => UserBusinessDetail)
  public userBusinessDetail: HasOne<typeof UserBusinessDetail>


  /*
  * ######################### SCOPES ##########################
  * */


  /*
  * ######################### HOOKS ##########################
  * */

  // @beforeDelete()
  // public static async selfDeleteCheck(){
  //   const ctx: any = HttpContext.get()
  //
  // }
  @beforeCreate()
  public static async setCreator (users:User) {
    const ctx: any = HttpContext.get()
    const user = ctx.auth.use('api').user
    users.createdById = user?.id || null
  }

  @beforeUpdate()
  public static async setUpdater (users:User) {
    const ctx: any = HttpContext.get()
    const user = ctx.auth.use('api').user
    users.updatedById = user?.id || null
  }
}
