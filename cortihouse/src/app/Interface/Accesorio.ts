export interface Accesorio {
  codigo: string;
  nombre: string;
  precio: number;
}

export interface AccesorioConCantidad {
  codigo: string;
  nombre: string;
  precio: number;
  cantidad: number;
}
export interface AccesorioSeleccionable extends Accesorio {
  seleccionado: boolean;
}
