import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface User {
  _id?: string;
  name: string;
  email: string;
  password?: string;
  roles?: string[];
  isVerified?: boolean;
  isOnline?: boolean;
  lastOnline?: string;
  createdAt?: string;
  updatedAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor(private http: HttpClient) {}

  getAll(): Observable<User[]> {
    return this.http.get<User[]>(`${environment.apiUrl}/users`);
  }

  getOne(id: string): Observable<User> {
    return this.http.get<User>(`${environment.apiUrl}/users/${id}`);
  }

  create(user: { name: string; email: string; password: string }): Observable<User> {
    return this.http.post<User>(`${environment.apiUrl}/users`, user);
  }

  update(id: string, user: { name: string; email: string; password?: string }): Observable<User> {
    return this.http.put<User>(`${environment.apiUrl}/users/${id}`, user);
  }

  delete(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${environment.apiUrl}/users/${id}`);
  }
}

