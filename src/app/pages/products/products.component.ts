import { Component } from '@angular/core';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss']
})
export class ProductsComponent {
  onSearch(value: string) { console.log('Search:', value); }
  onFilter()              { console.log('Filter clicked'); }
  onExcel()               { console.log('Excel export'); }
}
