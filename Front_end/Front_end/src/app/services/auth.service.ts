import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, map, Observable, tap, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
  sub?: string;
  roles?: string[];
  exp?: number;
  [key: string]: any;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  
  private accessToken: string | null = null; // in-memory access token
  private userSubject = new BehaviorSubject<any>(null);
  public user$ = this.userSubject.asObservable();

  constructor(private http: HttpClient) {
    // Initialize token from localStorage on service creation
    this.initializeToken();
  }

  // Initialize token from localStorage
  private initializeToken() {
    const storedToken = localStorage.getItem('accessToken');
    if (storedToken) {
      // Verify token is still valid before restoring
      try {
        const decoded = jwtDecode<DecodedToken>(storedToken);
        if (decoded.exp && decoded.exp * 1000 > Date.now()) {
          this.setAccessToken(storedToken);
        } else {
          // Token expired, remove it
          localStorage.removeItem('accessToken');
        }
      } catch (err) {
        // Invalid token, remove it
        localStorage.removeItem('accessToken');
      }
    }
  }

  // register
  register(payload: { email: string; password: string; fullName: string}) {
    return this.http.post(`${environment.apiUrl}/auth/register`, payload);
  }

  // login: backend should set httpOnly refresh cookie and return access token in body
  login(credentials: { email: string; password: string; }): Observable<any> {
    return this.http.post<{ accessToken: string }>(`${environment.apiUrl}/auth/login`, credentials, { withCredentials: true })
      .pipe(
        tap(res => {
          if (res?.accessToken) {
            this.setAccessToken(res.accessToken);
          }
        })
      );
  }

  // set access token in memory, localStorage and update user observable
  private setAccessToken(token: string | null) {
    this.accessToken = token;
    
    // Persist to localStorage
    if (token) {
      localStorage.setItem('accessToken', token);
      try {
        const decoded = jwtDecode<DecodedToken>(token);
        
        
        this.userSubject.next({ id: decoded.sub,email: decoded['raw'].email, name: decoded['raw'].name, roles: decoded.roles || [] , raw: decoded, accessToken: token});
      } catch (err) {
        this.userSubject.next(null);
        localStorage.removeItem('accessToken');
      }
    } else {
      localStorage.removeItem('accessToken');
      this.userSubject.next(null);
    }
  }

  // used by interceptor
  getAccessToken(): string | null {
    // Return from memory first, fallback to localStorage
    if (this.accessToken) {
      return this.accessToken;
    }
    const storedToken = localStorage.getItem('accessToken');
    if (storedToken) {
      // Restore to memory
      this.accessToken = storedToken;
      return storedToken;
    }
    return null;
  }

  // call refresh endpoint (server reads refresh cookie)
  refreshAccessToken(): Observable<string> {
    return this.http.post<{ accessToken: string }>(`${environment.apiUrl}/auth/refresh`, {}, { withCredentials: true })
      .pipe(
        map(res => {
          if (!res?.accessToken) throw new Error('No access token in refresh response');
          this.setAccessToken(res.accessToken);
          return res.accessToken;
        }),
        catchError(err => {
          this.logout().subscribe(() => {});
          return throwError(() => err);
        })
      );
  }

  logout(): Observable<any> {
    // server will clear refresh cookie
    return this.http.post(`${environment.apiUrl}/auth/logout`, {}, { withCredentials: true })
      .pipe(
        tap(() => {
          this.setAccessToken(null);
        }), 
        catchError(err => {
          // still clear locally
          this.setAccessToken(null);
          return throwError(() => err);
        })
      );
  }

  isAuthenticated(): boolean {
    // Check memory first, then localStorage
    const token = this.accessToken || localStorage.getItem('accessToken');
    if (!token) return false;
    
    try {
      const decoded = jwtDecode<DecodedToken>(token);
      const isValid = decoded.exp ? decoded.exp * 1000 > Date.now() : true;
      
      // If token is expired, clean it up
      if (!isValid) {
        this.setAccessToken(null);
      } else if (!this.accessToken) {
        // Restore valid token to memory
        this.accessToken = token;
      }
      
      return isValid;
    } catch {
      // Invalid token, clean it up
      this.setAccessToken(null);
      return false;
    }
  }
  verifyEmail(token: string): Observable<any> {
    return this.http.get(`${environment.apiUrl}/auth/verify-email?token=${token}`);
  }

  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${environment.apiUrl}/auth/forgot-password`, { email });
  }

  resetPassword(token: string, password: string): Observable<any> {
    return this.http.post(`${environment.apiUrl}/auth/reset-password`, { token, password });
  }
}

    


  
 
