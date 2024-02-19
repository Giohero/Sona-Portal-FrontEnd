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
      'indexdb',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        'assets/icons/indexdb.svg'
      )
    );
    this.matIconRegistry.addSvgIcon(
      'sap',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        'assets/icons/sap.svg'
      )
    );
    this.matIconRegistry.addSvgIcon(
      'cosmosdb',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        'assets/icons/cosmosdb.svg'
      )
    );
    this.matIconRegistry.addSvgIcon(
      'cart',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        'assets/icons/cart.svg'
      )
    );
    this.matIconRegistry.addSvgIcon(
      'search',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        'assets/icons/search.svg'
      )
    );
    this.matIconRegistry.addSvgIcon(
      'barCode',
      this.domSanitizer.bypassSecurityTrustResourceUrl(
        'assets/icons/barCode.svg'
      )
    );
  }
}
