import { Accesorio } from './Accesorio';

export interface Cortina {
  id: number;
  nombre: string;
  codigoBase: string;
  codigoColor: string;
  stockMetros: number;
  anchoMaximo: number;
  altoMaximo: number;
  precioM2: number;
  categoria: string;
  descripcion: string;
}

export interface CortinasData {
  cortinas: Cortina[];
  accesorios: Accesorio[];
}

export interface DatosCliente {
  nombre: string;
  ruc?: string;
  direccion?: string;
  celular?: string;
  email?: string;
  observacionesGenerales?: string;
}
