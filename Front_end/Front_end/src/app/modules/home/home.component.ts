import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-home',
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  currentUser: any = null;

  auth = inject(AuthService);
  router = inject(Router);

  ngOnInit() {
    this.auth.user$.subscribe(user => {
      this.currentUser = user;
     
    });
  }

  goToUsers() {
    this.router.navigate(['/users']);
  }

  goToProducts() {
    this.router.navigate(['/products']);
  }

  goToShowroom() {
    this.router.navigate(['/showroom']);
  }

  logout() {
    this.auth.logout().subscribe({
      next: () => {
        this.router.navigate(['/auth/sign-in']);
      },
      error: () => {
        this.router.navigate(['/auth/sign-in']);
      }
    });
  }
}

