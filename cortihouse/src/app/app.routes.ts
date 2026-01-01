import { Routes } from '@angular/router';
import { CortinasInit } from './Pages/cortinas-init/cortinas-init';
import { CortinasForm } from './Pages/cortinas-form/cortinas-form';
import { CortinasList } from './Pages/cortinas-list/cortinas-list';

export const routes: Routes = [
  { path: '', component: CortinasInit }, // 👈 PANTALLA INICIAL
  { path: 'cortinas-form', component: CortinasForm },
  { path: 'cortinas-list', component: CortinasList },
  { path: '**', redirectTo: '' }, // 👈 SIEMPRE AL INICIO
];
