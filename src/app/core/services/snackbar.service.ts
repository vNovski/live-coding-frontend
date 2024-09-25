import { ComponentType } from '@angular/cdk/portal';
import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig, MatSnackBarRef, TextOnlySnackBar } from '@angular/material/snack-bar';

type Config = MatSnackBarConfig & { panelClass: string[] };

@Injectable({
  providedIn: 'root'
})
export class SnackbarService {
  private config: Config = {
    duration: 2000,
    verticalPosition: 'bottom',
    horizontalPosition: 'right',
    panelClass: ['snackbar']
  }

  constructor(private readonly snackBar: MatSnackBar) { }


  open(message: string, action = '', options: MatSnackBarConfig = {}): MatSnackBarRef<TextOnlySnackBar> {
    return this.snackBar.open(message, action, {
      ...this.config,
      ...options,
      panelClass: [...this.config.panelClass, ...(options.panelClass || [])],
    } as MatSnackBarConfig<any>)
  }

  openFromComponent<T>(component:  ComponentType<T>, options: MatSnackBarConfig = {}): MatSnackBarRef<T> {
    return this.snackBar.openFromComponent<T>(component, {
      ...this.config,
      ...options,
      panelClass: [...this.config.panelClass, ...(options.panelClass || [])],
    } as MatSnackBarConfig<any>)
  }
}
