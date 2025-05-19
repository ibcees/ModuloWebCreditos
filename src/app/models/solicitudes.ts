export interface Solicitudes {
    expr1: number;
    nombre_Solicitante: string;
    paterno: string;
    materno: string;
    idContrato?: number; 
    folio: number;
    expediente: string;
    idTipoCredito: number;
    tipoCreditoDescripcion: string;
    importeSolicitado: number;
    tipoSolicitud: string;
    escTipoSector: number; 
    escNombreOficial: string;
    idEscuela: number;
    idNivel: number;
    idCarrera?: number; 
    carreraNombre: string;
    citas: string;
    citaId: number;
    esVerificada: boolean;
    fechaEstatus?: Date; 
    estatusDescripcion: string;
    estatusId: number;
}

export interface SolReno{
    tipoCredito: string;
    importe: number;
    contratos: number;
    beneficiarios: number;
    renovada: unknown;
    TipoCredito: string;
    TotalSolicitudes: number;
    EstatusDescripcion: string;
    ImporteEstimado: number;
}