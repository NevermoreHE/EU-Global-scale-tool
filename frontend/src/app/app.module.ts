import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { WelcomePageComponent } from './components/welcome-page/welcome-page.component';
import { ScenariosManagementComponent } from './components/scenarios-management/scenarios-management.component';
import { NewScenarioModalComponent } from './components/scenarios-management/new-scenario-modal/new-scenario-modal.component';
import { en_US, NZ_I18N } from 'ng-zorro-antd/i18n';
import { registerLocaleData } from '@angular/common';
import en from '@angular/common/locales/en';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { HTTP_INTERCEPTORS, HttpClientModule, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { ChatComponent } from './components/scenarios-management/chat/chat.component';
import { TokenInterceptorService } from './interceptors/token-interceptor.service';
import { ScenarioComponent } from './components/scenarios-management/scenario/scenario.component';
import { PoliciesParametrizationComponent } from './components/scenarios-management/scenario/policies-parametrization/policies-parametrization.component';
import { ResultsComponent } from './components/scenarios-management/scenario/results/results.component';
import { NzSliderModule } from 'ng-zorro-antd/slider';
import { NzSwitchModule } from 'ng-zorro-antd/switch';
import { NzRadioModule } from 'ng-zorro-antd/radio';
import { NzAlertModule } from 'ng-zorro-antd/alert'
import { PlotlyModule } from 'angular-plotly.js';
import { NzProgressModule } from 'ng-zorro-antd/progress';
import * as Plotly from 'plotly.js-dist-min';
import { AlertComponent } from './components/alert/alert.component';
import { ComparisonComponent } from './components/scenarios-management/scenario/comparison/comparison.component';
import { GuideModalComponent } from './components/welcome-page/guide-modal/guide-modal.component';
import { PdfViewerModule } from 'ng2-pdf-viewer';

PlotlyModule.plotlyjs = Plotly;

registerLocaleData(en);

@NgModule({
  declarations: [
    AppComponent,
    WelcomePageComponent,
    ScenariosManagementComponent,
    NewScenarioModalComponent,
    ChatComponent,
    ScenarioComponent,
    PoliciesParametrizationComponent,
    ResultsComponent,
    AlertComponent,
    ComparisonComponent,
    GuideModalComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    NzDividerModule,
    NzTableModule,
    NzButtonModule,
    NzModalModule,
    NzInputModule,
    NzSelectModule,
    NzSpinModule,
    NzIconModule,
    NzToolTipModule,
    NzSliderModule,
    NzSwitchModule,
    NzRadioModule,
    PlotlyModule,
    NzAlertModule,
    NzProgressModule,
    PdfViewerModule
  ],
  providers: [
    { provide: NZ_I18N, useValue: en_US },
    { provide: HTTP_INTERCEPTORS, useClass: TokenInterceptorService, multi: true },
    provideHttpClient(withInterceptorsFromDi()),
    provideAnimationsAsync(),
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
