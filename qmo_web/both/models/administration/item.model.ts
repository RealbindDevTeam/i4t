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
    price: number;
    taxPercentage?: number;
    observations: boolean;
    itemImageId: string;
    urlImage: string;
    garnishFoodIsAcceped: boolean;
    garnishFoodQuantity: number;   
    garnishFood: string[];
    additionsIsAccepted: boolean;
    additions: string[];
    isAvailable: boolean;
}

/**
 * Item Images model
 */
export interface ItemImage {
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