import { NgModule } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule} from '@angular/material/list';
import { MatDividerModule} from '@angular/material/divider';
import { MatMenuModule} from '@angular/material/menu';
import { MatIconModule} from '@angular/material/icon';
import { MatCardModule} from '@angular/material/card';
import { MatGridListModule} from '@angular/material/grid-list';
import { MatDatepickerModule} from '@angular/material/datepicker';
import { MatNativeDateModule} from '@angular/material/core';
import { MatInputModule} from '@angular/material/input';
import { MatSidenavModule} from '@angular/material/sidenav';
import { MatSliderModule} from '@angular/material/slider';
import { MatFormFieldModule} from '@angular/material/form-field';
import { MatButtonToggleModule} from '@angular/material/button-toggle';
import { MatTabsModule} from '@angular/material/tabs';
import { MatTableModule} from '@angular/material/table';
import { MatPaginatorModule} from '@angular/material/paginator';
import { MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import { MatSortModule} from '@angular/material/sort';
import { MatRadioModule} from '@angular/material/radio';
import { MatExpansionModule} from '@angular/material/expansion';
import { MatCheckboxModule} from '@angular/material/checkbox';
import { MatProgressBarModule} from '@angular/material/progress-bar';
import { MatBadgeModule} from '@angular/material/badge';
import { MatAutocompleteModule} from '@angular/material/autocomplete';
import { MatSlideToggleModule} from '@angular/material/slide-toggle';
import { MatRippleModule} from '@angular/material/core';
import { MatIconRegistry} from '@angular/material/icon';


@NgModule({ exports: [
        MatButtonModule,
        MatToolbarModule,
        MatListModule,
        MatDividerModule,
        MatMenuModule,
        MatIconModule,
        MatCardModule,
        MatGridListModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatInputModule,
        MatSidenavModule,
        MatAutocompleteModule,
        MatSliderModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonToggleModule,
        MatTabsModule,
        MatTableModule,
        MatPaginatorModule,
        MatProgressSpinnerModule,
        MatSortModule,
        MatRadioModule,
        MatExpansionModule,
        MatCheckboxModule,
        MatProgressBarModule,
        MatBadgeModule,
        MatSlideToggleModule,
        MatRippleModule
    ], imports: [], providers: [provideHttpClient(withInterceptorsFromDi())] })
export class MaterialModule {
  // adding svg files as mat-icon (usage: <mat-icon svgIcon="iconName"></mat-icon>)
  constructor(iconRegistry: MatIconRegistry, sanitizer: DomSanitizer) {
    if (iconRegistry) {
      iconRegistry.addSvgIcon(
        'facebook',
        sanitizer.bypassSecurityTrustResourceUrl('assets/icons/social/facebook.svg'));
      iconRegistry.addSvgIcon(
        'facebook-white',
        sanitizer.bypassSecurityTrustResourceUrl('assets/icons/social/facebook-white.svg'));
      // LinkedIn icon
      iconRegistry.addSvgIcon(
        'linkedin',
        sanitizer.bypassSecurityTrustResourceUrl('assets/icons/social/linkedin.svg'));
      iconRegistry.addSvgIcon(
        'linkedin-white',
        sanitizer.bypassSecurityTrustResourceUrl('assets/icons/social/linkedin-white.svg'));
      // Website icon
      iconRegistry.addSvgIcon(
        'leonding',
        sanitizer.bypassSecurityTrustResourceUrl('assets/icons/htl/logo.svg'));
      iconRegistry.addSvgIcon(
        'leonding-white',
        sanitizer.bypassSecurityTrustResourceUrl('assets/icons/htl/logo-white.svg'));
      // Youtube icon
      iconRegistry.addSvgIcon(
        'youtube',
        sanitizer.bypassSecurityTrustResourceUrl('assets/icons/social/youtube.svg'));
      iconRegistry.addSvgIcon(
        'youtube-white',
        sanitizer.bypassSecurityTrustResourceUrl('assets/icons/social/youtube-white.svg'));
    }
  }
}
