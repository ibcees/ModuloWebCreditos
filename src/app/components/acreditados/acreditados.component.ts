import { Component, ViewChild, AfterViewInit, OnInit, Injectable} from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { Router, RouterModule } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatPaginator, MatPaginatorIntl, MatPaginatorModule } from '@angular/material/paginator';
import { MatCardModule } from '@angular/material/card';
import * as XLSX from 'xlsx';
import { Acreditados, CreditoOtorgado, CreditosResponse } from '../../models/acreditados';
import { AcreditServiceService } from '../../services/acredit-service.service';
import { CustomPaginatorIntl } from '../../customPag';
import { HttpClientModule } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})

@Component({
  selector: 'app-acreditados',
  standalone: true,
  imports: [
    SharedModule, RouterModule, MatSortModule, MatPaginatorModule, HttpClientModule],
  templateUrl: './acreditados.component.html',
  styleUrls: ['./acreditados.component.css'],
  providers: [AcreditServiceService, { provide: MatPaginatorIntl, useClass: CustomPaginatorIntl}]
})

export class AcreditadosComponent implements OnInit, AfterViewInit {
  acredColumns: string[] = [
    'expediente', 'nombre_Acreditado', 'tipoCredito', 'capital',
    'fechaAsignacion', 'fechaAutorizacion',
  ];

  agrupadosPorEvaluacion: any[] = []; 
  credColumns: string[] = ['tipoEvaluacion','tipoCredito', 'beneficiarios', 'contratos', 'importe'];
  dataSource = new MatTableDataSource<Acreditados>([]);
  dataSource2 = new MatTableDataSource<CreditoOtorgado>([]);
  loading: boolean = false;
  mostrarTablaFlag: boolean = false; 
  //Fechas
  fechaInicial: Date = new Date();
  fechaFinal: Date = new Date();
  fechaMinima: Date = new Date(2000, 0, 1);  // 1 de enero de 2000
  fechaMaxima: Date = new Date(2025, 11, 31); 


  creditosTitle: string = ''; 
  rolUsuario: string='';

  @ViewChild(MatPaginator) paginator!: MatPaginator;  
  @ViewChild('sort1') sort1!: MatSort;
  @ViewChild('sort2') sort2!: MatSort;

  constructor(
    private acreditadosService: AcreditServiceService,
    private router: Router
  ) { }
  
  ngOnInit(): void {
    const hoy = new Date();
    const haceUnAño = new Date();
    haceUnAño.setFullYear(hoy.getFullYear() - 1);

    this.fechaInicial = haceUnAño;
    this.fechaFinal = hoy;

    this.filtrarFechas();

    const usuarioData = localStorage.getItem('usuario1');
    if (usuarioData) {
      const usuario = JSON.parse(usuarioData);
      this.rolUsuario = usuario.rol;
    }
  }


  ngAfterViewInit(): void {
    this.dataSource2.sort = this.sort1;

    this.dataSource.sort = this.sort2;
    this.dataSource.paginator = this.paginator;
  }
  
  filtrarFechas(): void {
    const fechaInicialStr = this.formatDate(this.fechaInicial);
    const fechaFinalStr = this.formatDate(this.fechaFinal);

    this.creditosTitle = `Créditos otorgados del ${this.formatDateForDisplay(this.fechaInicial)} al ${this.formatDateForDisplay(this.fechaFinal)}`;

    this.obtenerAcreditados(fechaInicialStr, fechaFinalStr);
    this.obtenerCreditos(fechaInicialStr, fechaFinalStr);
  }

  formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  // Formato para la fecha en el título
  formatDateForDisplay(date: Date): string {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Intl.DateTimeFormat('es-ES', options).format(date);
  }

  mostrarTabla(): void {
    this.mostrarTablaFlag = true;
    this.filtrarFechas(); 
  }

  logout() {
    localStorage.removeItem('usuario1');
    this.router.navigate(['/inicioSesion']);
  }

  obtenerAcreditados(fechaInicial: string, fechaFinal: string): void {
    this.loading = true;
    this.acreditadosService.getAcreditados(fechaInicial, fechaFinal).subscribe(data => {
      this.dataSource.data = data;
      this.loading = false;
      
      // Asignar el paginador después de cargar los datos
      setTimeout(() => {
        this.dataSource.paginator = this.paginator;
      });
    });
  }

  agruparPorEvaluacion(data: CreditoOtorgado[]): CreditoOtorgado[] {
    if (!data || !Array.isArray(data)) {
      console.error('Datos inválidos recibidos para agrupación:', data);
      return [];
    }
  
    data.sort((a, b) => {
      if (a.tipoEvaluacion === b.tipoEvaluacion) {
        return a.tipoCredito.localeCompare(b.tipoCredito);
      }
      return a.tipoEvaluacion.localeCompare(b.tipoEvaluacion);
    });
  
    const grupos: { [key: string]: CreditoOtorgado } = {};
    const resultado: CreditoOtorgado[] = [];
  
    data.forEach(item => {
      const key = item.tipoEvaluacion;
  
      if (!grupos[key]) {
        grupos[key] = {
          tipoEvaluacion: item.tipoEvaluacion,
          tipoCredito: 'Total',
          beneficiarios: 0,
          contratos: 0,
          importe: 0,
          esFilaGrupo: true
        };
        resultado.push(grupos[key]);
      }
  
      resultado.push({
        ...item,
        tipoEvaluacion: '',
        esFilaGrupo: false
      });
  
      grupos[key].beneficiarios += item.beneficiarios;
      grupos[key].contratos += item.contratos;
      grupos[key].importe += item.importe;
    });
  
    Object.keys(grupos).forEach(key => {
      const index = resultado.findIndex(item => item.tipoEvaluacion === key && item.esFilaGrupo);
      if (index !== -1) {
        resultado[index] = { ...grupos[key] };
      }
    });
  
    return resultado;
  }
  
  
  obtenerCreditos(fechaInicial: string, fechaFinal: string): void {
    this.loading = true;
    this.acreditadosService.getCreditos(fechaInicial, fechaFinal).subscribe({
      next: (response: CreditosResponse) => {
        console.log('Respuesta completa del API:', response); 
        
        if (!response.creditos || !response.resumen) {
          console.error('Estructura de respuesta inválida:', response);
          this.loading = false;
          return;
        }
        const datosProcesados = this.agruparPorEvaluacion(response.creditos);
        
        datosProcesados.push({
          tipoEvaluacion: '',
          tipoCredito: 'Total General',
          beneficiarios: response.resumen.totalBeneficiarios,
          contratos: response.resumen.totalContratos,
          importe: response.resumen.totalImporte,
          esFilaGrupo: false
        });
        
        console.log('Datos procesados para la tabla:', datosProcesados); 
        
        this.dataSource2.data = datosProcesados;
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        console.error('Error al obtener créditos:', error);
      }
    });
  }

  getTotal(field: keyof CreditoOtorgado): number {
    if (!this.dataSource2.data || this.dataSource2.data.length === 0) return 0;
    
    const totalRow = this.dataSource2.data[this.dataSource2.data.length - 1];
    return totalRow[field] as number;
  }

  applyFilter(event: Event, dataSource: MatTableDataSource<any>,dataSource2: MatTableDataSource<any>): void {
    const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
    dataSource.filter = filterValue;
    dataSource2.filter = filterValue;
  }  
  

  exportExcel(): void {
    const ws1: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.dataSource.data);
  
    const creditosData = this.dataSource2.data.map((item: any) => ({
      tipoEvaluacion: item.tipoEvaluacion || '',
      tipoCredito: item.tipoCredito || '',
      beneficiarios: item.beneficiarios || 0,
      contratos: item.contratos || 0,
      importe: item.importe || 0
    }));
  
    const ws2: XLSX.WorkSheet = XLSX.utils.json_to_sheet(creditosData);
  
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws1, 'Acreditados');
    XLSX.utils.book_append_sheet(wb, ws2, 'Créditos Otorgados');
  
    XLSX.writeFile(wb, 'datos_acreditados_y_creditos.xlsx');
  }
  

  imprimirCred(): void {
    const printElement = document.getElementById('tabla-imprimir');
    if (!printElement) {
      console.error('No se encontró el elemento con ID "tabla-imprimir"');
      return;
    }
  
    const printContent = printElement.innerHTML;
  
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) {
      console.error('No se pudo abrir la ventana de impresión');
      return;
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>Reporte de Créditos</title>
          <style>
            @page { size: auto; margin: 5mm; }
            body { font-family: Arial; padding: 20px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px;  }
            .fila-grupo { font-weight: bold; background-color: #f1f1f1; border-top: 2px solid #ddd; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color:rgb(148, 147, 147); }
            .no-print { display: none; }
            .print-title { margin-bottom: 20px; }
    
            .mat-sort-header-arrow {
              display: none !important;
            }
          </style>
        </head>
        <body onload="window.print();window.close()">
          <div class="print-title">
            <h2>Reporte de Créditos</h2>
            <p>Fecha: ${new Date().toLocaleDateString()}</p>
          </div>
          ${printContent}
        </body>
      </html>
    `);    
  
    printWindow.document.close();
  }  
}
