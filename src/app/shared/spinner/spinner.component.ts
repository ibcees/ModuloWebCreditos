import { Component } from '@angular/core';
import { SharedModule } from '../shared.module';
import {MatProgressBarModule} from '@angular/material/progress-bar';

@Component({
  selector: 'app-spinner',
  imports: [SharedModule,MatProgressBarModule],
  templateUrl: './spinner.component.html',
  styleUrl: './spinner.component.css'
})
export class SpinnerComponent {

}
