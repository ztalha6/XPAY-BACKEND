import {column, computed} from '@ioc:Adonis/Lucid/Orm'
import CommonModel from 'App/Models/CommonModel'
import myHelpers from 'App/Helpers'

export default class Attachment extends CommonModel {

  static TYPE = {
    POST: 10,
    USER: 20,
    PROFILE_PICTURE: 21,
    CATEGORY: 30,
    PRODUCT: 40,
    RESTAURANT_CONTRACT_DOCUMENT: 50,
    RESTAURANT_TAX_CERTIFICATE: 51,
    RESTAURANT_TRADING_LICENCE: 52,
    PRODUCT_IMAGES: 60
  }

  static TYPE_TEXT = {
    [Attachment.TYPE.POST]: 'post',
    [Attachment.TYPE.USER]: 'user',
    [Attachment.TYPE.PROFILE_PICTURE]: 'profile-picture',
    [Attachment.TYPE.CATEGORY]: 'category',
    [Attachment.TYPE.PRODUCT]: 'product',
    [Attachment.TYPE.RESTAURANT_TRADING_LICENCE]: 'Restaurant Trading Licence',
    [Attachment.TYPE.RESTAURANT_TAX_CERTIFICATE]: 'Restaurant Tax Certificate',
    [Attachment.TYPE.RESTAURANT_CONTRACT_DOCUMENT]: 'Restaurant Contract Document',
  }

  @column({isPrimary: true})
  public id: number

  @column()
  public path: string

  @column()
  public instanceType: number

  @column()
  public instanceId: number

  @column()
  public mimeType: string

  @column()
  public duration: string

  @column()
  public thumbnail: string

  @computed()
  public get mediaUrl() {
    if (this.mimeType === 'url') {
      return this.path
    }
    return myHelpers.imageWithBaseURLOrNotFound(this.path)
  }

  @computed()
  public get smallImage() {
    if (this.mimeType === 'image')
      return myHelpers.getImageVersion(this.path, 'small')
  }

  @computed()
  public get mediumImage() {
    if (this.mimeType === 'image')
      return myHelpers.getImageVersion(this.path, 'medium')
  }

  @computed()
  public get thumbnailUrl() {
    if (this.mimeType === 'video')
      return myHelpers.imageWithBaseURLOrNotFound(this.thumbnail)
  }
}
