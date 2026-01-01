import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DatosCliente } from '../../Interface/Cortina';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal-cliente',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './modal-cliente.html',
  styleUrls: ['./modal-cliente.css'],
})
export class ModalCliente {
  @Input() visible = false;
  @Input() subtotal = 0;
  @Input() cortinaNombre = '';
  @Output() close = new EventEmitter<void>();
  @Output() save = new EventEmitter<{ cliente: DatosCliente; observaciones: string }>();

  form: FormGroup;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      nombre: ['', Validators.required],
      ruc: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(13)]],
      direccion: ['', Validators.required],
      celular: ['', [Validators.required, Validators.minLength(7), Validators.maxLength(10)]],
      email: ['', [Validators.required, Validators.email]],
      observacionesGenerales: ['Observaciones iniciales...'],
    });
  }

  onSave() {
    if (this.form.invalid) return;

    const cliente: DatosCliente = {
      nombre: this.form.value.nombre,
      ruc: this.form.value.ruc,
      direccion: this.form.value.direccion,
      celular: this.form.value.celular,
      email: this.form.value.email,
      observacionesGenerales: this.form.value.observacionesGenerales,
    };
    this.save.emit({
      cliente,
      observaciones: this.form.value.observacionesGenerales,
    });
  }

  onClose() {
    this.close.emit();
  }
}
