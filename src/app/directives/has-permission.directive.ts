import { Directive, Input, OnInit, TemplateRef, ViewContainerRef } from '@angular/core';
import { AuthService } from '../services/auth.service';

@Directive({ selector: '[appHasPermission]' })
export class HasPermissionDirective implements OnInit {
  @Input() appHasPermission = '';

  constructor(
    private tpl: TemplateRef<any>,
    private vcr: ViewContainerRef,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    if (this.auth.has(this.appHasPermission)) {
      this.vcr.createEmbeddedView(this.tpl);
    }
  }
}
