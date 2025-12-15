import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailsDemandeComponent } from './details-demande.component';

describe('DetailsDemandeComponent', () => {
  let component: DetailsDemandeComponent;
  let fixture: ComponentFixture<DetailsDemandeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetailsDemandeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetailsDemandeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
