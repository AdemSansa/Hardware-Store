import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { InvoiceService } from '../../services/invoice.service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { InvoiceRangeDialogComponent } from './invoice-range-dialog.component';

@Component({
  selector: 'app-home',
  imports: [CommonModule, MatDialogModule, InvoiceRangeDialogComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  currentUser: any = null;

  auth = inject(AuthService);
  router = inject(Router);
  invoiceService = inject(InvoiceService);
  dialog = inject(MatDialog);

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

  downloadBlankInvoice() {
    const dialogRef = this.dialog.open(InvoiceRangeDialogComponent, {
      width: '420px',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (!result) return;

      const start = Number(result.start);
      const end = Number(result.end);

      this.invoiceService.generateInvoices(start, end).subscribe({
        next: (blob) => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `invoices-${start}-to-${end}.pdf`;
          a.click();
          window.URL.revokeObjectURL(url);
        },
        error: (err) => {
          console.error('Failed to generate invoices PDF', err);
          window.alert('Failed to generate invoices PDF.');
        }
      });
    });
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

