import { CollectionObject } from '../collection-object.model';

/**
 * Iurest Invoice Model
 */
export interface IurestInvoice extends CollectionObject {
    number: string;
    generation_date: string;
    payment_method: string;
    description: string;
    period: string;
    amount_no_iva: string;
    subtotal: string;
    iva: string;
    total: string
    company_info: CompanyInfo;
    client_info: ClientInfo;
}

/**
 * Company  Info Model
 */
export interface CompanyInfo {
    name: string;
    address: string;
    phone: string;
    nit: string
    regime: string;
    contribution: string;
    retainer: string;
    generated_computer_msg: string;
    resolution_number: string;
    resolution_prefix: string;
    resolution_start_date: string;
    resolution_end_date: string;
    resolution_start_value: string;
    resolution_end_value: string;
}

/**
 * Client Info Model
 */
export interface ClientInfo {
    name: string;
    address: string;
    city: string;
    country: string;
    identification: string;
    phone: string;
    email: string;
}
