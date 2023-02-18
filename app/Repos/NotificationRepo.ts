import BaseRepo from 'App/Repos/BaseRepo'
import Notification from 'App/Models/Notification'

class NotificationRepo extends BaseRepo {
  model

  constructor() {
    const relations = []
    const scopes = ['authFilter']
    super(Notification, relations, scopes)
    this.model = Notification
  }


}

export default new NotificationRepo()
