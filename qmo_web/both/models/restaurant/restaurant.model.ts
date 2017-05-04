import { CollectionObject } from '../collection-object.model';

/**
 * Restaurant model
 */
export interface Restaurant extends CollectionObject {
    countryId: string;
    cityId: string;
    name: string;
    currencyId: string;
    address: string;
    indicative: string;
    phone: string;
    webPage: string;
    email: string;
    restaurant_code: string;
    financialInformation: Object;
    paymentMethods: string[];
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
    restaurantId: string;
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

/**
 * RestaurantTurn model
 */
export interface RestaurantTurn extends CollectionObject {
    restaurant_id : string,
    turn : number,
    last_waiter_id : string,
}

/**
 * RestaurantFinancialElement Model
 */
export interface RestaurantFinancialElement {
    value?: any;
    key?: string;
    label?: string;
    required?: boolean;
    order?: number;
    controlType?: string;
    options?: { key: string, value: string }[];
    minValue?: number;
    maxValue?: number;
    stepValue?: number;
}