import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Cortina, DatosCliente } from '../../Interface/Cortina';
import { Accesorio, AccesorioConCantidad } from '../../Interface/Accesorio';
import { ItemProforma, Proforma } from '../../Interface/Proforma';
import { Cortinas } from '../../Core/services/cortinas';
import { ModalCliente } from '../../components/modal-cliente/modal-cliente';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-cortinas-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, ModalCliente],
  templateUrl: './cortinas-form.html',
  styleUrls: ['./cortinas-form.css'],
})
export class CortinasForm implements OnInit {
  form: FormGroup;
  cortinas: Cortina[] = [];
  accesorios: Accesorio[] = [];
  cortinaSeleccionada: Cortina | null = null;
  accesoriosSeleccionados: AccesorioConCantidad[] = [];
  costoTotal = 0;
  costoPorUnidad = 0;
  subtotalAccesorios = 0;
  cargando = false;
  mostrarModalCliente = false;

  private cortinasService = inject(Cortinas);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private subscriptions = new Subscription();

  constructor() {
    this.form = this.fb.group({
      cortinaId: ['', Validators.required],
      ancho: [0, [Validators.required, Validators.min(0.01)]],
      alto: [0, [Validators.required, Validators.min(0.01)]],
      cantidad: [1, [Validators.required, Validators.min(1)]],
      instalacion: [0, [Validators.required, Validators.min(0)]],
      observaciones: [''],
    });
  }

  ngOnInit(): void {
    console.log('🔄 Iniciando carga de cortinas...');
    this.cargando = true;

    // ✅ Suscripción a cambios de cortina (ANTES de cargar datos)
    const cortinaChanges = this.form.get('cortinaId')?.valueChanges.subscribe((id) => {
      this.cortinaSeleccionada = this.cortinas.find((c) => c.id === +id) || null;
      console.log('✅ Cortina seleccionada:', this.cortinaSeleccionada?.nombre);
    });
    if (cortinaChanges) this.subscriptions.add(cortinaChanges);

    // ✅ Cargar datos (con caché compartido)
    const datosSubscription = this.cortinasService.obtenerDatosCompletos().subscribe({
      next: (data) => {
        console.log('✅ Datos recibidos:', data);
        this.cortinas = data.cortinas;
        this.accesorios = data.accesorios;
        this.cargando = false;
      },
      error: (err) => {
        console.error('❌ Error cargando datos:', err);
        this.cargando = false;
        alert('Error al cargar las cortinas. Por favor, recargue la página.');
      },
    });
    this.subscriptions.add(datosSubscription);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  toggleAccesorio(accesorio: Accesorio): void {
    const index = this.accesoriosSeleccionados.findIndex((a) => a.codigo === accesorio.codigo);
    if (index !== -1) {
      this.accesoriosSeleccionados.splice(index, 1);
    } else {
      this.accesoriosSeleccionados.push({
        codigo: accesorio.codigo,
        nombre: accesorio.nombre,
        precio: accesorio.precio,
        cantidad: 1,
      });
    }
  }

  isAccesorioSeleccionado(accesorio: Accesorio): boolean {
    return this.accesoriosSeleccionados.some((a) => a.codigo === accesorio.codigo);
  }

  cambiarCantidadAccesorio(accesorio: Accesorio, cambio: number): void {
    const acc = this.accesoriosSeleccionados.find((a) => a.codigo === accesorio.codigo);
    if (acc) {
      acc.cantidad = Math.max(1, acc.cantidad + cambio);
    }
  }

  setCantidadAccesorio(accesorio: Accesorio, event: any): void {
    const cantidad = parseInt(event.target.value, 10) || 1;
    const acc = this.accesoriosSeleccionados.find((a) => a.codigo === accesorio.codigo);
    if (acc) {
      acc.cantidad = Math.max(1, cantidad);
    }
  }

  getCantidadAccesorio(accesorio: Accesorio): number {
    const acc = this.accesoriosSeleccionados.find((a) => a.codigo === accesorio.codigo);
    return acc ? acc.cantidad : 1;
  }

  calcularCosto(): void {
    if (!this.cortinaSeleccionada) {
      alert('Seleccione una cortina primero');
      return;
    }

    const { ancho, alto, cantidad, instalacion } = this.form.value;

    if (ancho <= 0 || alto <= 0) {
      alert('Las medidas deben ser mayores a cero');
      return;
    }

    const area = ancho * alto;
    this.costoPorUnidad = area * this.cortinaSeleccionada.precioM2;
    const subtotalCortinas = this.costoPorUnidad * cantidad;

    this.subtotalAccesorios = this.accesoriosSeleccionados.reduce(
      (sum, a) => sum + a.precio * a.cantidad,
      0
    );

    this.costoTotal = subtotalCortinas + instalacion + this.subtotalAccesorios;
  }

  guardar(): void {
    if (!this.form.valid) {
      alert('Complete todos los campos requeridos');
      return;
    }

    if (!this.cortinaSeleccionada) {
      alert('Seleccione una cortina');
      return;
    }

    if (this.costoTotal === 0) {
      alert('Debe calcular el costo antes de guardar');
      return;
    }

    this.mostrarModalCliente = true;
  }

  onModalClose(): void {
    this.mostrarModalCliente = false;
  }
  // ✅ Cambiar la firma del método
  onModalSave(data: { cliente: DatosCliente; observaciones: string }): void {
    const { ancho, alto, cantidad, instalacion } = this.form.value;

    const item: ItemProforma = {
      cortina: this.cortinaSeleccionada!,
      ancho,
      alto,
      cantidad,
      instalacion,
      accesoriosSeleccionados:
        this.accesoriosSeleccionados.length > 0 ? [...this.accesoriosSeleccionados] : undefined,
      total: this.costoTotal,
    };

    const proforma: Proforma = {
      numeroProforma: this.cortinasService.generarNumeroProforma(),
      fecha: new Date(),
      cliente: data.cliente, // ✅ Usar data.cliente
      items: [item],
      totalGeneral: this.costoTotal,
      observacionesGenerales: data.observaciones || '', // ✅ Usar data.observaciones
    };

    this.cortinasService.crearProforma(proforma);
    this.mostrarModalCliente = false;

    alert(`Proforma ${proforma.numeroProforma} creada exitosamente`);
    this.router.navigate(['/cortinas-list']);
  }
}
