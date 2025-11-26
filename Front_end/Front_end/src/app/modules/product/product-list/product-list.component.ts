import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Product, ProductService } from '../../../services/product.service';

@Component({
  selector: 'app-product-list',
  imports: [CommonModule],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.scss'
})
export class ProductListComponent implements OnInit {
  products: Product[] = [];
  isLoading = false;
  errorMessage = '';
  deleteConfirmId: string | null = null;

  productService = inject(ProductService);
  router = inject(Router);

  ngOnInit(): void {
    this.loadProducts(true);
  }

  loadProducts(showLoading = false): void {
    if (showLoading) {
      this.isLoading = true;
    }
    this.errorMessage = '';
    this.productService.getAll().subscribe({
      next: (products) => {
        this.products = products;
        this.isLoading = false;
      },
      error: (error) => {
        console.error(error);
        this.errorMessage = 'Unable to load products. Please try again.';
        this.isLoading = false;
      }
    });
  }

  goToCreate(): void {
    this.router.navigate(['/products/create']);
  }

  goToEdit(id: string): void {
    this.router.navigate(['/products/edit', id]);
  }

  confirmDelete(id: string): void {
    this.deleteConfirmId = id;
  }

  cancelDelete(): void {
    this.deleteConfirmId = null;
  }

  deleteProduct(id: string): void {
    this.isLoading = true;
    this.productService.delete(id).subscribe({
      next: () => {
        this.deleteConfirmId = null;
        this.loadProducts(false);
      },
      error: (error) => {
        console.error(error);
        this.errorMessage = 'Unable to delete product. Please try again.';
        this.isLoading = false;
        this.deleteConfirmId = null;
      }
    });
  }

  formatCurrency(value: number | undefined): string {
    if (value === undefined || value === null) {
      return '—';
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  }
}

