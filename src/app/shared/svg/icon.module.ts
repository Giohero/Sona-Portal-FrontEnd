import { NgModule } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
@NgModule({})
export class IconModule {
  constructor(
    private domSanitizer: DomSanitizer,
    private matIconRegistry: MatIconRegistry
  ) {
    this.matIconRegistry.addSvgIcon(
      'indexdb-icon',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        'assets/icons/indexdb-icon.svg'
      )
    );
  }
}
