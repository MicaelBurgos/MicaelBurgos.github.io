import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

declare var bootstrap: any;

@Component({
  selector: 'app-header',
  imports: [CommonModule, RouterLink],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  closeNavbar(): void {
    const navbar = document.getElementById('navbarNav');
    if (!navbar) return;

    const collapse =
      bootstrap.Collapse.getInstance(navbar) || new bootstrap.Collapse(navbar, { toggle: false });

    collapse.hide();
  }
}
