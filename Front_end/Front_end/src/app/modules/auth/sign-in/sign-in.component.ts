import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-sign-in',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './sign-in.component.html',
  styleUrl: './sign-in.component.scss'
})
export class SignInComponent implements OnInit {
  signinForm!: FormGroup;
  isLoading = false;
  errorMessage = '';

  constructor(private fb: FormBuilder) {}

  auth = inject(AuthService);
  router = inject(Router);

  ngOnInit() {
    this.initializeForm();
  }

  initializeForm() {
    this.signinForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  onSubmit() {
    if (this.signinForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      
      const { email, password } = this.signinForm.value;
      
      this.auth.login({ email, password }).subscribe({
        next: (res) => {
          console.log(res);
          this.isLoading = false;
          // Navigate to dashboard or home page after successful login
          this.router.navigate(['/']);
        },
        error: (err) => {
          this.isLoading = false;
          this.errorMessage = err.error?.message || 'Invalid email or password. Please try again.';
        }
      });
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.signinForm.controls).forEach(key => {
        this.signinForm.get(key)?.markAsTouched();
      });
    }
  }

  goToSignUp() {
    this.router.navigate(['/auth/sign-up']);
  }

  goToForgotPassword() {
    this.router.navigate(['/auth/forgot-password']);
  }
}
