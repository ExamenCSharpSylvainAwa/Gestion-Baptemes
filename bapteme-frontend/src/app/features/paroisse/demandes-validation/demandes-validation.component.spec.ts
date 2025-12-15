import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DemandesValidationComponent } from './demandes-validation.component';

describe('DemandesValidationComponent', () => {
  let component: DemandesValidationComponent;
  let fixture: ComponentFixture<DemandesValidationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DemandesValidationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DemandesValidationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
