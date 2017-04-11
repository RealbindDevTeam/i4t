import { CollectionObject } from '../collection-object.model';

export interface UserDetail extends CollectionObject{
    user_id: string;
    role_id: string;
    is_active: boolean;

    restaurant_work?: string;
    penalties?: UserDetailPenalty[];
    current_restaurant?: string;
    current_table?: string;
    birthdate? : Date; 
    phone? : string;
    enabled? : boolean;
}

export interface UserDetailPenalty extends CollectionObject{
    is_active: boolean;
    penalty_count: number;
    cause: string;
}