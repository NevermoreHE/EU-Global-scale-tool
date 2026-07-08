import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { WelcomePageComponent } from './components/welcome-page/welcome-page.component';
import { ScenariosManagementComponent } from './components/scenarios-management/scenarios-management.component';
import { ScenarioComponent } from './components/scenarios-management/scenario/scenario.component';
import { ComparisonComponent } from './components/scenarios-management/scenario/comparison/comparison.component';

const routes: Routes = [
  {path: '', component: WelcomePageComponent},
  {path: 'scenarios', component: ScenariosManagementComponent},
  {path: 'scenarios/:id', component: ScenarioComponent},
  {path: 'scenarios/:id/:idCompare', component: ComparisonComponent },

];

@NgModule({
  imports: [RouterModule.forRoot(routes, {useHash:true})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
