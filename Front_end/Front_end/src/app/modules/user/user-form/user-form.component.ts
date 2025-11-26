import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService, User } from '../../../services/user.service';

@Component({
  selector: 'app-user-form',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './user-form.component.html',
  styleUrl: './user-form.component.scss'
})
export class UserFormComponent implements OnInit {
  userForm!: FormGroup;
  isLoading = false;
  isEditMode = false;
  userId: string | null = null;
  errorMessage = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute
  ) {}

  userService = inject(UserService);
  router = inject(Router);

  ngOnInit() {
    this.initializeForm();
    
    this.route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.isEditMode = true;
        this.userId = id;
        this.loadUser(id);
      }
    });
  }

  initializeForm() {
    this.userForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', []],
      confirmPassword: ['']
    });

    // Add password validators based on mode
    if (!this.isEditMode) {
      this.userForm.get('password')?.setValidators([Validators.required, Validators.minLength(8)]);
      this.userForm.get('confirmPassword')?.setValidators([Validators.required]);
    } else {
      // In edit mode, password is optional
      this.userForm.get('password')?.setValidators([Validators.minLength(8)]);
    }

    // Add password match validator
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    
    if (password && confirmPassword && password.value && confirmPassword.value) {
      if (password.value !== confirmPassword.value) {
        confirmPassword.setErrors({ passwordMismatch: true });
        return { passwordMismatch: true };
      }
    }
    return null;
  }

  loadUser(id: string) {
    this.isLoading = true;
    this.userService.getOne(id).subscribe({
      next: (user) => {
        this.userForm.patchValue({
          name: user.name,
          email: user.email,
          password: '',
          confirmPassword: ''
        });
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = 'Error loading user. Please try again.';
        this.isLoading = false;
        console.error(err);
      }
    });
  }

  getPasswordStrength(): string {
    const password = this.userForm.get('password')?.value || '';
    if (password.length === 0) return '';
    if (password.length < 6) return 'weak';
    if (password.length < 10) return 'medium';
    return 'strong';
  }

  onSubmit() {
    if (this.userForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      this.successMessage = '';

      const formValue = this.userForm.value;
      const userData: any = {
        name: formValue.name,
        email: formValue.email
      };

      // Only include password if it's provided
      if (formValue.password) {
        userData.password = formValue.password;
      }

      if (this.isEditMode && this.userId) {
        this.userService.update(this.userId, userData).subscribe({
          next: () => {
            this.successMessage = 'User updated successfully!';
            this.isLoading = false;
            setTimeout(() => {
              this.router.navigate(['/users']);
            }, 1500);
          },
          error: (err) => {
            this.errorMessage = err.error?.message || 'Error updating user. Please try again.';
            this.isLoading = false;
          }
        });
      } else {
        this.userService.create(userData).subscribe({
          next: () => {
            this.successMessage = 'User created successfully!';
            this.isLoading = false;
            setTimeout(() => {
              this.router.navigate(['/users']);
            }, 1500);
          },
          error: (err) => {
            this.errorMessage = err.error?.message || 'Error creating user. Please try again.';
            this.isLoading = false;
          }
        });
      }
    } else {
      Object.keys(this.userForm.controls).forEach(key => {
        this.userForm.get(key)?.markAsTouched();
      });
    }
  }

  cancel() {
    this.router.navigate(['/users']);
  }
}

