import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Http, Headers } from "@angular/http";
import { CcRequestColombia } from '../../../../../../both/models/payment/cc-request-colombia.model';

@Injectable()
export class PayuPaymenteService {

    private payuReportsApiURI = 'https://sandbox.api.payulatam.com/reports-api/4.0/service.cgi';
    private payuPaymentsApiURI = 'https://sandbox.api.payulatam.com/payments-api/4.0/service.cgi';
    private ipPublicURI = 'https://api.ipify.org?format=json';

    private headers = new Headers({
        //'Host': 'sandbox.api.payulatam.com',
        'Content-Type': 'application/json;charset=utf-8',
        'Accept': 'application/json',
        //'Accept-language': 'es',
        //'Content-Length': 'length',
    });

    constructor(private http: Http) { }

    /**
     * This function sends the autorization and capture JSON to PayU platform
     * @param {CcRequestColombia} requestObject
     * @return {Observable}
     */
    authorizeAndCapture(requestObject: CcRequestColombia): Observable<any> {
        return this.http
            .post(this.payuPaymentsApiURI, JSON.stringify(requestObject), { headers: this.headers })
            .map(res => res.json())
            .catch(this.handleError);
    }

    /**
     * This functions queries the given transaction report of PayU platform
     * @param {Object} requestObject
     */
    getTransactionResponse(requestObject: any): Observable<any> {
        return this.http
            .post(this.payuReportsApiURI, JSON.stringify(requestObject), { headers: this.headers })
            .map(res => res.json())
            .catch(this.handleError);
    }

    /**
     * This function verify conectivity with Payu platform reports API 
     * @param  {any} obj
     * @return {Observable}
     */
    getReportsPing(obj: any): Observable<any> {
        return this.http
            .post(this.payuReportsApiURI,
            JSON.stringify(obj),
            { headers: this.headers })
            .map(res => res.json())
            .catch(this.handleError);
    }

    /**
     * This function verify conectivity with Payu platform payments API 
     * @param  {any} obj
     * @return {Observable}
     */
    getPaymentsPing(obj: any): Observable<any> {
        return this.http
            .post(this.payuReportsApiURI,
            JSON.stringify(obj),
            { headers: this.headers })
            .map(res => res.json())
            .catch(this.handleError);
    }

    /**
     * This function gets client public ip
     * @return {Observable<any>}
     */
    getPublicIp() {
        return this.http.get(this.ipPublicURI).map(res => res.json()).catch(this.handleError);
    }

    /**
     * This function emits the error generated in http request
     * @return {Observable<any>}
     */
    private handleError(error: any): Observable<any> {
        return Observable.throw(error.message || error);
    }
}