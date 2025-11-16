import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-verify-email',
  imports: [CommonModule],
  templateUrl: './verify-email.component.html',
  styleUrl: './verify-email.component.scss'
})
export class VerifyEmailComponent implements OnInit {
  authService = inject(AuthService);
  router = inject(Router);
  
  isLoading = true;
  isSuccess = false;
  isError = false;
  errorMessage = '';

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const token = params['token'];
      
      if (!token) {
        this.isLoading = false;
        this.isError = true;
        this.errorMessage = 'Invalid verification link';
        return;
      }

      this.authService.verifyEmail(token).subscribe({
        next: (res) => {
          this.isLoading = false;
          this.isSuccess = true;
        },
        error: (err) => {
          this.isLoading = false;
          this.isError = true;
          this.errorMessage = err.error?.message || 'Error verifying email. Please try again later.';
        }
      });
    });
  }

  goToSignIn() {
    this.router.navigate(['/auth/sign-in']);
  }

  goToSignUp() {
    this.router.navigate(['/auth/sign-up']);
  }
}
