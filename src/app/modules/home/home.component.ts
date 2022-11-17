import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommunicationEventTypes, SocketService } from 'src/app/core/services/socket/socket.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  constructor(private readonly router: Router) {
  }

  ngOnInit(): void {
  }

  createRoom(): void {
    const roomId = Math.random().toString(36).substring(2, 13); 
    this.router.navigate(['/room', roomId]);
  }

}
