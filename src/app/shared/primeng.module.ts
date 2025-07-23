import { NgModule } from '@angular/core';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { MultiSelectModule } from 'primeng/multiselect';
import { TagModule } from 'primeng/tag';
import { DropdownModule } from 'primeng/dropdown';

@NgModule({
  exports: [
    TableModule,
    InputTextModule,
    ButtonModule,
    MultiSelectModule,
    TagModule,
    DropdownModule
  ]
})
export class PrimeNgModule { } 