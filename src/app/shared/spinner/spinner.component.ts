import { Component } from '@angular/core';
import { SharedModule } from '../shared.module';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true, 
  selector: 'app-spinner',
  imports: [SharedModule,MatProgressBarModule],
  templateUrl: './spinner.component.html',
  styleUrls: ['./spinner.component.css']
})
export class SpinnerComponent {

}
