import { CollectionObject } from '../collection-object.model';

export interface Menu extends CollectionObject {
    is_active: boolean;
    name: string;
    url: string;
    icon_name?: string;
    children?: Menu[];
}