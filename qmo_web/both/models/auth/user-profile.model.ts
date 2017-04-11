import { CollectionObject } from '../collection-object.model';

export class UserProfile {
    first_name?: string;
    last_name?: string;
    language_code?: string;
    image?: UserProfileImage;
}

export class UserProfileImage {
    complete: boolean;
    extension: string;
    name: string;
    progress: number;
    size: number;
    store: string;
    token: string;
    type: string;
    uploaded_at: Date;
    uploading: boolean;
    url: string;
}