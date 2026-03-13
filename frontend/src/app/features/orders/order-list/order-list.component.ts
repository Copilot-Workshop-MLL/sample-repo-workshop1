import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Order } from '../../../core/models/product-order.models';
import { OrderService } from '../../../core/services/order.service';
import { PermissionService } from '../../../core/services/permission.service';

@Component({
  selector: 'app-order-list',
  templateUrl: './order-list.component.html',
  styleUrls: ['./order-list.component.scss'],
})
export class OrderListComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  orders: Order[] = [];
  filteredOrders: Order[] = [];
  displayedColumns = ['orderNumber', 'customer', 'items', 'total', 'status', 'actions'];
  loading = false;
  showSearch = false;
  searchQuery = '';

  constructor(
    private orderService: OrderService,
    private snackBar: MatSnackBar,
    public permissionService: PermissionService
  ) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.orderService.getAll().subscribe({
      next: (data) => { this.orders = data; this.filteredOrders = data; this.loading = false; },
      error: () => { this.snackBar.open('Failed to load orders', 'Close', { duration: 3000 }); this.loading = false; },
    });
  }

  search(): void {
    this.showSearch = !this.showSearch;
    if (!this.showSearch) { this.searchQuery = ''; this.filteredOrders = this.orders; }
  }

  applySearch(): void {
    const q = this.searchQuery.toLowerCase();
    this.filteredOrders = this.orders.filter(o =>
      o.orderNumber.toLowerCase().includes(q) ||
      o.customer.toLowerCase().includes(q) ||
      o.status.toLowerCase().includes(q) ||
      o.customerEmail?.toLowerCase().includes(q)
    );
  }

  exportData(): void {
    const headers = 'Order#,Customer,Email,Total,Status,Date';
    const rows = this.filteredOrders.map(o =>
      `${o.orderNumber},"${o.customer}",${o.customerEmail},${o.total},${o.status},${new Date(o.createdAt).toLocaleDateString()}`
    );
    const csv = [headers, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'orders.csv'; a.click();
    URL.revokeObjectURL(url);
    this.snackBar.open('Orders exported', 'Close', { duration: 2000 });
  }

  importData(): void {
    this.fileInput.nativeElement.click();
  }

  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.snackBar.open(`Importing ${file.name}...`, 'Close', { duration: 2000 });
    this.fileInput.nativeElement.value = '';
  }

  updateStatus(order: Order, status: string): void {
    this.orderService.update(order._id, { status: status as any }).subscribe({
      next: (updated) => {
        order.status = updated.status;
        this.snackBar.open('Status updated', 'Close', { duration: 2000 });
      },
      error: () => this.snackBar.open('Update failed', 'Close', { duration: 3000 }),
    });
  }

  delete(id: string): void {
    if (!confirm('Delete this order?')) return;
    this.orderService.delete(id).subscribe({
      next: () => { this.orders = this.orders.filter(o => o._id !== id); this.snackBar.open('Order deleted', 'Close', { duration: 3000 }); },
      error: () => this.snackBar.open('Delete failed', 'Close', { duration: 3000 }),
    });
  }

  statusColor(status: string): string {
    const map: Record<string, string> = {
      pending: 'accent', processing: 'primary', shipped: 'primary',
      delivered: '', cancelled: 'warn',
    };
    return map[status] || '';
  }
}
