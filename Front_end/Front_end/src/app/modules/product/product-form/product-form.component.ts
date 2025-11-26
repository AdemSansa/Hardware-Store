import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Product, ProductService } from '../../../services/product.service';

@Component({
  selector: 'app-product-form',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './product-form.component.html',
  styleUrl: './product-form.component.scss'
})
export class ProductFormComponent implements OnInit {
  productForm!: FormGroup;
  isLoading = false;
  isEditMode = false;
  productId: string | null = null;
  errorMessage = '';
  successMessage = '';

  fb = inject(FormBuilder);
  route = inject(ActivatedRoute);
  router = inject(Router);
  productService = inject(ProductService);

  ngOnInit(): void {
    this.initializeForm();

    this.route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.isEditMode = true;
        this.productId = id;
        this.loadProduct(id);
      }
    });
  }

  initializeForm(): void {
    this.productForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      sku: [''],
      description: [''],
      category: [''],
      price: [0, [Validators.required, Validators.min(0)]],
      stock: [0, [Validators.required, Validators.min(0)]],
      isActive: [true]
    });
  }

  loadProduct(id: string): void {
    this.isLoading = true;
    this.productService.getOne(id).subscribe({
      next: (product) => {
        this.patchForm(product);
        this.isLoading = false;
      },
      error: (error) => {
        console.error(error);
        this.errorMessage = 'Unable to load product. Please try again.';
        this.isLoading = false;
      }
    });
  }

  patchForm(product: Product): void {
    this.productForm.patchValue({
      name: product.name,
      sku: product.sku,
      description: product.description,
      category: product.category,
      price: product.price,
      stock: product.stock,
      isActive: product.isActive
    });
  }

  onSubmit(): void {
    if (this.productForm.invalid || this.isLoading) {
      this.productForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const payload: Partial<Product> = {
      ...this.productForm.value,
      price: Number(this.productForm.value.price),
      stock: Number(this.productForm.value.stock)
    };

    const request$ = this.isEditMode && this.productId
      ? this.productService.update(this.productId, payload)
      : this.productService.create(payload);

    request$.subscribe({
      next: () => {
        this.successMessage = this.isEditMode ? 'Product updated successfully!' : 'Product created successfully!';
        this.isLoading = false;
        setTimeout(() => this.router.navigate(['/products']), 1200);
      },
      error: (error) => {
        console.error(error);
        this.errorMessage = error.error?.message || 'Unable to save product. Please try again.';
        this.isLoading = false;
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/products']);
  }
}

