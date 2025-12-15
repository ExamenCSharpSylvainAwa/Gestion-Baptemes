import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BaptemesListComponent } from './baptemes-list.component';

describe('BaptemesListComponent', () => {
  let component: BaptemesListComponent;
  let fixture: ComponentFixture<BaptemesListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BaptemesListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BaptemesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
