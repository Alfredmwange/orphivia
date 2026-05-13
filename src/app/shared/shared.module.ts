import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { ButtonComponent } from './components/button/button.component';
import { SliderComponent } from './components/slider/slider.component';
import { DropdownComponent } from './components/dropdown/dropdown.component';
import { CardComponent } from './components/card/card.component';
import { LoaderComponent } from './components/loader/loader.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ButtonComponent,
    SliderComponent,
    DropdownComponent,
    CardComponent,
    LoaderComponent
  ],
  exports: [
    CommonModule,
    FormsModule,
    ButtonComponent,
    SliderComponent,
    DropdownComponent,
    CardComponent,
    LoaderComponent
  ]
})
export class SharedModule {}
