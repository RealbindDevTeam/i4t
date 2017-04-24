import { CollectionObject } from '../collection-object.model';

/**
 * Restaurant model
 */
export interface Restaurant extends CollectionObject {
    countryId: string;
    cityId: string;
    name: string;
    address: string;
    indicative: string;
    phone: string;
    webPage: string;
    email: string;
    restaurant_code: string;
    invoice_code: string;
    tip_percentage: number;
    tax_percentage: number;
    currencies: string[];
    paymentMethods: string[];     
    restaurantImageId: string;
    urlImage: string;
    location?: RestaurantLocation;
    schedule: RestaurantSchedule;
    tables_quantity: number;
    orderNumberCount: number;
    max_jobs?: number;
}

/**
 * RestaurantImage model
 */
export interface RestaurantImage { 
    _id?: string;
    complete: boolean;
    extension: string;
    name: string;
    progress: number;
    size: number;
    store: string;
    token: string;
    type: string;
    uploadedAt: Date;
    uploading: boolean;
    url: string;
    userId: string;
}

/**
 * RestaurantLocation model
 */
interface RestaurantLocation {
    lat: number;
    lng: number;
}

/**
 * RestaurantSchedule model
 */
export interface RestaurantSchedule {
    monday?: {
        isActive: boolean,
        opening_time: string,
        closing_time: string
    },
    tuesday?: {
        isActive: boolean,
        opening_time: string,
        closing_time: string
    },
    wednesday?: {
        isActive: boolean,
        opening_time: string,
        closing_time: string
    },
    thursday?: {
        isActive: boolean,
        opening_time: string,
        closing_time: string
    },
    friday?: {
        isActive: boolean,
        opening_time: string,
        closing_time: string
    },
    saturday?: {
        isActive: boolean,
        opening_time: string,
        closing_time: string
    },
    sunday?: {
        isActive: boolean,
        opening_time: string,
        closing_time: string
    }
};