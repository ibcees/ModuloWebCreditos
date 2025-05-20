import { AfterViewInit, Component, Injectable, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router, RouterModule, RouterOutlet } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import * as XLSX from 'xlsx';
//angular material
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatPaginator, MatPaginatorIntl, MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule} from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatProgressBar } from '@angular/material/progress-bar';
import { HttpClientModule,HttpClient, HttpErrorResponse } from '@angular/common/http';
import { formatDate } from '@angular/common';
import { catchError, finalize, forkJoin, of } from 'rxjs';
import { CustomPaginatorIntl } from '../../customPag';
import { FormsModule } from '@angular/forms';
//Servicios y modulos
import { SolicitudServiceService } from '../../services/solicitud-service.service';
import { AcreditServiceService } from '../../services/acredit-service.service';
import { CreditoOtorgado, CreditosResponse } from '../../models/acreditados';
import { Solicitudes, SolReno } from '../../models/solicitudes';
import { saveAs } from 'file-saver-es';
import { AuthGuard } from '../../guards/auth.guard';
import { SharedModule } from '../../shared/shared.module';

@Injectable({
  providedIn: 'root'
})

@Component({
  selector: 'app-solicitudes',
  standalone: true,
  imports: [SharedModule,RouterModule, MatPaginatorModule,HttpClientModule,ReactiveFormsModule, 
    MatOptionModule, FormsModule, MatSortModule, MatTableModule],
  templateUrl: './solicitudes.component.html',
  styleUrl: './solicitudes.component.css',
  providers: [SolicitudServiceService, AcreditServiceService, { provide: MatPaginatorIntl, useClass: CustomPaginatorIntl}]
})

export class SolicitudesComponent implements OnInit, AfterViewInit {
  //declaracion de columnas
  renoColumns: string[] = ['estatusDescripcion', 'totalSolicitudes'];
  importeColumns: string[] = ['estatusDescripcion', 'totalSolicitudes', 'importeEstimado'];
  credColumns: string[] = ['tipoEvaluacion', 'tipoCredito', 'beneficiarios', 'contratos', 'importe'];
  footerColumns: string[] = ['total']; 
  soliColumns: string [] = ['expr1', 'expediente', 'nombre_Solicitante', 'tipoSolicitud', 
    'estatusDescripcion', 'fechaEstatus'];
  //declaracion de datos
  tranRenovacion = new MatTableDataSource<any>([]);
  tranNuevas = new MatTableDataSource<any>([]);
  tranNoReno = new MatTableDataSource<any>([]);
  tranImp = new MatTableDataSource<CreditoOtorgado>([]);
  dataSolicitud= new MatTableDataSource<Solicitudes>([]);
  //Declaracion de fechas
  fechaEstatusHasta: Date = new Date();
  fechaEstatusDesde: Date = new Date();
  fechaEstatusNueva: Date = new Date();
  fechaEstatusNoR: Date = new Date()
  fechaMinima: Date = new Date(2000, 0, 1);  // 1 de enero de 2000
  fechaMaxima: Date = new Date(2025, 11, 31); 

  //títulos
  soliTitle: string = '';
  nuevaTitle: string = '';
  noRenoTitle: string = '';
  impTitle: string = '';
  loading: boolean = false;
  filtroTexto: string | undefined;
  mostrarTablaFlag: boolean = false;
  estatusSolicitudIds: string = '';

  rolUsuario: string = '';

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild('sort1') sort1!: MatSort;
  @ViewChild('sort2') sort2!: MatSort;

  cdr: any;
  snackBar: any;

  constructor(
    private solicitudService: SolicitudServiceService,
    private acreditadosService: AcreditServiceService,
    private router: Router
  ) {}
  
  
  ngOnInit(): void {
    this.actualizarTitulos();
    this.filtrarFechas();

    const usuarioData = localStorage.getItem('usuario1');
    if (usuarioData) {
      const usuario = JSON.parse(usuarioData);
      this.rolUsuario = usuario.rol;
    }
  }

  ngAfterViewInit(): void {
    this.configurarPaginador();
    this.tranImp.sort = this.sort1;
    setTimeout(() => {
      this.dataSolicitud.paginator = this.paginator;
      this.dataSolicitud.sort = this.sort2;
    });
  }

  logout() {
    localStorage.removeItem('usuario1');
    this.router.navigate(['/inicioSesion']);
  }

  private configurarPaginador(): void {
    if (this.paginator) {
      this.paginator._intl.itemsPerPageLabel = 'Filas por página:';
      this.paginator._intl.getRangeLabel = (page: number, pageSize: number, length: number) => {
        return `${page * pageSize + 1} - ${Math.min((page + 1) * pageSize, length)} de ${length}`;
      };
    }
  }

  //Método para cargar datos de las tablas 
  cargarDatos(): void {
    this.loading = true;
    this.solicitudService.getSolicitudes(this.fechaEstatusHasta)
    .subscribe({
    next: (data) => {
      this.tranRenovacion.data = data;
      this.loading = false;
    },
    error: (err) => {
      console.error('Error específico en componente:', err);
      this.loading = false;
    }
  });

    this.solicitudService.getSoliNuevas(this.fechaEstatusNueva)
      .subscribe({
        next: (data) => this.tranNuevas.data = data,
        error: (err) => this.manejarError('Error al cargar nuevas solicitudes:', err)
      });

    this.solicitudService.getNoReno(this.fechaEstatusNoR)
      .subscribe({
        next: (data) => {
          this.tranNoReno.data = data;
          this.loading = false;
        },
        error: (err) => this.manejarError('Error al cargar no renovadas:', err, false)
      });

    this.impSoliReno();
  }

  //Método para cargar todas las solicitudes
  cargarSolicitudes(): void {
    this.loading = true;
    const fechaFormateada = this.fechaEstatusDesde.toISOString().split('T')[0];
    this.solicitudService.getSoli(fechaFormateada, this.estatusSolicitudIds).subscribe(data => {
      this.dataSolicitud.data = data;
      this.loading = false;
      
      setTimeout(() => {
        this.dataSolicitud.paginator = this.paginator;
      });
    });
  }
  
//Método para obtener importe solicitudes
impSoliReno(fechaEstatusHasta: Date | null = null): void {
  this.loading = true;
  const fecha = fechaEstatusHasta || this.fechaEstatusHasta;
  
  // Calcular fecha inicial (30 días antes)
  const fechaInicial = new Date(fecha);
  fechaInicial.setDate(fechaInicial.getDate() - 30);

  this.solicitudService.getSolImp(fechaInicial, fecha).subscribe({
    next: (response: any) => {
      try {
        if (!response || !response.creditos) {
          throw new Error('Respuesta del API no válida');
        }

        // Procesar y agrupar datos
        const datosProcesados = this.agruparDatos(response.creditos);

        const totalGeneral = this.crearFilaTotalGeneral(response.resumen);
        
        this.tranImp.data = [...datosProcesados, totalGeneral];
      } catch (error) {
        console.error('Error al procesar datos:', error);
        this.tranImp.data = [];
      } finally {
        this.loading = false;
      }
    },
    error: (error) => {
      console.error('Error en la solicitud:', error);
      this.tranImp.data = [];
      this.loading = false;
    }
  });
}

private agruparDatos(creditos: any[]): CreditoOtorgado[] {
  const datosValidados = creditos
    .filter(item => item && item.tipoCredito && item.tipoCredito !== 'Total General')
    .map(item => ({
      tipoEvaluacion: item.tipoEvaluacion || 'Sin evaluación',
      tipoCredito: item.tipoCredito,
      beneficiarios: Number(item.beneficiarios) || 0,
      contratos: Number(item.contratos) || 0,
      importe: Number(item.importe) || 0,
      esFilaGrupo: false
    }));

  // Agrupar por tipoEvaluacion
  const grupos: {[key: string]: CreditoOtorgado} = {};
  const resultado: CreditoOtorgado[] = [];

  datosValidados.forEach(item => {
    const tipoEvaluacion = item.tipoEvaluacion;
    
    if (!grupos[tipoEvaluacion]) {
      grupos[tipoEvaluacion] = {
        tipoEvaluacion,
        tipoCredito: 'TOTAL ' , 
        beneficiarios: 0,
        contratos: 0,
        importe: 0,
        esFilaGrupo: true
      };
    }
    
    grupos[tipoEvaluacion].beneficiarios += item.beneficiarios;
    grupos[tipoEvaluacion].contratos += item.contratos;
    grupos[tipoEvaluacion].importe += item.importe;
  });

  Object.keys(grupos).forEach(tipoEvaluacion => {
    // Agregar fila de total primero
    resultado.push({...grupos[tipoEvaluacion]});
  
    datosValidados
      .filter(item => item.tipoEvaluacion === tipoEvaluacion)
      .forEach(item => {
        resultado.push({
          ...item,
          tipoEvaluacion: '',
          esFilaGrupo: false
        });
      });
  });
  return resultado;
}

private crearFilaTotalGeneral(resumen: any): CreditoOtorgado {
  return {
    tipoEvaluacion: '',
    tipoCredito: 'Total General',
    beneficiarios: Number(resumen?.totalBeneficiarios) || 0,
    contratos: Number(resumen?.totalContratos) || 0,
    importe: Number(resumen?.totalImporte) || 0,
    esFilaGrupo: false
  };
}
  //formato para fechas
  formatDate(date: Date): string {
    if (!date) return '';
    
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
  
    return `${year}-${month}-${day}`;
  }

  //método para errores
  private manejarError(mensaje: string, error: any, mostrarLoading: boolean = true): void {
    console.error(mensaje, error);
    this.loading = mostrarLoading;
  }


  //Filtros
  filtrarFechas(): void {
    this.actualizarTitulos();
    this.cargarDatos();
    if (this.estatusSolicitudIds) {
      this.cargarSolicitudes();
    }
    const fechaEstatusHastaFormateada = this.formatDate(this.fechaEstatusHasta).trim();

    this.solicitudService.getImpReno(this.fechaEstatusHasta).subscribe(
      (data) => {
        this.tranRenovacion = new MatTableDataSource(data);
      },
      (error) => {
        console.error('Error al obtener las solicitudes:', error);
      }
    );
  }

  aplicarFiltroTexto(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
    this.filtroTexto = filterValue;
    this.dataSolicitud.filter = filterValue;
    
    if (this.dataSolicitud.paginator) {
      this.dataSolicitud.paginator.firstPage();
    }
  }

  actualizarFiltroEstatus(event: Event): void {
    this.estatusSolicitudIds = (event.target as HTMLInputElement).value;
  }

  mostrarTabla(): void {
    this.mostrarTablaFlag = !this.mostrarTablaFlag;
    this.filtrarFechas();
  }

  limpiarFiltros(): void {
    const fechaDesdeStr = this.formatDate(this.fechaEstatusDesde);
    
    this.fechaEstatusDesde = new Date(new Date().setDate(new Date().getDate() - 30));
    this.estatusSolicitudIds = '';
    this.filtroTexto = '';
    this.dataSolicitud.filter = '';
    this.cargarSolicitudes();
  }

  actualizarTitulos(): void {
    this.soliTitle = `Solicitudes de renovación esperada al ${this.formatDateForDisplay(this.fechaEstatusHasta)}`;
    this.nuevaTitle = `Solicitudes nuevas a partir del ${this.formatDateForDisplay(this.fechaEstatusNueva)}`;
    this.noRenoTitle = `Solicitudes a partir del ${this.formatDateForDisplay(this.fechaEstatusNoR)} consideradas nuevas que no renovaron`;
    this.impTitle = `Importe equivalente otorgados al ${this.formatDateForDisplay(this.fechaEstatusHasta)}`;
}


  formatDateForDisplay(date: Date): string {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Intl.DateTimeFormat('es-ES', options).format(date);
  }
  
  //Metodos para obtener totales 
  getTotalImp(field: keyof CreditoOtorgado): number {
    if (!this.tranImp.data || this.tranImp.data.length === 0) return 0;
    const totalRow = this.tranImp.data.find(item => item.tipoCredito === 'Total General');
    return totalRow ? (totalRow[field] as number) || 0 : 0;
  }

  getTotalReno(): number {
    return this.tranRenovacion.data.reduce((sum, transaction) => sum + (transaction.totalSolicitudes || 0), 0);
  }

  getTotalNueva(): number {
    return this.tranNuevas.data.reduce((sum, transaction) => sum + (transaction.totalSolicitudes || 0), 0);
  }
  
  getTotalImporte(): number {
    return this.tranNuevas.data.reduce((sum, transaction) => sum + (transaction.importeEstimado || 0), 0);
  }

  getTotalNoReno(): number {
    return this.tranNoReno.data.reduce((sum, transaction) => sum + (transaction.totalSolicitudes || 0), 0);
  }
  
  getTotalImpNR(): number {
    return this.tranNoReno.data.reduce((sum, transaction) => sum + (transaction.importeEstimado || 0), 0);
  }

  //Exportar datos e imprimir
  exportarExcel(): void {
    const workbook = XLSX.utils.book_new();
    const resumen: [string, string][] = [['Título de la Tabla', 'Nombre de la Hoja']];
    const secciones = [
      { datos: this.tranRenovacion, titulo: 'Renovación', nombreHoja: 'Renovación' },
      { datos: this.tranImp, titulo: 'Importes', nombreHoja: 'Importes' },
      { datos: this.tranNuevas, titulo: 'Nuevas', nombreHoja: 'Nuevas' },
      { datos: this.tranNoReno, titulo: 'No Renovadas', nombreHoja: 'No Renovadas' },
      { datos: this.dataSolicitud, titulo: 'Tabla Soli', nombreHoja: 'Tabla Soli' },
    ];
  
    secciones.forEach((seccion, index) => {
      try {
        console.log(`Procesando sección: ${seccion.nombreHoja}`);
        console.log('Datos:', seccion.datos);
  
        if (seccion.datos && seccion.datos.data && seccion.datos.data.length > 0) {
          const hoja = XLSX.utils.json_to_sheet(seccion.datos.data);
    
          XLSX.utils.sheet_add_aoa(hoja, [[seccion.titulo]], { origin: 'A1' });
    
          const nombreHoja = seccion.nombreHoja.substring(0, 31); // por si acaso
          XLSX.utils.book_append_sheet(workbook, hoja, nombreHoja);
    
          resumen.push([seccion.titulo, nombreHoja]);
        } else {
          console.log(`No hay datos para la sección ${seccion.nombreHoja}`);
        }
      } catch (error) {
        console.error(`Error al procesar la sección ${seccion.nombreHoja}:`, error);
      }
    });
  
    if (resumen.length > 1) {
      const hojaResumen = XLSX.utils.aoa_to_sheet(resumen);
      console.log('Hoja resumen:', hojaResumen);
      XLSX.utils.book_append_sheet(workbook, hojaResumen, 'Resumen');
    }
  
    const excelBuffer: any = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
    });
  
    const blob: Blob = new Blob([excelBuffer], {
      type: 'application/octet-stream',
    });
  
    saveAs(blob, 'reporte-tablas.xlsx');
  }  
  
  
  imprimir() {
    // Ocultar todos los elementos con la clase 'filtros'
    const filtros = document.querySelectorAll('.filtros');
    const originalDisplay: string[] = [];
  
    filtros.forEach((filtro, index) => {
      originalDisplay[index] = (filtro as HTMLElement).style.display;
      (filtro as HTMLElement).style.display = 'none';
    });
  
    const ventanaImpresion = window.open('', '_blank');
    if (ventanaImpresion) {
      ventanaImpresion.document.write(`
        <html>
          <head>
            <title>Reporte</title>
            <style>
              table {
                width: 100%;
                border-collapse: collapse;
              }
              th, td {
                border: 1px solid black;
                padding: 5px;
                text-align: left;
              }
              .fila-grupo { font-weight: bold; background-color: #f1f1f1; border-top: 2px solid #ddd; }
              .encabezado {
                background-color:rgb(148, 147, 147);
              }
              .mat-sort-header-arrow {
              display: none !important;
              }
            </style>
          </head>
          <body>
          ${document.getElementById('tabla-imprimir')?.innerHTML}
          </body>
        </html>
      `);
  
      ventanaImpresion.document.close();
      ventanaImpresion.focus();
      ventanaImpresion.print();
      ventanaImpresion.close();
    }
  
    // Restaurar los filtros visibles después de imprimir
    filtros.forEach((filtro, index) => {
      (filtro as HTMLElement).style.display = originalDisplay[index] ?? 'block';
    });
  }
}  