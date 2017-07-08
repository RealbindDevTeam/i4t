import { Menus } from '../../../../both/collections/auth/menu.collection';
import { Menu } from '../../../../both/models/auth/menu.model';

export function loadMenus() {

    if (Menus.find().cursor.count() === 0) {

        const menus: Menu[] = [
            {
                _id: "900",
                is_active: true,
                name: "MENUS.DASHBOARD.DASHBOARD",
                url: "/app/dashboard",
                icon_name: "trending up",
                order: 900
            },
            {
                _id: "910",
                is_active: true,
                name: "MENUS.DASHBOARD.DASHBOARD",
                url: "/app/dashboards",
                icon_name: "trending up",
                order: 910
            },
            {
                _id: "1000",
                is_active: true,
                name: "MENUS.ADMINISTRATION.MANAGEMENT",
                url: "",
                icon_name: "supervisor account",
                order: 1000,
                children:
                [
                    {
                        _id: "1001",
                        is_active: true,
                        name: "MENUS.ADMINISTRATION.RESTAURANTS",
                        url: "/app/restaurant",
                        icon_name: "",
                        order: 1001
                    }, {
                        _id: "1002",
                        is_active: true,
                        name: "MENUS.ADMINISTRATION.TABLES",
                        url: "/app/tables",
                        icon_name: "",
                        order: 1002
                    }, {
                        _id: "1003",
                        is_active: true,
                        name: "MENUS.ADMINISTRATION.COLLABORATORS",
                        url: "/app/collaborators",
                        icon_name: "",
                        order: 1003
                    }, {
                        _id: "1004",
                        is_active: true,
                        name: "MENUS.ADMINISTRATION.MONTHLY_CONFIG",
                        url: "/app/monthly-config",
                        icon_name: "",
                        order: 1004
                    }
                ]
            },
            {
                _id: "1100",
                is_active: true,
                name: "MENUS.ADMINISTRATION.COLLABORATORS",
                url: "/app/collaborators",
                icon_name: "supervisor account",
                order: 1100
            },
            {
                _id: "2000",
                is_active: true,
                name: "MENUS.PAYMENTS.PAYMENTS",
                url: "",
                icon_name: "payment",
                order: 2000,
                children:
                [
                    {
                        _id: "2001",
                        is_active: true,
                        name: "MENUS.PAYMENTS.MONTHLY_PAYMENT",
                        url: "/app/monthly-payment",
                        icon_name: "",
                        order: 2001
                    },
                    {
                        _id: "2002",
                        is_active: true,
                        name: "MENUS.PAYMENTS.PAYMENT_HISTORY",
                        url: "/app/history-payment",
                        icon_name: "",
                        order: 2002
                    },
                    {
                        _id: "2003",
                        is_active: true,
                        name: "MENUS.PAYMENTS.REACTIVATE_RESTAURANT",
                        url: "/app/reactivate-restaurant",
                        icon_name: "",
                        order: 2003 
                    }
                ]
            },
            {
                _id: "3000",
                is_active: true,
                name: "MENUS.MENU_DEFINITION.MENU_DEFINITION",
                url: "",
                icon_name: "list",
                order: 3000,
                children:
                [
                    {
                        _id: "3001",
                        is_active: true,
                        name: "MENUS.MENU_DEFINITION.SECTIONS",
                        url: "/app/sections",
                        icon_name: "",
                        order: 3001
                    }, {
                        _id: "3002",
                        is_active: true,
                        name: "MENUS.MENU_DEFINITION.CATEGORIES",
                        url: "/app/categories",
                        icon_name: "",
                        order: 3002
                    }, {
                        _id: "3003",
                        is_active: true,
                        name: "MENUS.MENU_DEFINITION.SUBCATEGORIES",
                        url: "/app/subcategories",
                        icon_name: "",
                        order: 3003
                    }, {
                        _id: "3004",
                        is_active: true,
                        name: "MENUS.MENU_DEFINITION.ADDITIONS",
                        url: "/app/additions",
                        icon_name: "",
                        order: 3004
                    }, {
                        _id: "3005",
                        is_active: true,
                        name: "MENUS.MENU_DEFINITION.GARNISHFOOD",
                        url: "/app/garnishFood",
                        icon_name: "",
                        order: 3005
                    }, {
                        _id: "3006",
                        is_active: true,
                        name: "MENUS.MENU_DEFINITION.ITEMS",
                        url: "/app/items",
                        icon_name: "",
                        order: 3006
                    }, {
                        _id: "3007",
                        is_active: true,
                        name: "MENUS.MENU_DEFINITION.ITEMS_ENABLE",
                        url: "/app/itemsEnable",
                        icon_name: "",
                        order: 3007
                    }
                ]
            },
            {
                _id: "3100",
                is_active: true,
                name: "MENUS.MENU_DEFINITION.ITEMS_ENABLE",
                url: "/app/itemsEnable",
                icon_name: "done all",
                order: 3100
            },
            {
                _id: "4000",
                is_active: true,
                name: "MENUS.ORDERS",
                url: "/app/orders",
                icon_name: "dns",
                order: 4000
            },
            {
                _id: "5000",
                is_active: true,
                name: "MENUS.PAYMENTS",
                url: "/app/payments",
                icon_name: "local_atm",
                order: 5000
            },
            {
                _id: "6000",
                is_active: true,
                name: "MENUS.WAITER_CALL",
                url: "/app/waiter-call",
                icon_name: "record_voice_over",
                order: 6000
            },
            {
                _id: "7000",
                is_active: true,
                name: "MENUS.ADMINISTRATION.ORDERS_CHEF",
                url: "/app/chefOrders",
                icon_name: "dns",
                order: 7000
            }
        ];
        menus.forEach((menu: Menu) => Menus.insert(menu));
    }
}
