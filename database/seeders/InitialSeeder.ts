import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import User from 'App/Models/User'
import Role from 'App/Models/Role'
import Module from 'App/Models/Module'
import constants from 'Config/constants'
import Day from 'App/Models/Day'
import axios from 'axios'
import Env from '@ioc:Adonis/Core/Env'
import Database from '@ioc:Adonis/Lucid/Database'
import Hash from '@ioc:Adonis/Core/Hash'

export default class InitialSeeder extends BaseSeeder {
  public async run() {

    /*
    * Roles
    * */
    await this.roles()

    /*
    * Modules
    * */
    await this.modules()

    /*
    * Roles Permission
    * */
    await this.permissions()

    /*
    * Register Admin
    * */
    await this.registerAdmin()

    /*
    * Days
    * */
    await this.days()

    /*
    * Update created_by and updated_by
    * */
    await this.updateCreators()
  }

  private password = 'Demo@123'

  async registerAdmin() {

    let input = {
      email: constants.SEEDER_CONSTANTS.ADMIN_EMAIL,
      password: await Hash.make(this.password),
      full_name: 'Admin',
      is_completed: User.PROFILE_COMPLETE_STATUS.COMPLETED,
      is_verified: 1
    }
    const user =await Database.table('users').insert(input)
    /*User Role*/
    await Database.table('role_user').insert({
      user_id: user[0],
      role_id: Role.TYPES.ADMIN
    })
  }

  /*
  * Role Seeder'
  * */

  async roles() {

    const data = [
      {
        name: 'admin',
        display_name: 'Super Admin'
      },
      {
        name: 'user',
        display_name: 'User'
      },
      {
        name: 'vendor',
        display_name: 'Vendor'
      }
    ]

    /*We are using Database insert method to avoid hitting create/update hook in role model*/
    await Database
      .table('roles')
      .multiInsert(data)
  }

  async days() {
    await Day.createMany([
      {
        name: 'Monday',
      },
      {
        name: 'Tuesday',
      },
      {
        name: 'Wednesday',
      },
      {
        name: 'Thursday',
      },
      {
        name: 'Friday',
      },
      {
        name: 'Saturday',
      },
      {
        name: 'Sunday',
      }
    ])
  }

  setGetAllPermissions(){
    return {
      [Module.ITEMS.DISPUTE_MANAGEMENT]: {
        create: 1,
        read: 1,
        update: 1,
        delete: 1,
      },
      [Module.ITEMS.USER_MANAGEMENT]: {
        create: 1,
        read: 1,
        update: 1,
        delete: 1,
      },
      [Module.ITEMS.PAYMENT]: {
        create: 1,
        read: 1,
        update: 1,
        delete: 1,
      },
      [Module.ITEMS.REPORTS]: {
        create: 1,
        read: 1,
        update: 1,
        delete: 1,
      },
      [Module.ITEMS.ROLE_MANAGEMENT]: {
        create: 1,
        read: 1,
        update: 1,
        delete: 1,
      },
    }
  }

  async modules() {
    await Module.createMany([
      {
        id: Module.ITEMS.DISPUTE_MANAGEMENT,
        name: 'Dispute Management',
      },
      {
        id: Module.ITEMS.REPORTS,
        name: 'Reports',
      },
      {
        id: Module.ITEMS.PAYMENT,
        name: 'Payments',
      },
      {
        id: Module.ITEMS.USER_MANAGEMENT,
        name: 'User Management',
      },
      {
        id: Module.ITEMS.ROLE_MANAGEMENT,
        name: 'Role Management',
      }
    ])
  }

  /*
  * Roles Permission
  * */

  async permissions(){
    const permissionsData = this.setGetAllPermissions()

    // Admin Roles
    const adminRole = await Role.query().where({id: Role.TYPES.ADMIN}).first()
    await adminRole?.related('permissions').sync(permissionsData)

  }


  async updateCreators(){
    const adminUser = await User.query().whereHas('roles',(builder)=>{
      builder.where({id: Role.TYPES.ADMIN})
    }).firstOrFail()

    await Role.query().update({
      created_by_id: adminUser.id,
      updated_by_id: adminUser.id,
    })

    await User.query().where('id', '>' , adminUser.id).update({
      created_by_id: adminUser.id,
      updated_by_id: adminUser.id,
    })
  }

  async login(email, password, roleId){
    const input = {
      "email":email,
      "password":password,
      "device_type":"web",
      "device_token":"api_fjakdlfjasklfjkasdlf",
      "role_id" : roleId
    }
    const url = `${Env.get('APP_URL')}api/v1/login`
    const axiosResponse:any = await axios({
      method: 'post',
      url,
      data:input
    }).catch((e)=>console.log(e.response?.data.message))

    return axiosResponse.data
  }
}
