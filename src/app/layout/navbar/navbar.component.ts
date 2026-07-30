import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
  imports: [CommonModule, RouterModule]
})
export class NavbarComponent implements OnInit {
  isMenuOpen = false;
  isHidden = false;
  private lastScrollTop = 0;

  ngOnInit(): void {
    this.handleScroll();
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu(): void {
    this.isMenuOpen = false;
  }

  @HostListener('window:scroll')
  onScroll(): void {
    const currentScrollTop = window.scrollY || 0;
    this.isHidden = currentScrollTop > this.lastScrollTop && currentScrollTop > 80;
    this.lastScrollTop = currentScrollTop;
  }

  private handleScroll(): void {
    this.isHidden = window.scrollY > 80;
  }
}
