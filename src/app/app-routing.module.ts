import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    loadChildren: (): any => import('./modules/home/home.module').then((m) => m.HomeModule),
  },
  {
    path: 'room/:id',
    loadChildren: (): any => import('./modules/editor-page/editor-page.module').then((m) => m.EditorPageModule),
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
