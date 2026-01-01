import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CortinasList } from './cortinas-list';

describe('CortinasList', () => {
  let component: CortinasList;
  let fixture: ComponentFixture<CortinasList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CortinasList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CortinasList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
