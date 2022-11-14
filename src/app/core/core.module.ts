import { NgModule, Optional, SkipSelf } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SocketService } from './services/socket/socket.service';
import { ConnectionsService } from './services/connections/connections.service';
import { LocalStorageService } from './services/localStorage/local-storage.service';
import { UserService } from './services/user/user.service';

const throwIfAlreadyLoaded = (parentModule: any, moduleName: string): void => {
  if (parentModule) {
    throw new Error(
      `${moduleName} has already been loaded. Import Core modules in the AppModule only.`,
    );
  }
};

@NgModule({
  declarations: [],
  providers: [SocketService, ConnectionsService, LocalStorageService, UserService],
  imports: [
    CommonModule
  ]
})
export class CoreModule {
  constructor(@Optional() @SkipSelf() parentModule: CoreModule) {
    throwIfAlreadyLoaded(parentModule, 'CoreModule');
  }
}