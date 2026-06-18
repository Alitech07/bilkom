import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-grid-toolbar',
  templateUrl: './grid-toolbar.component.html',
  styleUrls: ['./grid-toolbar.component.scss']
})
export class GridToolbarComponent {
  @Input() showSearch = true;
  @Input() showFilter = true;
  @Input() showExcel  = true;

  @Output() searchChange = new EventEmitter<string>();
  @Output() filterClick  = new EventEmitter<void>();
  @Output() excelClick   = new EventEmitter<void>();

  searchOpen = false;
  searchValue = '';

  toggleSearch() {
    this.searchOpen = !this.searchOpen;
    if (!this.searchOpen) {
      this.searchValue = '';
      this.searchChange.emit('');
    }
  }

  onSearch(value: string) {
    this.searchValue = value;
    this.searchChange.emit(value);
  }
}
