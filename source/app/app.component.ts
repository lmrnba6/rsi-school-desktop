import { Component } from '@angular/core';


// tslint:disable-next-line:no-implicit-dependencies
import { User } from './model/user';
import { Settings } from './model/settings';
import '../assets/sass/style.scss';
import {TranslateService} from "@ngx-translate/core";
import {NavigationCancel, NavigationEnd, NavigationError, NavigationStart, Router, RouterEvent} from "@angular/router";

@Component({
    selector: 'app',
    templateUrl: 'app.component.html',
})
export class AppComponent {
    public useres: User[];

    loading = true;

    // Shows and hides the loading spinner during RouterEvent changes
    navigationInterceptor(event: RouterEvent): void {
        if (event instanceof NavigationStart) {
            this.loading = true
        }
        if (event instanceof NavigationEnd) {
            this.loading = false
        }

        // Set loading state to false in both of the below events to hide the spinner in case a request fails
        if (event instanceof NavigationCancel) {
            this.loading = false
        }
        if (event instanceof NavigationError) {
            this.loading = false
        }
    }

    constructor(translate: TranslateService, router: Router) {
        localStorage.clear();
        router.events.subscribe((event: RouterEvent) => {
            this.navigationInterceptor(event)
        });

        translate.setDefaultLang('en');
        translate.use('fr');

        Settings.initialize();
    }
	


    // public onMenu(user: User) {
    //     const menu = this.initMenu(user);
    //     // Since Electron v2.0 popup must have option parameter.
    //     // See https://github.com/electron/electron/issues/12915
    //     // {} compiles correct, but tslint throws error
    //     menu.popup({});
    // }
    //
    // private initMenu(user: User): Menu {
    //     const template: MenuItemConstructorOptions[] = [
    //         {
    //             label: `Delete ${user.name}`,
    //             click: () => console.log(user),
    //         },
    //     ];
    //
    //     return remote.Menu.buildFromTemplate(template);
    // }
}
