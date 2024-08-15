import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductService } from '../../services/product.service';
import { Router } from '@angular/router';
import { ConfirmDeleteModalComponent } from '../modals/confirm-delete-modal/confirm-delete-modal.component';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css'],
  standalone: true,
  imports: [CommonModule, ConfirmDeleteModalComponent]
})
export class ProductListComponent implements OnInit {
  products: any[] = [];
  filteredProducts: any[] = [];
  recordsToShow = 5;
  searchTerm = '';
  showModal = false;
  item: any;

  constructor(private productService: ProductService, private router: Router) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.productService.getProducts().subscribe(data => {
      this.products = data.data;
      this.filterProducts();
    });
  }

  onSearch(event: Event): void {
    this.searchTerm = (event.target as HTMLInputElement).value.toLowerCase();
    this.filterProducts();
  }

  onSelectChange(event: Event): void {
    this.recordsToShow = parseInt((event.target as HTMLSelectElement).value, 10);
    this.filterProducts();
  }

  filterProducts(): void {
    const filtered = this.products.filter(product =>
      product.name.toLowerCase().includes(this.searchTerm)
    );
    this.filteredProducts = filtered.slice(0, this.recordsToShow);
  }

  onDelete(product: any): void {
    this.item = product;
    this.showModal = true;
  }

  confirmDelete(): void {
    if (this.item) {
      this.productService.deleteProduct(this.item.id).subscribe(() => {
        this.loadProducts();
        this.showModal = false;
      });
    }
  }

  onEdit(product: any): void {
    this.router.navigate(['/edit', product.id]);
  }

  cancelDelete(): void {
    this.showModal = false;
    this.item = null;
  }

  onAdd(): void {
    this.router.navigate(['/add']);
  }
}
