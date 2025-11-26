import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { UserService, User } from '../../../services/user.service';
import { SocketService } from '../../../services/socket.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-user-list',
  imports: [CommonModule],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.scss'
})
export class UserListComponent implements OnInit, OnDestroy {
  users: User[] = [];
  isLoading = false;
  errorMessage = '';
  deleteConfirmId: string | null = null;
  private socketSubscriptions: Subscription[] = [];

  userService = inject(UserService);
  router = inject(Router);
  socketService = inject(SocketService);

  ngOnInit() {
    this.loadUsers(true);
    
    // Listen for real-time user status updates
    const userStatusSub = this.socketService.userStatusUpdate$.subscribe((updatedUser: User) => {
      this.updateUserInList(updatedUser);
    });
    this.socketSubscriptions.push(userStatusSub);

    // Listen for all users updates (when users are created, updated, or deleted)
    const allUsersSub = this.socketService.allUsersUpdate$.subscribe((users: User[]) => {
      this.users = users;
    });
    this.socketSubscriptions.push(allUsersSub);
  }

  ngOnDestroy() {
    this.socketSubscriptions.forEach(sub => sub.unsubscribe());
  }

  private updateUserInList(updatedUser: User): void {
    const index = this.users.findIndex(u => u._id === updatedUser._id);
    if (index !== -1) {
      // Update existing user
      this.users[index] = { ...this.users[index], ...updatedUser };
    }
  }

  loadUsers(showLoading = true) {
    if (showLoading) {
      this.isLoading = true;
    }
    this.errorMessage = '';
    this.userService.getAll().subscribe({
      next: (users) => {
        this.users = users;
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = 'Error loading users. Please try again.';
        this.isLoading = false;
        console.error(err);
      }
    });
  }

  goToCreate() {
    this.router.navigate(['/users/create']);
  }

  goToEdit(id: string) {
    this.router.navigate(['/users/edit', id]);
  }

  confirmDelete(id: string) {
    this.deleteConfirmId = id;
  }

  cancelDelete() {
    this.deleteConfirmId = null;
  }

  deleteUser(id: string) {
    this.isLoading = true;
    this.userService.delete(id).subscribe({
      next: () => {
        // Real-time update will be handled by socket
        this.deleteConfirmId = null;
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage = 'Error deleting user. Please try again.';
        this.isLoading = false;
        this.deleteConfirmId = null;
        console.error(err);
      }
    });
  }

  formatDate(dateString?: string): string {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  }

  formatLastOnline(lastOnline?: string): string {
    if (!lastOnline) return 'Never';
    
    const lastOnlineDate = new Date(lastOnline);
    const now = new Date();
    const diffMs = now.getTime() - lastOnlineDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    return lastOnlineDate.toLocaleDateString();
  }
}

