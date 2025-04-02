import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SensorboxStatusComponent } from './sensorbox-status.component';

describe('SensorboxStatusComponent', () => {
  let component: SensorboxStatusComponent;
  let fixture: ComponentFixture<SensorboxStatusComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SensorboxStatusComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SensorboxStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
