import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
//modulos
import { ReactiveFormsModule } from '@angular/forms';
//angular material
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core'; // o MatMomentDateModule si usas moment.js
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import {MatTableModule} from '@angular/material/table';
import {MatSortModule} from '@angular/material/sort';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatIconModule} from '@angular/material/icon';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatButtonModule} from '@angular/material/button';
import { MatSort } from '@angular/material/sort';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import {MatCardModule} from '@angular/material/card';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {MatGridListModule} from '@angular/material/grid-list';
import {MatMenuModule} from '@angular/material/menu';

//componentes
import { SpinnerComponent } from './spinner/spinner.component';
import{ HttpClientModule } from '@angular/common/http';
import { RoutingModule } from '../app.routes';


@NgModule({
  imports: [
    CommonModule, MatSlideToggleModule,MatTableModule, MatSortModule,MatFormFieldModule,MatInputModule, 
    MatIconModule, MatTooltipModule,MatButtonModule, MatPaginatorModule,MatSortModule, MatCardModule, 
    MatSnackBarModule, MatProgressBarModule,MatGridListModule, ReactiveFormsModule, SpinnerComponent,
    HttpClientModule, MatIconModule, MatMenuModule,MatDatepickerModule,MatNativeDateModule
  ],
  exports:[
    CommonModule, MatSlideToggleModule,MatTableModule, MatSortModule,MatFormFieldModule,MatInputModule, 
    MatIconModule, MatTooltipModule,MatButtonModule,MatPaginatorModule,MatSortModule, MatCardModule,
    MatSnackBarModule,SpinnerComponent, MatProgressBarModule, MatGridListModule, ReactiveFormsModule, 
    HttpClientModule, MatIconModule, MatMenuModule,MatNativeDateModule,MatDatepickerModule
  ]
  
})
export class SharedModule { }
