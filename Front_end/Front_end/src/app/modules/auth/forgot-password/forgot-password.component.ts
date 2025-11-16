import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-forgot-password',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss'
})
export class ForgotPasswordComponent implements OnInit {
  forgotPasswordForm!: FormGroup;
  isLoading = false;
  isSuccess = false;
  errorMessage = '';

  constructor(private fb: FormBuilder) {}

  auth = inject(AuthService);
  router = inject(Router);

  ngOnInit() {
    this.initializeForm();
  }

  initializeForm() {
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit() {
    if (this.forgotPasswordForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      this.isSuccess = false;
      
      const { email } = this.forgotPasswordForm.value;
      
      this.auth.forgotPassword(email).subscribe({
        next: (res) => {
          this.isLoading = false;
          this.isSuccess = true;
        },
        error: (err) => {
          this.isLoading = false;
          this.errorMessage = err.error?.message || 'Error sending reset email. Please try again later.';
        }
      });
    } else {
      this.forgotPasswordForm.get('email')?.markAsTouched();
    }
  }

  goToSignIn() {
    this.router.navigate(['/auth/sign-in']);
  }
}

