import { HttpClient } from '@angular/common/http';
import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, map, Observable, shareReplay, tap } from 'rxjs';
import { ItemProforma, Proforma } from '../../Interface/Proforma';
import { Cortina, CortinasData, DatosCliente } from '../../Interface/Cortina';
import { Accesorio, AccesorioConCantidad } from '../../Interface/Accesorio';

@Injectable({
  providedIn: 'root',
})
export class Cortinas {
  private apiUrl = '/json/cortinas.json';
  private proformas: Proforma[] = [];
  private proformasSubject = new BehaviorSubject<Proforma[]>([]);

  private cortinasCache: Cortina[] | null = null;
  private accesoriosCache: Accesorio[] | null = null;

  private platformId = inject(PLATFORM_ID);
  private isBrowser: boolean;
  private datosCompletos$: Observable<CortinasData> | null = null;

  constructor(private http: HttpClient) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    if (this.isBrowser) {
      this.cargarProformasGuardadas();
    }
  }

  obtenerCortinas(): Observable<Cortina[]> {
    if (this.cortinasCache && this.cortinasCache.length > 0) {
      return new Observable((observer) => {
        observer.next(this.cortinasCache!);
        observer.complete();
      });
    }

    return this.http.get<CortinasData>(this.apiUrl).pipe(
      map((d) => d.cortinas),
      tap((c) => (this.cortinasCache = c))
    );
  }

  obtenerAccesorios(): Observable<Accesorio[]> {
    if (this.accesoriosCache && this.accesoriosCache.length > 0) {
      return new Observable((observer) => {
        observer.next(this.accesoriosCache!);
        observer.complete();
      });
    }

    return this.http.get<CortinasData>(this.apiUrl).pipe(
      map((d) => d.accesorios),
      tap((a) => (this.accesoriosCache = a))
    );
  }

  obtenerDatosCompletos(): Observable<CortinasData> {
    if (this.datosCompletos$) {
      return this.datosCompletos$;
    }
    this.datosCompletos$ = this.http.get<CortinasData>(this.apiUrl).pipe(
      tap((data) => console.log('✅ Datos cargados del servidor:', data)),
      shareReplay(1)
    );

    return this.datosCompletos$;
  }

  private cargarProformasGuardadas(): void {
    if (!this.isBrowser) return;
    try {
      const guardado = localStorage.getItem('proformas');
      if (guardado) {
        this.proformas = JSON.parse(guardado);
        this.proformasSubject.next(this.proformas);
      }
    } catch (error) {
      console.error('Error cargando proformas:', error);
    }
  }

  private guardarEnLocalStorage(): void {
    if (!this.isBrowser) return;
    try {
      localStorage.setItem('proformas', JSON.stringify(this.proformas));
    } catch (error) {
      console.error('Error guardando proformas:', error);
    }
  }

  crearProforma(proforma: Proforma): void {
    if (!proforma.numeroProforma) {
      proforma.numeroProforma = this.generarNumeroProforma();
    }
    this.proformas.push(proforma);
    this.proformasSubject.next(this.proformas);
    this.guardarEnLocalStorage();
  }

  agregarItemAProforma(numeroProforma: string, nuevoItem: ItemProforma): void {
    const proforma = this.proformas.find((p) => p.numeroProforma === numeroProforma);
    if (!proforma) {
      console.error('Proforma no encontrada', numeroProforma);
      return;
    }
    proforma.items.push(nuevoItem);
    proforma.totalGeneral = this.calcularTotalProforma(proforma.items);
    this.proformasSubject.next(this.proformas);
    this.guardarEnLocalStorage();
  }

  actualizarItem(numeroProforma: string, indexItem: number, itemActualizado: ItemProforma): void {
    const proforma = this.proformas.find((p) => p.numeroProforma === numeroProforma);
    if (!proforma) return;
    proforma.items[indexItem] = itemActualizado;
    proforma.totalGeneral = this.calcularTotalProforma(proforma.items);
    this.proformasSubject.next(this.proformas);
    this.guardarEnLocalStorage();
  }

  eliminarItem(numeroProforma: string, indexItem: number): void {
    const proforma = this.proformas.find((p) => p.numeroProforma === numeroProforma);
    if (!proforma) return;
    if (proforma.items.length <= 1) {
      const confirmar = confirm(
        'Este es el único producto de la proforma. ¿Desea eliminar toda la proforma?'
      );
      if (confirmar) {
        this.eliminarProforma(numeroProforma);
      }
      return;
    }
    proforma.items.splice(indexItem, 1);
    proforma.totalGeneral = this.calcularTotalProforma(proforma.items);
    this.proformasSubject.next(this.proformas);
    this.guardarEnLocalStorage();
  }

  eliminarProforma(numeroProforma: string): void {
    const index = this.proformas.findIndex((p) => p.numeroProforma === numeroProforma);
    if (index !== -1) {
      this.proformas.splice(index, 1);
      this.proformasSubject.next(this.proformas);
      this.guardarEnLocalStorage();
    }
  }

  obtenerProformas(): Observable<Proforma[]> {
    return this.proformasSubject.asObservable();
  }

  obtenerProformaPorNumero(numeroProforma: string): Proforma | undefined {
    return this.proformas.find((p) => p.numeroProforma === numeroProforma);
  }

  private calcularTotalProforma(items: ItemProforma[]): number {
    return items.reduce((sum, it) => sum + it.total, 0);
  }

  calcularTotalItem(
    cortina: Cortina,
    ancho: number,
    alto: number,
    cantidad: number,
    instalacion: number,
    accesorios: AccesorioConCantidad[]
  ): number {
    const area = ancho * alto;
    const costoCortinas = area * cortina.precioM2 * cantidad;
    const costoAccesorios = accesorios.reduce((s, a) => s + a.precio * (a.cantidad || 1), 0);
    return costoCortinas + instalacion + costoAccesorios;
  }

  generarNumeroProforma(): string {
    const year = new Date().getFullYear();
    const proformasDelAnio = this.proformas.filter((p) =>
      p.numeroProforma.startsWith(`PRF-${year}-`)
    );
    const siguienteNumero = proformasDelAnio.length + 1;
    const numeroFormateado = String(siguienteNumero).padStart(4, '0');
    return `PRF-${year}-${numeroFormateado}`;
  }

  limpiarProformas(): void {
    this.proformas = [];
    this.proformasSubject.next(this.proformas);
    if (this.isBrowser) localStorage.removeItem('proformas');
  }

  actualizarDescripcionGeneral(numeroProforma: string, descripcion: string): void {
    const proforma = this.proformas.find((p) => p.numeroProforma === numeroProforma);
    if (!proforma) return;
    proforma.observacionesGenerales = descripcion;
    this.proformasSubject.next(this.proformas);
    this.guardarEnLocalStorage();
  }
  actualizarCliente(numeroProforma: string, cliente: DatosCliente): void {
    const proforma = this.proformas.find((p) => p.numeroProforma === numeroProforma);
    if (!proforma) return;
    proforma.cliente = cliente;
    this.proformasSubject.next(this.proformas);
    this.guardarEnLocalStorage();
  }
}
