import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClientModule, HttpClient, HttpParams } from '@angular/common/http';
import { catchError, map, Observable, tap, throwError } from 'rxjs';
import { Acreditados } from '../models/acreditados';
import { CreditosResponse } from '../models/acreditados';

@Injectable({ 
  providedIn: 'root' 
})
export class AcreditServiceService {
    private appUrl: string = environment.endpoint;
    private apiUrl: string = 'api/Acreditados/';

    constructor(private http: HttpClient) { }

    getAcreditados(fechaInicial: string, fechaFinal: string): Observable<Acreditados[]> {
        const params = new HttpParams()
          .set('fechaInicial', fechaInicial)
          .set('fechaFinal', fechaFinal);

        return this.http.get<Acreditados[]>(`${this.appUrl}${this.apiUrl}ConsultarAcreditados`, { params });
    }

    getCreditos(fechaInicial: string, fechaFinal: string): Observable<CreditosResponse> {
      const params = new HttpParams()
        .set('fechaInicial', fechaInicial)
        .set('fechaFinal', fechaFinal);
    
      return this.http.get<CreditosResponse>(`${this.appUrl}${this.apiUrl}ConsultarCreditos`, { params }).pipe(
        tap((response: any) => {
          console.log('Datos recibidos del API:', response); // Para depuración
        }),
        catchError(error => {
          console.error('Error al obtener créditos:', error);
          return throwError(() => error);
        })
      );
    }
}    
 
