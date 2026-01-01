import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ItemProforma, Proforma } from '../../Interface/Proforma';
import { Cortina, DatosCliente } from '../../Interface/Cortina';
import { Accesorio, AccesorioConCantidad } from '../../Interface/Accesorio';
import { Cortinas } from '../../Core/services/cortinas';
import { generarPDFProforma } from '../../utils/pdf-generator';

@Component({
  selector: 'app-cortinas-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, ReactiveFormsModule],
  templateUrl: './cortinas-list.html',
  styleUrls: ['./cortinas-list.css'],
})
export class CortinasList implements OnInit {
  proformas: Proforma[] = [];
  cortinas: Cortina[] = [];
  accesorios: Accesorio[] = [];

  mostrarModalEdicion = false;
  proformaEditando: Proforma | null = null;
  itemIndexEditando = -1;
  formEdicion: FormGroup;
  cortinaSeleccionadaEdicion: Cortina | null = null;
  accesoriosSeleccionadosEdicion: AccesorioConCantidad[] = [];

  mostrarModalAgregarProducto = false;
  proformaParaAgregar: Proforma | null = null;
  formAgregarProducto: FormGroup;
  cortinaSeleccionadaAgregar: Cortina | null = null;
  accesoriosSeleccionadosAgregar: AccesorioConCantidad[] = [];
  costoTotalNuevoItem = 0;
  costoPorUnidadNuevoItem = 0;

  editandoDescripcion = '';
  descripcionTemporal = '';

  mostrarModalCliente = false;
  proformaEditandoCliente: Proforma | null = null;
  formCliente: FormGroup;

  private cortinasService = inject(Cortinas);
  private fb = inject(FormBuilder);

  constructor() {
    this.formAgregarProducto = this.fb.group({
      cortinaId: ['', Validators.required],
      ancho: [0, [Validators.required, Validators.min(0.01)]],
      alto: [0, [Validators.required, Validators.min(0.01)]],
      cantidad: [1, [Validators.required, Validators.min(1)]],
      instalacion: [0, [Validators.required, Validators.min(0)]],
    });

    this.formEdicion = this.fb.group({
      cortinaId: ['', Validators.required],
      ancho: [0, [Validators.required, Validators.min(0.01)]],
      alto: [0, [Validators.required, Validators.min(0.01)]],
      cantidad: [1, [Validators.required, Validators.min(1)]],
      instalacion: [0, [Validators.required, Validators.min(0)]],
    });

    this.formCliente = this.fb.group({
      nombre: ['', Validators.required],
      ruc: [''],
      direccion: [''],
      celular: [''],
      email: [''],
    });
  }

  ngOnInit(): void {
    this.cortinasService.obtenerProformas().subscribe((proformas) => (this.proformas = proformas));
    this.cortinasService.obtenerDatosCompletos().subscribe((data) => {
      this.cortinas = data.cortinas;
      this.accesorios = data.accesorios;
    });

    this.formEdicion.get('cortinaId')?.valueChanges.subscribe((id) => {
      this.cortinaSeleccionadaEdicion = this.cortinas.find((c) => c.id === +id) || null;
    });

    this.formAgregarProducto.get('cortinaId')?.valueChanges.subscribe((id) => {
      this.cortinaSeleccionadaAgregar = this.cortinas.find((c) => c.id === +id) || null;
      this.calcularCostoNuevoItem();
    });

    this.formAgregarProducto.valueChanges.subscribe(() => {
      this.calcularCostoNuevoItem();
    });
  }

  calcularTotalGeneral(): string {
    const total = this.proformas.reduce((s, p) => s + p.totalGeneral, 0);
    return total.toFixed(2);
  }

  // EDITAR ITEM
  abrirModalEdicion(proforma: Proforma, indexItem: number): void {
    this.proformaEditando = proforma;
    this.itemIndexEditando = indexItem;
    const item = proforma.items[indexItem];

    item.accesoriosSeleccionados = item.accesoriosSeleccionados || [];

    this.formEdicion.patchValue({
      cortinaId: item.cortina.id,
      ancho: item.ancho,
      alto: item.alto,
      cantidad: item.cantidad,
      instalacion: item.instalacion,
    });
    this.accesoriosSeleccionadosEdicion = [...item.accesoriosSeleccionados];
    this.cortinaSeleccionadaEdicion = item.cortina;
    this.mostrarModalEdicion = true;
  }

  toggleAccesorioEdicion(accesorio: Accesorio): void {
    const index = this.accesoriosSeleccionadosEdicion.findIndex(
      (a) => a.codigo === accesorio.codigo
    );
    if (index !== -1) this.accesoriosSeleccionadosEdicion.splice(index, 1);
    else
      this.accesoriosSeleccionadosEdicion.push({
        codigo: accesorio.codigo,
        nombre: accesorio.nombre,
        precio: accesorio.precio,
        cantidad: 1,
      });
  }

  cambiarCantidadAccesorioEdicion(accesorio: Accesorio, cambio: number): void {
    const acc = this.accesoriosSeleccionadosEdicion.find((a) => a.codigo === accesorio.codigo);
    if (acc) acc.cantidad = Math.max(1, acc.cantidad + cambio);
  }

  setCantidadAccesorioEdicion(accesorio: Accesorio, event: any): void {
    const cantidad = parseInt(event.target.value, 10) || 1;
    const acc = this.accesoriosSeleccionadosEdicion.find((a) => a.codigo === accesorio.codigo);
    if (acc) acc.cantidad = Math.max(1, cantidad);
  }

  getCantidadAccesorioEdicion(accesorio: Accesorio): number {
    const acc = this.accesoriosSeleccionadosEdicion.find((a) => a.codigo === accesorio.codigo);
    return acc ? acc.cantidad : 1;
  }

  isAccesorioSeleccionadoEdicion(accesorio: Accesorio): boolean {
    return this.accesoriosSeleccionadosEdicion.some((a) => a.codigo === accesorio.codigo);
  }

  calcularCostoEdicion(): number {
    const valores = this.formEdicion.value;
    const cortina = this.cortinaSeleccionadaEdicion;
    if (!cortina || valores.ancho <= 0 || valores.alto <= 0) return 0;
    const area = valores.ancho * valores.alto;
    const costoCortinas = area * cortina.precioM2 * valores.cantidad;
    const costoAccesorios = this.accesoriosSeleccionadosEdicion.reduce(
      (s, a) => s + a.precio * a.cantidad,
      0
    );
    return costoCortinas + valores.instalacion + costoAccesorios;
  }

  guardarEdicionModal(): void {
    if (!this.formEdicion.valid || !this.proformaEditando) {
      alert('Complete todos los campos requeridos');
      return;
    }
    const v = this.formEdicion.value;
    const cortina = this.cortinaSeleccionadaEdicion;
    if (!cortina) {
      alert('Seleccione una cortina');
      return;
    }
    const itemActualizado: ItemProforma = {
      cortina,
      ancho: v.ancho,
      alto: v.alto,
      cantidad: v.cantidad,
      instalacion: v.instalacion,
      accesoriosSeleccionados:
        this.accesoriosSeleccionadosEdicion.length > 0
          ? [...this.accesoriosSeleccionadosEdicion]
          : undefined,
      total: this.calcularCostoEdicion(),
    };
    this.cortinasService.actualizarItem(
      this.proformaEditando!.numeroProforma,
      this.itemIndexEditando,
      itemActualizado
    );
    alert('Producto actualizado correctamente');
    this.cerrarModalEdicion();
  }

  cerrarModalEdicion(): void {
    this.mostrarModalEdicion = false;
    this.proformaEditando = null;
    this.itemIndexEditando = -1;
    this.accesoriosSeleccionadosEdicion = [];
    this.cortinaSeleccionadaEdicion = null;
    this.formEdicion.reset({ cantidad: 1, instalacion: 0 });
  }

  // AGREGAR PRODUCTO
  toggleAccesorioAgregar(accesorio: Accesorio): void {
    const index = this.accesoriosSeleccionadosAgregar.findIndex(
      (a) => a.codigo === accesorio.codigo
    );
    if (index !== -1) {
      this.accesoriosSeleccionadosAgregar.splice(index, 1);
    } else {
      this.accesoriosSeleccionadosAgregar.push({ ...accesorio, cantidad: 1 });
    }
    this.calcularCostoNuevoItem();
  }

  isAccesorioSeleccionadoAgregar(accesorio: Accesorio): boolean {
    return this.accesoriosSeleccionadosAgregar.some((a) => a.codigo === accesorio.codigo);
  }

  cambiarCantidadAccesorioAgregar(accesorio: Accesorio, cambio: number): void {
    const acc = this.accesoriosSeleccionadosAgregar.find((a) => a.codigo === accesorio.codigo);
    if (acc) {
      acc.cantidad = Math.max(1, acc.cantidad + cambio);
      this.calcularCostoNuevoItem();
    }
  }

  setCantidadAccesorioAgregar(accesorio: Accesorio, event: any): void {
    const cantidad = parseInt(event.target.value, 10) || 1;
    const acc = this.accesoriosSeleccionadosAgregar.find((a) => a.codigo === accesorio.codigo);
    if (acc) {
      acc.cantidad = Math.max(1, cantidad);
      this.calcularCostoNuevoItem();
    }
  }

  getCantidadAccesorioAgregar(accesorio: Accesorio): number {
    const acc = this.accesoriosSeleccionadosAgregar.find((a) => a.codigo === accesorio.codigo);
    return acc ? acc.cantidad : 1;
  }

  calcularCostoAccesoriosAgregar(): number {
    return this.accesoriosSeleccionadosAgregar.reduce((s, a) => s + a.precio * a.cantidad, 0);
  }

  calcularCostoNuevoItem(): void {
    if (!this.cortinaSeleccionadaAgregar) {
      this.costoTotalNuevoItem = 0;
      this.costoPorUnidadNuevoItem = 0;
      return;
    }
    const { ancho, alto, cantidad, instalacion } = this.formAgregarProducto.value;
    if (ancho > 0 && alto > 0) {
      const area = ancho * alto;
      this.costoPorUnidadNuevoItem = area * this.cortinaSeleccionadaAgregar.precioM2;
      const costoCortinas = this.costoPorUnidadNuevoItem * cantidad;
      const costoAccesorios = this.calcularCostoAccesoriosAgregar();
      this.costoTotalNuevoItem = costoCortinas + instalacion + costoAccesorios;
    } else {
      this.costoTotalNuevoItem = 0;
      this.costoPorUnidadNuevoItem = 0;
    }
  }

  abrirModalAgregarProducto(proforma: Proforma): void {
    this.proformaParaAgregar = proforma;
    this.mostrarModalAgregarProducto = true;
    this.formAgregarProducto.reset({
      cantidad: 1,
      instalacion: 0,
    });
    this.cortinaSeleccionadaAgregar = null;
    this.accesoriosSeleccionadosAgregar = [];
    this.costoTotalNuevoItem = 0;
    this.costoPorUnidadNuevoItem = 0;
  }

  cerrarModalAgregarProducto(): void {
    this.mostrarModalAgregarProducto = false;
    this.proformaParaAgregar = null;
    this.formAgregarProducto.reset({
      cantidad: 1,
      instalacion: 0,
    });
    this.cortinaSeleccionadaAgregar = null;
    this.accesoriosSeleccionadosAgregar = [];
    this.costoTotalNuevoItem = 0;
    this.costoPorUnidadNuevoItem = 0;
  }

  agregarProductoAProforma(): void {
    if (
      !this.formAgregarProducto.valid ||
      !this.proformaParaAgregar ||
      !this.cortinaSeleccionadaAgregar
    ) {
      alert('Complete todos los campos requeridos');
      return;
    }
    if (this.costoTotalNuevoItem === 0) {
      alert('El costo no puede ser cero');
      return;
    }

    const { ancho, alto, cantidad, instalacion } = this.formAgregarProducto.value;

    const nuevoItem: ItemProforma = {
      cortina: this.cortinaSeleccionadaAgregar,
      ancho,
      alto,
      cantidad,
      instalacion,
      accesoriosSeleccionados:
        this.accesoriosSeleccionadosAgregar.length > 0
          ? [...this.accesoriosSeleccionadosAgregar]
          : undefined,
      total: this.costoTotalNuevoItem,
    };

    this.cortinasService.agregarItemAProforma(this.proformaParaAgregar.numeroProforma, nuevoItem);
    alert(`Producto agregado a la proforma ${this.proformaParaAgregar.numeroProforma}`);
    this.cerrarModalAgregarProducto();
  }

  // ELIMINAR
  descargarPDFProforma(proforma: Proforma): void {
    generarPDFProforma(proforma);
  }

  eliminarProforma(proforma: Proforma): void {
    const confirmar = confirm(`¿Está seguro de eliminar la proforma ${proforma.numeroProforma}?`);
    if (confirmar) {
      this.cortinasService.eliminarProforma(proforma.numeroProforma);
      alert('Proforma eliminada');
    }
  }

  eliminarItem(proforma: Proforma, indexItem: number): void {
    const item = proforma.items[indexItem];
    const confirmar = confirm(
      `¿Eliminar este item?\n${item.cortina.nombre} - ${
        item.cantidad
      } unidad(es)\nTotal: $${item.total.toFixed(2)}`
    );
    if (confirmar) {
      this.cortinasService.eliminarItem(proforma.numeroProforma, indexItem);
    }
  }

  iniciarEdicionDescripcion(proforma: Proforma): void {
    this.editandoDescripcion = proforma.numeroProforma;
    this.descripcionTemporal = proforma.observacionesGenerales || '';
  }

  guardarDescripcion(proforma: Proforma): void {
    this.cortinasService.actualizarDescripcionGeneral(
      proforma.numeroProforma,
      this.descripcionTemporal
    );
    this.editandoDescripcion = '';
    this.descripcionTemporal = '';
  }

  cancelarEdicionDescripcion(): void {
    this.editandoDescripcion = '';
    this.descripcionTemporal = '';
  }

  // EDITAR CLIENTE
  abrirModalCliente(proforma: Proforma): void {
    this.proformaEditandoCliente = proforma;
    this.mostrarModalCliente = true;
    if (proforma.cliente) {
      this.formCliente.patchValue({
        nombre: proforma.cliente.nombre || '',
        ruc: proforma.cliente.ruc || '',
        direccion: proforma.cliente.direccion || '',
        celular: proforma.cliente.celular || '',
        email: proforma.cliente.email || '',
      });
    } else {
      this.formCliente.reset();
    }
  }

  cerrarModalCliente(): void {
    this.mostrarModalCliente = false;
    this.proformaEditandoCliente = null;
    this.formCliente.reset();
  }
  guardarCliente(): void {
    if (!this.formCliente.valid || !this.proformaEditandoCliente) {
      alert('Complete al menos el nombre del cliente');
      return;
    }

    const cliente: DatosCliente = {
      nombre: this.formCliente.value.nombre,
      ruc: this.formCliente.value.ruc,
      direccion: this.formCliente.value.direccion,
      celular: this.formCliente.value.celular,
      email: this.formCliente.value.email,
    };
    this.cortinasService.actualizarCliente(this.proformaEditandoCliente.numeroProforma, cliente);
    alert('Cliente actualizado correctamente');
    this.cerrarModalCliente();
  }
}
