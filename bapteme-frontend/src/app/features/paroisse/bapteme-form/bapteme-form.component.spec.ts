import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BaptemeFormComponent } from './bapteme-form.component';

describe('BaptemeFormComponent', () => {
  let component: BaptemeFormComponent;
  let fixture: ComponentFixture<BaptemeFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BaptemeFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BaptemeFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
