import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-main-layout',
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss']
})
export class MainLayoutComponent implements OnInit {
  sidebarOpen = false;

  constructor(private auth: AuthService) {}

  ngOnInit(): void {
    if (this.auth.isLoggedIn() && this.auth.myModules.length === 0) {
      this.auth.loadModules().subscribe();
    }
  }

  toggleSidebar() { this.sidebarOpen = !this.sidebarOpen; }
  closeSidebar()   { this.sidebarOpen = false; }
}
