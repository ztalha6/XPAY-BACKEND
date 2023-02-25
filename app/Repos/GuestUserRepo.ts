import BaseRepo from 'App/Repos/BaseRepo'
import GuestUser from "App/Models/GuestUser";


class GuestUserRepo extends BaseRepo {
    model

    constructor() {
        const relations = []
        const scopes = []
        super(GuestUser, relations, scopes)
        this.model = GuestUser
    }
}

export default new GuestUserRepo()