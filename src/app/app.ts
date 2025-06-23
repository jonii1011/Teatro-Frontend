import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet, 
    RouterLink, 
    RouterLinkActive,
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatSidenavModule,
    MatListModule
  ],
  template: `
    <div class="app-container">
      <mat-toolbar color="primary" class="app-toolbar">
        <span>🎭 Teatro Gran Espectáculo</span>
        <span class="spacer"></span>
        <button mat-icon-button>
          <mat-icon>account_circle</mat-icon>
        </button>
      </mat-toolbar>

      <mat-sidenav-container class="app-sidenav-container">
        <mat-sidenav mode="side" opened class="app-sidenav">
          <mat-nav-list>
            <a mat-list-item routerLink="/dashboard" routerLinkActive="active">
              <mat-icon matListItemIcon>dashboard</mat-icon>
              <span matListItemTitle>Dashboard</span>
            </a>
            
            <a mat-list-item routerLink="/clientes" routerLinkActive="active">
              <mat-icon matListItemIcon>people</mat-icon>
              <span matListItemTitle>Clientes</span>
            </a>
            
            <a mat-list-item routerLink="/eventos" routerLinkActive="active">
              <mat-icon matListItemIcon>event</mat-icon>
              <span matListItemTitle>Eventos</span>
            </a>
            
            <a mat-list-item routerLink="/reservas" routerLinkActive="active">
              <mat-icon matListItemIcon>confirmation_number</mat-icon>
              <span matListItemTitle>Reservas</span>
            </a>
            
            <a mat-list-item routerLink="/fidelizacion" routerLinkActive="active">
              <mat-icon matListItemIcon>star</mat-icon>
              <span matListItemTitle>Fidelización</span>
            </a>
          </mat-nav-list>
        </mat-sidenav>

        <mat-sidenav-content class="app-content">
          <div class="content-wrapper">
            <router-outlet></router-outlet>
          </div>
        </mat-sidenav-content>
      </mat-sidenav-container>
    </div>
  `,
  styles: [`
    .app-container {
      height: 100vh;
      display: flex;
      flex-direction: column;
    }

    .app-toolbar {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 2;
      box-shadow: 0 2px 4px rgba(0,0,0,.1);
    }

    .spacer {
      flex: 1 1 auto;
    }

    .app-sidenav-container {
      flex: 1;
      margin-top: 64px; /* altura del toolbar */
    }

    .app-sidenav {
      width: 250px;
      border-right: 1px solid rgba(0,0,0,.12);
    }

    .app-content {
      background-color: #f5f5f5;
    }

    .content-wrapper {
      padding: 20px;
      min-height: calc(100vh - 64px);
    }

    .active {
      background-color: rgba(63, 81, 181, 0.1) !important;
      color: #3f51b5 !important;
    }

    .active mat-icon {
      color: #3f51b5 !important;
    }
  `]
})
export class AppComponent {
  title = 'Teatro Gran Espectáculo';
}
