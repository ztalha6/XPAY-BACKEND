'use strict'

import Env from '@ioc:Adonis/Core/Env'
import constants from "Config/constants";
import Logger from '@ioc:Adonis/Core/Logger'
import VideoProcessor from "App/Repos/VideoProcessor";
import Application from '@ioc:Adonis/Core/Application'
import UserDevice from "App/Models/UserDevice";
import Notification from "App/Models/Notification";

const ImageResizer = require('node-image-resizer')
const FCM = require('fcm-node');
const fs = require('fs');
const AWS = require('aws-sdk');
const sharp = require('sharp');


export default {
  /*Log message*/
  logMsg(msg: any) {
    return {
      timestamp: new Date().getTime(),
      msg
    }
  },
  async resizeImage(sourcePath, sourceImage, destinationPath = null) {
    destinationPath = destinationPath || sourceImage
    const setup = {
      all: {
        path: destinationPath,
        quality: 100
      },
      versions: [{
        prefix: 'medium_',
        width: constants.IMAGE_RESIZE.MEDIUM
      }, {
        quality: 100,
        prefix: 'small_',
        width: constants.IMAGE_RESIZE.SMALL
      }]
    }
    ImageResizer(sourcePath + sourceImage, setup)
  },
  async uploadFile(file, path): Promise<any> {
    let uploadChannel = constants.UPLOAD_CHANNEL
    switch (uploadChannel) {
      case 'local':
        return await this.uploadFileLocally(file, path)
      case 's3':
        return await this.uploadFileS3(file, path)
    }
  },
  async uploadFileLocally(file, dir): Promise<object> {
    let random_name = `${new Date().getTime() * (Math.round(Math.random() * 1000))}.${file.extname}`
    let uploadPath = Application.makePath('public/') + dir;
    if (file.hasErrors) {
      throw new Error(file.errors[0].message)
    }
    await file.move(Application.makePath('public/'), {
      name: dir + random_name,
      overwrite: true
    })

    /*
    * Create Multiple Variants of Image
    * */
    if (file.type === 'image') {
      await this.resizeImage(uploadPath, random_name, uploadPath)
    }

    /*
    * Video Thumbnail and Duration
    * */
    let sourceFile = `${Application.makePath('public/') + file.fileName}`
    let videoProcessingOutput = await this.videoThumbnailAndDuration(file, sourceFile)

    return {
      path: file.fileName,
      duration: videoProcessingOutput.duration,
      thumbnail: videoProcessingOutput.thumbnail,
      type: file.type
    };
  },
  async videoThumbnailAndDuration(file, sourcePath) {
    /*
    * Handling video thumbnail and duration
    * */

    let output: any = {
      duration: null,
      thumbnail: null
    }
    if (file.type === 'video') {
      if (constants.SETTINGS.VIDEO_DURATION) {
        output.duration = await VideoProcessor.getVideoDurations(sourcePath)
      }

      if (constants.SETTINGS.VIDEO_THUMBNAIL) {
        let thumbnailOutputPath = `video-thumbnails/${new Date().getTime() * (Math.round(Math.random() * 1000))}.jpg`
        output.thumbnail = await VideoProcessor.getVideoThumbnail(sourcePath, thumbnailOutputPath, 1000)
      }
    }
    return output
  },
  async sendNotificationStructure(user_id, ref_id, type, title = null, msg) {
    let notification: any;
    let payload: any;
    let devices = await UserDevice.query()
      .where('user_id', user_id)
      .whereHas('user', (query) => {
        query.where('push_notification', 1)
      })
    payload = {
      notifiable_id: user_id,
      ref_id: ref_id,
      type: type,
      title: title ? title : constants.APP_NAME,
      message: msg
    }
    notification = await Notification.create(payload)
    payload.notification_id = notification.id
    if (devices.length > 0) {
      this.sendNotification(constants.APP_NAME, msg, payload, devices)
    }
  },
  async sendNotification(title:string = "", body:string = "null", payload: any = {}, devices: UserDevice[]) {

    var serverKey = constants.FCM_KEY;
    var fcm = await new FCM(serverKey);

    let iosTokens = devices.flatMap((device) => device.platform === 'ios' ? device.deviceToken : [])
    let androidTokens = devices.flatMap((device) => device.platform === 'android' ? device.deviceToken : [])

    /*FOR ANDROID*/
    if (androidTokens && androidTokens.length > 0) {
      let message = { //this may vary according to the message type (single recipient, multicast, topic, et cetera)
        registration_ids: androidTokens,
        data: {
          title: title,
          body: body,
          sound: 'default',
          payload,
          click_action : "FLUTTER_NOTIFICATION_CLICK"
        },
        notification: {
          title: title,
          body: body,
          sound: 'default',
          payload,
          click_action : "FLUTTER_NOTIFICATION_CLICK"
        },
      };

      fcm.send(message, function (err, response) {
          if (err) {
            Logger.error(err)
          } else {
            Logger.info(response)
          }
        }
      );
    }


    /*FOR IOS*/
    if (iosTokens && iosTokens.length > 0) {
      let message = { //this may vary according to the message type (single recipient, multicast, topic, et cetera)
        registration_ids: iosTokens,
        notification: {
          title: title,
          body: body,
          sound: 'default',
          payload
        },
        data: {
          title: title,
          body: body,
          payload
        },
      }

      fcm.send(message, function (err, response) {
          if (err) {
            console.log("FCM Error")
            Logger.error(err)
          } else {
            Logger.info(response)
          }
        }
      )
    }
  },
  /* async sendWebSocketNotification(title, body) {

       let topic = Ws.getChannel('notification:*').topic('notification:subscribedUser')
       if (topic) {
           /!*notification data*!/
           let notificationData = {
               // title: _.truncate(title, {length: 40}),
               title,
               body: _.truncate(body, {length: 85})
           }

           /!*send notification to users*!/
           topic.broadcast('newNotification', notificationData)
       }
   },*/

  /*  async sendWsNotificationToUser(title, body, userId) {

        /!*Saving data*!/
        // await Notification.create({
        //     to_user: userId,
        //     title: title,
        //     body: body
        // })

        /!*Live Broadcasting *!/
        let topic = Ws.getChannel('notification:*').topic('notification:user' + userId)
        if (topic) {
            /!*notification data*!/
            let notificationData = {
                title,
                body
            }

            /!*send notification to users*!/
            topic.broadcast('newNotification', notificationData)


        }
    },*/
  async uploadFileS3(file, path) {
    /* INSTRUCTIONS */
    // - use env(S3_URL) for full url
    // for medium variation
    // let medium_image = image.split("/")
    // let path = medium_image[0] + '/medium_' + medium_image[1]
    /* END INSTRUCTIONS */


    let fileName = file.tmpPath
    let random_name = `${new Date().getTime() * (Math.floor(Math.random() * 1000))}.${file.extname}`

    const s3 = await new AWS.S3({
      accessKeyId: Env.get('S3_KEY'),
      secretAccessKey: Env.get('S3_SECRET')
    });
    // Read content from the file
    const fileContent = fs.readFileSync(fileName);

    // Setting up S3 upload parameters
    const params: any = {
      Bucket: Env.get('S3_BUCKET'),
      ACL: 'public-read'
    };
    await sharp(fileName).resize(constants.IMAGE_RESIZE.MEDIUM).toBuffer()
      .then(async buffer => {
        params.Body = buffer;
        params.Key = path + "medium_" + random_name;
        s3.upload(params, (err, data) => {
          err ? Logger.error(err) : Logger.info(data)
        });
      }).catch(function (err) {
        console.log("Got Error", err);
      });
    await sharp(fileName).resize(constants.IMAGE_RESIZE.MEDIUM).toBuffer()
      .then(async buffer => {
        params.Body = buffer;
        params.Key = path + "small_" + random_name;
        s3.upload(params, (err, data) => {
          err ? Logger.error(err) : Logger.info(data)
        });
      }).catch(function (err) {
        console.log("Got Error", err);
      });
    let response: any = await new Promise((resolve, reject) => {
      params.Key = path + random_name;
      params.Body = fileContent;
      s3.upload(params, (err) => {
        if (err) {
          return reject({
            error: true,
            message: err,
          })
        }
        return resolve({
          success: true,
          data: path + random_name
        })
      });
    })

    return {
      path: response ? response.data : null,
      type: file.type
    };
  },
  async deleteS3Object(path) {
    const s3 = await new AWS.S3({
      accessKeyId: Env.get('S3_KEY'),
      secretAccessKey: Env.get('S3_SECRET')
    });
    var params = {
      Bucket: Env.get('S3_BUCKET'),
      Key: path
    };
    s3.deleteObject(params, function (err: any, _data: any) {
      if (err) Logger.error(err)
    });
    // delete mediuim
    let medium_image = path.split("/")
    let medium_path = medium_image[0] + '/medium_' + medium_image[1]
    params.Key = medium_path;
    s3.deleteObject(params, function (err: any, _data: any) {
      if (err) Logger.error(err)
    });
    // delete small
    let small_image = path.split("/")
    let small_path = small_image[0] + '/small_' + small_image[1]
    params.Key = small_path;
    s3.deleteObject(params, function (err: any, _data: any) {
      if (err) Logger.error(err)
    });
  },
  getImageVersion(imagePath, version) {
    let fileArray = imagePath.split('/')
    let fileName = ""
    fileName = fileArray[fileArray.length - 1]
    let newName = version + '_' + fileName
    imagePath = imagePath.replace(fileName, newName)
    return this.imageWithBaseURLOrNotFound(imagePath)
  },
  imageWithBaseURLOrNotFound(newImage) {
    if (newImage && newImage.includes("http")) {
      return newImage
    }
    switch (constants.UPLOAD_CHANNEL) {
      case 'local':
        if (fs.existsSync(Application.makePath('public/') + newImage)) {
          return Env.get('APP_URL') + newImage
        } else {
          return Env.get('APP_URL') + constants.IMAGE_NOT_FOUND
        }
      case 's3':
        return constants.S3_URL + newImage
    }
  },
  randomString() {
    return (Math.random() + 1).toString(36).substring(7).toUpperCase();
  },
  /*convertLanguage(language, module, field) {

  }*/
}
