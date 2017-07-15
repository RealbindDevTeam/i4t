import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Http, Headers } from "@angular/http";
import { CcRequestColombia } from '../../../../../../both/models/payment/cc-request-colombia.model';

@Injectable()
export class PayuPaymenteService {

    private apiReportsApiURI = 'https://sandbox.api.payulatam.com/reports-api/4.0/service.cgi';
    private payuPaymentsApiURI = 'https://sandbox.api.payulatam.com/payments-api/4.0/service.cgi';

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
            .post(this.payuPaymentsApiURI, JSON.stringify(requestObject),{headers: this.headers})
            .map(res => res.json())
            .catch(this.handleError);
    }

    /**
     * This function sends the autorization and capture JSON to PayU platform
     * @param  {any} obj
     * @return {Observable}
     */
    getTestPing(obj: any): Observable<any> {
        return this.http
            .post(this.apiReportsApiURI,
            JSON.stringify(obj),
            { headers: this.headers })
            .map(res => res.json())
            .catch(this.handleError);
    }

    private handleError(error: any): Observable<any> {
        console.error('An error occurred', error); // for demo purposes only
        return Observable.throw(error.message || error);
    }
}