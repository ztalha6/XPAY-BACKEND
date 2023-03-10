// import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import BaseRepo from 'App/Repos/BaseRepo'
import Attachment from 'App/Models/Attachment';

class AttachmentRepo extends BaseRepo {
    model

    constructor() {
        const relations = []
        const scopes = []
        super(Attachment, relations, scopes)
        this.model = Attachment
    }
}

export default new AttachmentRepo()
