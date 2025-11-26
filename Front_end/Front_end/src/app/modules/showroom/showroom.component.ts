import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product, ProductService } from '../../services/product.service';

@Component({
  selector: 'app-showroom',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './showroom.component.html',
  styleUrl: './showroom.component.scss'
})
export class ShowroomComponent implements OnInit {
  private productService = inject(ProductService);

  products: Product[] = [];
  filteredProducts: Product[] = [];
  isLoading = false;
  errorMessage = '';

  searchTerm = '';
  selectedCategory = 'all';

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.productService.getAll().subscribe({
      next: (products) => {
        // Only show active products in the client showroom
        this.products = products.filter(p => p.isActive !== false);
        this.applyFilters();
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = 'Unable to load products for the showroom. Please try again later.';
        this.isLoading = false;
      }
    });
  }

  get categories(): string[] {
    const set = new Set<string>();
    this.products.forEach(p => {
      if (p.category) {
        set.add(p.category);
      }
    });
    return Array.from(set.values());
  }

  onSearchChange(value: string): void {
    this.searchTerm = value;
    this.applyFilters();
  }

  onCategoryChange(value: string): void {
    this.selectedCategory = value;
    this.applyFilters();
  }

  private applyFilters(): void {
    const term = this.searchTerm.toLowerCase().trim();
    this.filteredProducts = this.products.filter(product => {
      const matchesCategory =
        this.selectedCategory === 'all' ||
        (product.category || '').toLowerCase() === this.selectedCategory.toLowerCase();

      const matchesSearch =
        !term ||
        product.name.toLowerCase().includes(term) ||
        (product.description || '').toLowerCase().includes(term) ||
        (product.sku || '').toLowerCase().includes(term);

      return matchesCategory && matchesSearch;
    });
  }

  formatPrice(value: number | undefined): string {
    if (value === undefined || value === null) {
      return '—';
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  }
}


