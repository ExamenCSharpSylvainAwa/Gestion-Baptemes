import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BaptemeDetailComponent } from './bapteme-detail.component';

describe('BaptemeDetailComponent', () => {
  let component: BaptemeDetailComponent;
  let fixture: ComponentFixture<BaptemeDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BaptemeDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BaptemeDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
