import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    loadChildren: (): any => import('./modules/home/home.module').then((m) => m.HomeModule),
  },
  {
    path: 'room/:id',
    loadChildren: (): any => import('./modules/room/room.module').then((m) => m.RoomModule),
  },
  {
    path: 'admin-panel',
    loadChildren: (): any => import('./modules/admin-panel/admin-panel.module').then((m) => m.AdminPanelModule),
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
