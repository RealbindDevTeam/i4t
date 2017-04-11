import { Roles } from '../../../../both/collections/auth/role.collection';
import { Role } from '../../../../both/models/auth/role.model';

export function loadRoles() {

    if(Roles.find().cursor.count() === 0 ){

        const roles: Role[] = [{
            _id: "100",
            is_active: true,
            name: "ROLE.ADMINISTRATOR",
            description: "restaurant administrator",
            menus: ["1000", "2000"]
        },{
            _id: "200",
            is_active: true,
            name: "ROLE.WAITER",
            description: "restaurant waiter",
            menus: []
        },{
            _id: "300",
            is_active: true,
            name: "ROLE.CASHIER",
            description: "restaurant cashier",
            menus: []
        },{
            _id: "400",
            is_active: true,
            name: "ROLE.CUSTOMER",
            description: "restaurant customer",
            menus: ["5000"]
        },{
            _id: "500",
            is_active: true,
            name: "ROLE.CHEF",
            description: "restaurant chef",
            menus: []
        },{
            _id: "600",
            is_active: true,
            name: "ROLE.SUPERVISOR",
            description: "restaurant chef",
            menus: []
        }];

        roles.forEach((role: Role) => Roles.insert(role));
    }
}