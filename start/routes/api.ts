import Route from '@ioc:Adonis/Core/Route'
import Role from 'App/Models/Role'
import Module from 'App/Models/Module'

/****************************
 * Route Prefixed with api/v1
 *****************************/

Route.group(() => {
  /****************************
   * UnAuthenticated Routes
   *****************************/
  /*Register End User*/
  Route.post('register-end-user', 'Api/UserController.registerEndUserOrVendor')
  /*Login*/
  Route.post('login', 'Api/UserController.login')
  /*Forgot Password*/
  Route.post('forgot-password', 'Api/UserController.forgotPassword')
  /*Resend OTP*/
  Route.post('resend-otp', 'Api/UserController.resendOTP')
  /*Verify OTP*/
  Route.post('verify-otp', 'Api/UserController.verifyOTP')
  /*Reset Password*/
  Route.post('reset-password', 'Api/UserController.resetPassword')

  /*Unique validation*/
  Route.post('unique-validation', 'Api/UserController.uniqueValidation')

  Route.post('social-login', 'Api/UserController.socialLogin')

  /*API-Payment*/
  Route.resource('initiate-payment','Api/PaymentController.initiatePayment')
  Route.resource('confirm-payment','Api/PaymentController.confirmPayment')


  /****************************
   * Authenticated Routes
   *****************************/

  Route.group(()=>{
    /*
    * Routes only accessible to Super admin, Restaurant admin and Establishment Users
    * */
    Route.group(()=>{

      /*
      * All User related Apis
      * */
      Route.group(()=>{
        /*Users*/
        Route.resource('users', 'Api/UserController').except(['store'])
        /*Create User or Register user*/
        Route.post('register', 'Api/UserController.registerUser')
        /*Change Password*/
        Route.post('change-password', 'Api/UserController.changePassword')
        /*API-Notification*/
        Route.resource('notifications', 'Api/NotificationController').only(['index', 'show'])

      }).middleware(`permissions:${Module.ITEMS.USER_MANAGEMENT}`)

      /* mark read */
      Route.post('mark-read/:id', 'Api/NotificationController.markRead')
      /* mark all read */
      Route.post('mark-all-read', 'Api/NotificationController.markAllRead')
      /* unread count */
      Route.get('get-unread-count', 'Api/NotificationController.unreadCount')


      /*Logout*/
      Route.post('/logout', 'Api/UserController.logout')

      /*
      * All Roles related Apis
      * */
      Route.group(()=>{
        /*API-Role*/
        Route.resource('roles','Api/RoleController')
        Route.get('restaurant-roles','Api/RoleController.restaurantRoles')

      }).middleware(`permissions:${Module.ITEMS.ROLE_MANAGEMENT}`)


      Route.group(()=>{
        /*API-Payment*/
        Route.resource('payments','Api/PaymentController')
      }).middleware([`permissions:${Module.ITEMS.PAYMENT}`])




    }).middleware(`roles:${Role.TYPES.ADMIN},${Role.TYPES.USER}`)





    /*
    * Routes only accessible to Super Admin
    * */
    Route.group(() => {

    }).middleware(`roles:${Role.TYPES.ADMIN}`)




    /*API-Module*/
    Route.resource('modules','Api/ModuleController')


    Route.get('test-notification', 'Api/NotificationController.test')

  }).middleware('auth')

  /*API-Page*/
  Route.resource('pages', 'Api/PageController').only(['index', 'show'])
  Route.get('page-by-slug/:slug', 'Api/PageController.pageBySlug')
  /*API-Setting*/
  Route.resource('settings', 'Api/SettingController').only(['index'])


}).prefix('/api/v1')




/*API-Day*/
Route.resource('days','Api/DayController')


/*API-GatewayTransaction*/
Route.resource('gateway-transactions','Api/GatewayTransactionController')




/*API-UserBusinessDetail*/
Route.resource('user-business-details','Api/UserBusinessDetailController')
