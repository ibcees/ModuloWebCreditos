export interface Acreditados {
    expediente: number;
    nombre_Acreditado: string;
    sexo?: string;
    ciudadLocalidad: string;
    contrato?: number;
    tipoCredito?: string;
    fechaTermEstudios?: Date;
    campusID: number;
    nombreEscuela: string;
    tipoEscuela?: string;
    estrato?: string;
    nivel?: string;
    semestre?: number;
    carreraNombre: string;
    capital?: number;
    sucursal?: string;
    municipioFam: string;
    fechaAsignacion?: Date;
    fechaAutorizacion: Date;
    campusEstadoID?: number;
    tipoEvaluacion?: string;
}


export interface CreditoOtorgado  {
    tipoEvaluacion: string;
    tipoCredito: string;
    beneficiarios: number;
    contratos: number;
    importe: number;
    esFilaGrupo?: boolean; 
    }
  
  export interface CreditosResponse {
    data: any;
    creditos: CreditoOtorgado [];
    resumen: {
      totalBeneficiarios: number;
      totalContratos: number;
      totalImporte: number;
    };
  }
