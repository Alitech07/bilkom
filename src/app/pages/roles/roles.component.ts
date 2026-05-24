import { Component } from '@angular/core';

@Component({
  selector: 'app-roles',
  templateUrl: './roles.component.html',
  styleUrls: ['./roles.component.scss']
})
export class RolesComponent {
  onSearch(value: string) { console.log('Search:', value); }
  onFilter()              { console.log('Filter clicked'); }
  onExcel()               { console.log('Excel export'); }
}
