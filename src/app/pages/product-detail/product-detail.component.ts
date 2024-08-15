import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-product-detail',
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class ProductDetailComponent implements OnInit {
  @Input() product: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService
  ) {}

  ngOnInit(): void {
    const productId = this.route.snapshot.paramMap.get('id');
    if (productId) {
      this.productService.getProductById(productId).subscribe(data => {
        this.product = data;
      });
    }
  }

  onEdit(): void {
    this.router.navigate(['/edit', this.product.id]);
  }

  onDelete(): void {
    if (confirm('¿Estás seguro de eliminar el producto?')) {
      this.productService.deleteProduct(this.product.id).subscribe(() => {
        alert('Producto eliminado correctamente');
        this.router.navigate(['/products']);
      });
    }
  }
}
