import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Sting } from './sting';

describe('Sting', () => {
  let component: Sting;
  let fixture: ComponentFixture<Sting>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [Sting]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Sting);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
