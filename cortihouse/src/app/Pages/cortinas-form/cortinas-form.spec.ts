import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CortinasForm } from './cortinas-form';

describe('CortinasForm', () => {
  let component: CortinasForm;
  let fixture: ComponentFixture<CortinasForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CortinasForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CortinasForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
