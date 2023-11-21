import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { MsalService } from '@azure/msal-angular';
import { Router } from '@angular/router';
import { Observable, of, switchMap, take } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthGuardService{

  constructor(private authService: MsalService, private router: Router) {}

  canActivate(): boolean {
    const isAuthenticated = this.authService.instance.getAllAccounts().length > 0;
    if (!isAuthenticated) {
      // Si el usuario no está autenticado, redirige a otra ruta (por ejemplo, '/login')
      this.router.navigate(['/login']);
    }

    return isAuthenticated;
  }
}