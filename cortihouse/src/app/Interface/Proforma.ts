import { AccesorioConCantidad } from './Accesorio';
import { Cortina, DatosCliente } from './Cortina';

export interface ItemProforma {
  cortina: Cortina;
  ancho: number;
  alto: number;
  cantidad: number;
  instalacion: number;
  accesoriosSeleccionados?: AccesorioConCantidad[];
  total: number;
}

export interface Proforma {
  numeroProforma: string;
  fecha: Date;
  cliente?: DatosCliente;
  items: ItemProforma[];
  totalGeneral: number;
  observacionesGenerales?: string;
}
