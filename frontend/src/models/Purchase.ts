export class Purchase {
    id: number;
    product_id: number;
    email: string;
    name: string;
    address: string;
    complement: string;
    city: string;
    state: string;
    cep: number;
    status: 'pending' | 'paid' | 'processing' | "shipped" | 'delivered' | 'canceled' | 'refunded' | 'failed';
    date: Date;

    constructor(
        id: number,
        product_id: number,
        email: string,
        name: string,
        address: string,
        complement: string,
        city: string,
        state: string,
        cep: number,
        status: 'pending' | 'paid' | 'processing' | "shipped" | 'delivered' | 'canceled' | 'refunded' | 'failed',
        date: Date
    ) {
        this.id = id;
        this.product_id = product_id;
        this.email = email;
        this.name = name;
        this.address = address;
        this.complement = complement;
        this.city = city;
        this.state = state;
        this.cep = cep;
        this.status = status;
        this.date = date;
    }
}
