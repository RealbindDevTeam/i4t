import { CollectionObject } from '../collection-object.model';

/**
 * Promotion model
 */
export interface Promotion extends CollectionObject {
    is_active: boolean;
    name: string;
    description?: string;
    promotionImageId: string;
    urlImage: string;
    promotionImageThumbId: string;
    urlImageThumb: string;
    restaurants: string[];
}

/**
 * Promotion Images model
 */
export interface PromotionImage {
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
 * Promotion Image Thumbs model
 */
export interface PromotionImageThumb extends PromotionImage {
    originalStore?: string;
    originalId?: string;
}