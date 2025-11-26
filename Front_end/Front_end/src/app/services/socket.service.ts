import { Injectable, OnDestroy } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable, Subject } from 'rxjs';
import { environment } from '../../environments/environment';
import { User } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class SocketService implements OnDestroy {
  private socket: Socket | null = null;
  private userStatusUpdateSubject = new Subject<User>();
  private allUsersUpdateSubject = new Subject<User[]>();

  public userStatusUpdate$ = this.userStatusUpdateSubject.asObservable();
  public allUsersUpdate$ = this.allUsersUpdateSubject.asObservable();

  constructor() {
    this.connect();
  }

  private connect(): void {
    this.socket = io(environment.apiUrl.replace('/api/v1', ''), {
      withCredentials: true,
      transports: ['websocket', 'polling']
    });

    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket?.id);
    });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    // Listen for individual user status updates
    this.socket.on('userStatusUpdate', (user: User) => {
      this.userStatusUpdateSubject.next(user);
    });

    // Listen for all users updates
    this.socket.on('allUsersUpdate', (users: User[]) => {
      this.allUsersUpdateSubject.next(users);
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  ngOnDestroy(): void {
    this.disconnect();
  }
}

