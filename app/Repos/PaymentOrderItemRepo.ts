import BaseRepo from 'App/Repos/BaseRepo'
import PaymentOrderItem from "App/Models/PaymentOrderItem";


class PaymentOrderItemRepo extends BaseRepo {
    model

    constructor() {
        const relations = []
        const scopes = []
        super(PaymentOrderItem, relations, scopes)
        this.model = PaymentOrderItem
    }
}

export default new PaymentOrderItemRepo()