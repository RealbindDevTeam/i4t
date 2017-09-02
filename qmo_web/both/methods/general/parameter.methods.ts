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
        },
        getPayuPaymentsUrl(): string {
            let url: string;
            return url = Parameters.findOne({ name: 'payu_payments_url' }).value;
        },
        getPayuReportUrl(): string {
            let url: string;
            return url = Parameters.findOne({ name: 'payu_reports_url' }).value;
        },
        getPublicIpServiceUrl(): string {
            let url: string;
            return url = Parameters.findOne({ name: 'ip_public_service_url' }).value;
        },
        getPayuPayInfoUrl(): string {
            let url: string;
            return url = Parameters.findOne({ name: 'payu_pay_info_url' }).value;
        }
    });
}