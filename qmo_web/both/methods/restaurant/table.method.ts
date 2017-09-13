import { Meteor } from 'meteor/meteor';
import { Table } from '../../models/restaurant/table.model';
import { Tables } from '../../collections/restaurant/table.collection';

Meteor.methods({
    getCurrentTableByUser: function (_idTable) {
        let table = Tables.collection.findOne({ _id: _idTable });
        if (typeof table != "undefined" || table != null) {
            return table;
        } else {
            return null;
        }
    },

    getIdTableByQr: function (_qrCode) {
        let table = Tables.collection.findOne({ QR_code: _qrCode });
        if (typeof table != "undefined" || table != null) {
            return table._id;
        } else {
            return null;
        }
    }
})