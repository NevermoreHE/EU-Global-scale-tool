import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { catchError, Observable, throwError } from "rxjs";
import { environment } from "../../environments/environment";
import { UserService } from "../services/user.service";
import { AlertService } from "../services/alert.service";


@Injectable({
  providedIn: 'root'
})
export class TokenInterceptorService implements HttpInterceptor{

constructor(private userService: UserService,
  private alertService: AlertService
) { }
 
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    const whitelist =[
      'https://keycloak.nevermore.simavi.ro/realms/nevermore/protocol/openid-connect/token',
      environment.websocket
    ]
    // We need a whitelist of urls because the token api breaks if we send a token header to it
    if ((whitelist.indexOf(req.url) !== -1) || ((req.url.indexOf(environment.apiUrl) == -1) && (req.url.indexOf(environment.websocket) == -1))) {
    //if (this.blackList.indexOf(req.url) !== -1) {
      return next.handle(req);
    } else {
      var token = this.userService.getToken();
      if (token) {
        req = this.addTokenToRequest(req, token);
      }

      return next.handle(req).pipe(
        catchError(error => {
          if (error instanceof HttpErrorResponse) {
            switch (error.status) {
              case 401: // No hay token                
                this.alertService.addAlert({type: "error",message: error?.error?.detail});
                return throwError(error);
              case 403: // Sin permisos
                this.alertService.addAlert({type: "error",message: error?.error?.detail});
                console.log(error)
                return throwError(error);
              default:
                this.alertService.addAlert({type: "error",message: error?.error?.detail.length ? error?.error?.detail[0]?.msg : error?.message});
                return throwError(error);
            }
          } else {
            this.alertService.addAlert({type: "error",message: error?.error?.detail.length ? error?.error?.detail[0]?.msg : error?.message});
            return throwError(error);
          }
        }));
    }
  }

  addTokenToRequest(req: HttpRequest<any>, token: string): HttpRequest<any> {
    return req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    })
  }
}
