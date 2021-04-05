import { CanDeactivate } from '@angular/router';
import {TestComponent} from "../test/test.component";

export class DeactivateGuard implements CanDeactivate<TestComponent> {

    canDeactivate(component: TestComponent): any {
        return component.canDeactivate();
    }
}
