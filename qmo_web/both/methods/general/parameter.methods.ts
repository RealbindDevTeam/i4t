import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { Parameters } from '../../collections/general/parameter.collection';
import { Parameter } from '../../models/general/parameter.model';


export function getPayuMerchantInfo(): string[] {
    let credentialList: string[] = [];
    //TODO implements functions to encode credentials
    credentialList[0] = 'pRRXKOl8ikMmt9u';
    credentialList[1] = '4Vj8eK4rloUd272L48hsrarnUA';

    return credentialList;
}

if (Meteor.isServer) {
    Meteor.methods({
        getPayuMerchantData(): string[] {
            let credentialList: string[] = [];

            //TODO implements functions to encode credentials
            credentialList[0] = 'pRRXKOl8ikMmt9u';
            credentialList[1] = '4Vj8eK4rloUd272L48hsrarnUA';

            return credentialList;
        }
    });
}