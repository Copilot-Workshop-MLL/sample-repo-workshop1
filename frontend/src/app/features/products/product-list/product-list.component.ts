import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Product } from '../../../core/models/product-order.models';
import { ProductService } from '../../../core/services/product.service';
import { PermissionService } from '../../../core/services/permission.service';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss'],
})
export class ProductListComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  products: Product[] = [];
  filteredProducts: Product[] = [];
  displayedColumns = ['sku', 'name', 'category', 'price', 'stock', 'status', 'actions'];
  loading = false;
  showSearch = false;
  searchQuery = '';

  constructor(
    private productService: ProductService,
    private snackBar: MatSnackBar,
    public permissionService: PermissionService
  ) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.productService.getAll().subscribe({
      next: (data) => { this.products = data; this.filteredProducts = data; this.loading = false; },
      error: () => { this.snackBar.open('Failed to load products', 'Close', { duration: 3000 }); this.loading = false; },
    });
  }

  search(): void {
    this.showSearch = !this.showSearch;
    if (!this.showSearch) { this.searchQuery = ''; this.filteredProducts = this.products; }
  }

  applySearch(): void {
    const q = this.searchQuery.toLowerCase();
    this.filteredProducts = this.products.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.sku.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.description?.toLowerCase().includes(q)
    );
  }

  exportData(): void {
    const headers = 'SKU,Name,Category,Price,Stock,Status';
    const rows = this.filteredProducts.map(p =>
      `${p.sku},"${p.name}",${p.category},${p.price},${p.stock},${p.isActive ? 'Active' : 'Inactive'}`
    );
    const csv = [headers, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'products.csv'; a.click();
    URL.revokeObjectURL(url);
    this.snackBar.open('Products exported', 'Close', { duration: 2000 });
  }

  importData(): void {
    this.fileInput.nativeElement.click();
  }

  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.snackBar.open(`Importing ${file.name}...`, 'Close', { duration: 2000 });
    // Reset file input so same file can be re-selected
    this.fileInput.nativeElement.value = '';
  }

  delete(id: string): void {
    if (!confirm('Delete this product?')) return;
    this.productService.delete(id).subscribe({
      next: () => { this.products = this.products.filter(p => p._id !== id); this.snackBar.open('Product deleted', 'Close', { duration: 3000 }); },
      error: () => this.snackBar.open('Delete failed', 'Close', { duration: 3000 }),
    });
  }
}
