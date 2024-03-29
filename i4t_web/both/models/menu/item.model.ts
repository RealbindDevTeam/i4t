import { CollectionObject } from '../collection-object.model';

/**
 * Item model
 */
export interface Item extends CollectionObject {
    is_active: boolean;
    sectionId: string;
    categoryId?: string;
    subcategoryId?: string;
    name: string;
    description: string;
    time: string;
    restaurants: ItemRestaurant[];
    prices: ItemPrice[];
    observations: boolean;
    image?: ItemImage;
    garnishFoodQuantity: number;
    garnishFood: string[];
    additions: string[];
}

/**
 * Item Images model
 */
export interface ItemImage {
    _id?: string;
    filename: string;
    handle: string;
    mimetype: string;
    originalPath: string;
    size: string;
    source: string;
    url: string;
    originalFile?: Object;
    status?: string;
    key?: string;
    container?: string;
    uploadId: string;
}

/**
 * Item Restaurant model
 */
export interface ItemRestaurant {
    restaurantId: string;
    price: number;
    itemTax?: number;
    isAvailable: boolean;
}

/**
 * Item Price model
 */
export interface ItemPrice {
    currencyId: string;
    price: number;
    itemTax?: number;
}