import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeartbeatService } from './services/heartbeat.service';
import { SocketService } from './services/socket.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'Front_end';
  private heartbeatService = inject(HeartbeatService);
  private socketService = inject(SocketService);

  ngOnInit() {
    // Heartbeat service will automatically start when user is authenticated
    // It subscribes to authService.user$ in its constructor
    // Socket service will automatically connect when injected
  }
}
