import {IMap} from "@elium/mighty-js";
import {Observable, Observer} from "rxjs/Rx";
import {IDataLayer, IHttpRequest, IHttpResponse, HttpRequest, HttpResponse} from '@elium/mighty-http-adapter';
import {ResponseRedirect} from 'hapi';

export interface IXhrLayer extends IDataLayer {}

export class XhrLayer implements IXhrLayer {

  public findOne(request: IHttpRequest): Observable<IHttpResponse> {
    const localRequest: IHttpRequest = request.merge(<IHttpRequest> {method: "GET"});
    return this._query(localRequest);
  }

  public find(request: IHttpRequest): Observable<IHttpResponse> {
    const localRequest: IHttpRequest = request.merge(<IHttpRequest> {method: "GET", isArray: true});
    return this._query(localRequest);
  }


  public create(request: IHttpRequest): Observable<IHttpResponse> {
    const localRequest: IHttpRequest = request.merge(<IHttpRequest> {method: "POST"});
    return this._query(localRequest);
  }


  public save(request: IHttpRequest): Observable<IHttpResponse> {
    const localRequest: IHttpRequest = request.merge(<IHttpRequest> {method: "PUT"});
    return this._query(localRequest);
  }


  public destroy(request: IHttpRequest): Observable<IHttpResponse> {
    const localRequest: IHttpRequest = request.merge(<IHttpRequest> {method: "DELETE"});
    return this._query(localRequest);
  }


  /**
   * Query a url with the specified request.
   * @param request
   * @return {Observable}
   */
  protected _query(request: IHttpRequest): Observable<IHttpResponse> {
    const localRequest = new HttpRequest(request);
    return new Observable((observer: Observer<IHttpResponse>) => {
      const xhr = new XMLHttpRequest();

      if (localRequest.params) {
        localRequest.url += this._toQueryString(localRequest.params);
      }
      xhr.open(localRequest.method, localRequest.url, true);

      let data: any = localRequest.data;
      if (localRequest.method.toUpperCase() === "GET") {
        data = null;
      } else {
        Object.assign(localRequest.headers, {
          "Content-Type": "application/json"
        });
        data = JSON.stringify(localRequest.data);
      }

      xhr.onreadystatechange = () => this._checkResponse(localRequest, xhr, observer);
      Object.keys(localRequest.headers).forEach((key) => xhr.setRequestHeader(key, localRequest.headers[key]));

      xhr.send(data || null);
    });
  }


  /**
   * Check the response of the request and fullfill the Observable.
   * @param request
   * @param xhr
   * @param observer
   * @private
   */
  private _checkResponse(request: IHttpRequest, xhr: XMLHttpRequest, observer: Observer<IHttpResponse>) {
    if (xhr.readyState === 4) {
      const response = new HttpResponse();
      if (xhr.status === 0 || xhr.status >= 200 && xhr.status < 400) {
        try {
          response.data = JSON.parse(xhr.responseText);
        } catch (error) {
          debugger;
          response.error = new Error("Could not parse response : " + xhr.responseText);
        }
        if (request.isArray && !Array.isArray(response.data)) {
          response.data = null;
          response.error = new Error("Result is not an array, got : " + xhr.responseText);
        }
      } else {
        response.error = new Error(xhr.responseText);
      }
      if (response.error) {
        observer.error(response);
      } else {
        observer.next(response);
      }
    }
  }


  /**
   * Parse a json object and returns a, encoded query string.
   * @param params
   * @return {string}
   * @private
   */
  private _toQueryString(params) {
    const parts: Array<String> = [];
    if(parts.length > 0) {
      Object.keys(params).forEach((key: string) => {
        parts.push(encodeURIComponent(key) + "=" + encodeURIComponent(params[key]));
      });
      return "?" + parts.join("&");
    } else {
      return "";
    }
  }
}
