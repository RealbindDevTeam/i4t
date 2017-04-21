import { Menus } from '../../../../both/collections/auth/menu.collection';
import { Menu } from '../../../../both/models/auth/menu.model';

export function loadMenus() {

    if (Menus.find().cursor.count() === 0) {

        const menus: Menu[] = [
            {
                _id: "1000",
                is_active: true,
                name: "MENUS.RESTAURANT.RESTAURANTS",
                url: "",
                icon_name: "view_list",
                children: 
                [
                    {
                        _id: "1001",
                        is_active: true,
                        name: "MENUS.RESTAURANT.MANAGEMENT",
                        url: "/app/restaurant",
                        icon_name: "",                        
                    },{
                        _id: "1002",
                        is_active: true,
                        name: "MENUS.RESTAURANT.TABLES",
                        url: "/app/tables",
                        icon_name: ""
                    },{
                        _id: "1003",
                        is_active: true,
                        name: "MENUS.RESTAURANT.COLLABORATORS",
                        url: "/app/collaborators",
                        icon_name: ""
                    }
                ]
            },
            {
                _id: "2000",
                is_active: true,
                name: "MENUS.ADMINISTRATION.ADMINISTRATION",
                url: "",
                icon_name: "view_list",
                children: 
                [
                    {
                        _id: "2001",
                        is_active: true,
                        name: "MENUS.ADMINISTRATION.SECTIONS",
                        url: "/app/sections",
                        icon_name: ""
                    },{
                       _id: "2002",
                        is_active: true,
                        name: "MENUS.ADMINISTRATION.CATEGORIES",
                        url: "/app/categories",
                        icon_name: ""
                    },{
                        _id: "2003",
                        is_active: true,
                        name: "MENUS.ADMINISTRATION.SUBCATEGORIES",
                        url: "/app/subcategories",
                        icon_name: ""
                    },{
                        _id: "2004",
                        is_active: true,
                        name: "MENUS.ADMINISTRATION.ADDITIONS",
                        url: "/app/additions",
                        icon_name: ""
                    },{
                        _id: "2005",
                        is_active: true,
                        name: "MENUS.ADMINISTRATION.PROMOTIONS",
                        url: "/app/promotions",
                        icon_name: ""
                    },{
                        _id: "2006",
                        is_active: true,
                        name: "MENUS.ADMINISTRATION.GARNISHFOOD",
                        url: "/app/garnishFood",
                        icon_name: ""
                    },{
                        _id: "2007",
                        is_active: true,
                        name: "MENUS.ADMINISTRATION.ITEMS",
                        url: "/app/items",
                        icon_name: ""
                    },{
                        _id: "2008",
                        is_active: true,
                        name: "MENUS.ADMINISTRATION.ITEMS_ENABLE",
                        url: "/app/itemsEnable",
                        icon_name: ""
                    },{
                        _id: "2009",
                        is_active: true,
                        name: "MENUS.ADMINISTRATION.ORDERS_CHEF",
                        url: "/app/chefOrders",
                        icon_name: ""
                    }
                ]
            },
            {
                _id: "3000",
                is_active: true,
                name: "MENUS.WAITER_CALL",
                url: "/app/waiter-call",
                icon_name: "record_voice_over"
            },
            {
                _id: "5000",
                is_active: true,
                name: "MENUS.ORDERS",
                url: "/app/orders",
                icon_name: "dns"
            },
            {
                _id: "6000",
                is_active: true,
                name: "MENUS.ADMINISTRATION.ORDERS_CHEF",
                url: "/app/chefOrders",
                icon_name: "dns"
            }
        ];

        menus.forEach((menu: Menu) => Menus.insert(menu));
    }
}
