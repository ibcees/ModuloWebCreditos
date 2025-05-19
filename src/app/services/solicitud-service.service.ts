import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClientModule, HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { catchError, map, Observable, of, tap, throwError } from 'rxjs';
import { Acreditados, CreditoOtorgado } from '../models/acreditados';
import { CreditosResponse } from '../models/acreditados';
import { Solicitudes, SolReno } from '../models/solicitudes';
import { AcreditServiceService } from './acredit-service.service';

@Injectable({ 
  providedIn: 'root' 
})
export class SolicitudServiceService {
  cargarSolicitudes(fechaEstatusHastaFormateada: string) {
    throw new Error('Method not implemented.');
  }
  private appUrl: string = environment.endpoint;
  private solicitudesApiUrl: string = 'api/Solicitudes';
  private acreditadosApiUrl: string = 'api/Acreditados';

  constructor(
    private http: HttpClient,
    private acreditadosService: AcreditServiceService
  ) {}

  
  private handleError(error: HttpErrorResponse) {
    console.error('Error en la petición:', error);
    
    let errorMessage = 'Error desconocido';
    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Error del servidor
      errorMessage = `Código: ${error.status}\nMensaje: ${error.message}`;
      if (error.error && typeof error.error === 'object') {
        errorMessage += `\nDetalles: ${JSON.stringify(error.error)}`;
      }
    }
    return throwError(() => new Error(errorMessage));
  }

  // Método para formatear fechas de manera consistente
  formatDate2(fecha: Date): string {
    if (!fecha || !(fecha instanceof Date) || isNaN(fecha.getTime())) {
      console.warn('Fecha inválida recibida, usando fecha actual');
      fecha = new Date();
    }
    
    // Formato YYYY-MM-DD sin tiempo
    const pad = (num: number) => num.toString().padStart(2, '0');
    return `${fecha.getFullYear()}-${pad(fecha.getMonth() + 1)}-${pad(fecha.getDate())}`;
  }

  // Versión para el servicio (sin +1 para el backend)
formatDateForAPI(fecha: Date): string {
    if (!fecha || !(fecha instanceof Date) || isNaN(fecha.getTime())) {
        fecha = new Date();
    }
    
    const pad = (num: number) => num.toString().padStart(2, '0');
    // NOTA: Aquí NO sumamos 1 al mes
    return `${fecha.getFullYear()}-${pad(fecha.getMonth())}-${pad(fecha.getDate())}`;
}

// Versión para la interfaz de usuario (con +1)
formatDateForDisplay(fecha: Date): string {
    if (!fecha || !(fecha instanceof Date) || isNaN(fecha.getTime())) {
        fecha = new Date();
    }
    
    const pad = (num: number) => num.toString().padStart(2, '0');
    // Aquí SÍ sumamos 1 para mostrar correctamente
    return `${fecha.getFullYear()}-${pad(fecha.getMonth() + 1)}-${pad(fecha.getDate())}`;
}

  getSoliNuevas(fechaEstatusNueva: Date | null): Observable<SolReno[]> {
    const endpoint = `${this.appUrl}${this.solicitudesApiUrl}/Sol_Nueva`;
    let params = new HttpParams();
    
    if (fechaEstatusNueva) {
      params = params.set('fechaEstatusNueva', this.formatDate2(fechaEstatusNueva));
    }

    return this.http.get<SolReno[]>(endpoint, { params }).pipe(
      tap(data => console.log('Datos de nuevas solicitudes recibidos:', data)),
      catchError(this.handleError)
    );
  }

  getNoReno(fechaEstatusNoR: Date | null): Observable<SolReno[]> {
    const endpoint = `${this.appUrl}${this.solicitudesApiUrl}/Sol_NoReno`;
    let params = new HttpParams();
    
    if (fechaEstatusNoR) {
      params = params.set('fechaEstatusNoR', this.formatDate2(fechaEstatusNoR));
    }

    return this.http.get<SolReno[]>(endpoint, { params }).pipe(
      tap(data => console.log('Datos de no renovadas recibidos:', data)),
      catchError(this.handleError)
    );
  }

  getSolicitudes(fechaEstatusHasta: Date | null): Observable<SolReno[]> {
    const endpoint = `${this.appUrl}${this.solicitudesApiUrl}/Sol_Reno`;
    let params = new HttpParams();
    
    if (fechaEstatusHasta) {
      params = params.set('fechaEstatusHasta', this.formatDate2(fechaEstatusHasta));
    }
    
    console.log(`Solicitando GET a: ${endpoint}`, params.toString());

    return this.http.get<SolReno[]>(endpoint, { params }).pipe(
      tap(data => console.log('Datos de renovación recibidos:', data)),
      catchError(this.handleError)
    );
  }

  getSoli(fechaEstatusDesde: string, estatusSolicitudIds: string): Observable<Solicitudes[]> {
    const params = new HttpParams()
      .set('fechaEstatusDesde', fechaEstatusDesde)
      .set('estatusSolicitudIds', estatusSolicitudIds);
  
    return this.http.get<Solicitudes[]>(
      `${this.appUrl}${this.solicitudesApiUrl}/ConsultarSolicitudes`, 
      { params }
    );
  }

  // Método para créditos otorgados con validación adicional
  getSolImp(fechaInicial: Date, fechaFinal: Date): Observable<any> {
    const endpoint = `${this.appUrl}${this.acreditadosApiUrl}/ConsultarCreditos`;
    const params = new HttpParams()
      .set('fechaInicial', this.formatDateForAPI(fechaInicial))
      .set('fechaFinal', this.formatDateForAPI(fechaFinal));
      
    return this.http.get<any>(endpoint, { params }).pipe(
        catchError(this.handleError)
    );
}

  // En SolicitudServiceService
  getImpReno(fecha: Date): Observable<SolReno[]> {
    const fechaStr = this.formatDate2(fecha);
    const params = new HttpParams().set('fechaEstatusHasta', fechaStr);
    
    return this.http.get<SolReno[]>(`${this.appUrl}${this.solicitudesApiUrl}/Sol_Reno`, { params }).pipe(
      tap(data => console.log('Datos crudos del API:', data)),
      catchError(error => {
        console.error('Error en getImpReno:', error);
        return throwError(() => error);
      })
    );
  }
}