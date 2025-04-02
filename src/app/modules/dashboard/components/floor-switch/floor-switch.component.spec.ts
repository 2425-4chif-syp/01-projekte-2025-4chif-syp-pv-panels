import { LanguageService } from '../../../../core/services/language.service';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { HistoricalMeasurementService } from 'src/app/core/services/historical-measurements.service';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { FloorSwitchComponent } from './floor-switch.component';

describe('FloorSwitchComponent', () => {
  let component: FloorSwitchComponent;
  let fixture: ComponentFixture<FloorSwitchComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    declarations: [FloorSwitchComponent],
    imports: [],
    providers: [HistoricalMeasurementService, LanguageService, provideHttpClient(withInterceptorsFromDi())]
})
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FloorSwitchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
  });
});
