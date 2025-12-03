import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class InvoiceService {
  constructor(private http: HttpClient) {}

  generateInvoices(start: number, end: number): Observable<Blob> {
    return this.http.get(`${environment.apiUrl}/invoices/blank`, {
      responseType: 'blob' as 'json',
      params: {
        start: start.toString(),
        end: end.toString()
      }
    }) as unknown as Observable<Blob>;
  }
}


