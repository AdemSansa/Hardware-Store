import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-invoice-range-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule
  ],
  template: `
    <h2 mat-dialog-title>Generate Empty Invoices</h2>
    <div mat-dialog-content [formGroup]="form" class="dialog-content">
      <p>Choose the invoice number range you want to generate.</p>

      <div class="field-row">
        <mat-form-field appearance="outline" class="field">
          <mat-label>Start number</mat-label>
          <input matInput type="number" formControlName="start" placeholder="e.g. 25250" />
        </mat-form-field>

        <mat-form-field appearance="outline" class="field">
          <mat-label>End number</mat-label>
          <input matInput type="number" formControlName="end" placeholder="e.g. 25260" />
        </mat-form-field>
      </div>

      <div *ngIf="form.invalid && (form.dirty || form.touched)" class="error">
        Please enter valid numbers and make sure end ≥ start.
      </div>
    </div>

    <div mat-dialog-actions align="end" class="dialog-actions">
      <button mat-button type="button" (click)="onCancel()">Cancel</button>
      <button mat-raised-button color="primary" type="button" [disabled]="form.invalid" (click)="onGenerate()">
        Generate
      </button>
    </div>
  `,
  styles: [`
    .dialog-content {
      min-width: 360px;
    }
    .field-row {
      display: flex;
      gap: 12px;
      margin-top: 12px;
    }
    .field {
      flex: 1;
    }
    .dialog-actions {
      margin-top: 8px;
    }
    .error {
      margin-top: 8px;
      color: #d32f2f;
      font-size: 0.85rem;
    }
  `]
})
export class InvoiceRangeDialogComponent {
  private dialogRef = inject(MatDialogRef<InvoiceRangeDialogComponent>);
  private fb = inject(FormBuilder);

  form: FormGroup = this.fb.group({
    start: [null, [Validators.required, Validators.min(1)]],
    end: [null, [Validators.required, Validators.min(1)]],
  }, {
    validators: (group: FormGroup) => {
      const start = group.get('start')?.value;
      const end = group.get('end')?.value;
      if (start != null && end != null && end < start) {
        return { rangeInvalid: true };
      }
      return null;
    }
  });

  onCancel() {
    this.dialogRef.close(null);
  }

  onGenerate() {
    if (this.form.invalid) return;
    const { start, end } = this.form.value;
    this.dialogRef.close({ start, end });
  }
}


