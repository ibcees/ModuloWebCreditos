import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AcreditadosComponent } from './acreditados.component';

describe('AcreditadosComponent', () => {
  let component: AcreditadosComponent;
  let fixture: ComponentFixture<AcreditadosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AcreditadosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AcreditadosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
