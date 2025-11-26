import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';
import { interval, Subscription } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class HeartbeatService implements OnDestroy {
  private heartbeatInterval: Subscription | null = null;
  private readonly HEARTBEAT_INTERVAL_MS = 2 * 60 * 1000; // Send heartbeat every 2 minutes

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {
    // Start heartbeat when service is created if user is authenticated
    this.authService.user$.subscribe(user => {
      if (user) {
        this.startHeartbeat();
      } else {
        this.stopHeartbeat();
      }
    });
  }

  startHeartbeat(): void {
    // Stop any existing heartbeat
    this.stopHeartbeat();
    
    // Send initial heartbeat
    this.sendHeartbeat();
    
    // Set up periodic heartbeats
    this.heartbeatInterval = interval(this.HEARTBEAT_INTERVAL_MS).subscribe(() => {
      this.sendHeartbeat();
    });
  }

  stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      this.heartbeatInterval.unsubscribe();
      this.heartbeatInterval = null;
    }
  }

  private sendHeartbeat(): void {
    if (!this.authService.isAuthenticated()) {
      this.stopHeartbeat();
      return;
    }

    this.http.post(`${environment.apiUrl}/users/heartbeat`, {}).subscribe({
      next: () => {
        // Heartbeat sent successfully
      },
      error: (err) => {
        // If unauthorized, stop heartbeat
        if (err.status === 401) {
          this.stopHeartbeat();
        }
      }
    });
  }

  ngOnDestroy(): void {
    this.stopHeartbeat();
  }
}

