import {Component, Input} from '@angular/core';
import './fab.component.scss';
import {FloatingActionButton} from "ng2-floating-action-menu";
import {TranslateService} from "@ngx-translate/core";
@Component({
  selector: 'app-fab',
  templateUrl: './fab.component.html'
})
export class FabComponent {

    title = 'app';
    config: any;
    @Input() buttons: Array<FloatingActionButton> = [];

    placements = [
        {
            value: 'br',
            key: 'bottom right'
        },
        {
            value: 'bl',
            key: 'bottom left'
        },
        {
            value: 'tr',
            key: 'top right'
        },
        {
            value: 'tl',
            key: 'top left'
        },
    ];

    effects = [
        {
            value: 'mfb-zoomin',
            key: 'Zoom In'
        },
        {
            value: 'mfb-slidein',
            key: 'Slide In + Fade'
        },
        {
            value: 'mfb-fountain',
            key: 'Fountain'
        },
        {
            value: 'mfb-slidein-spring',
            key: 'Slide In (Spring)'
        }
    ];

    toggles = [
        'click',
        'hover'
    ];



    constructor(private translate: TranslateService) {
        this.config = {
            placement: 'br',
            effect: 'mfb-zoomin',
            label: this.translate.instant('nav.home'),
            iconClass: 'glyphicon glyphicon-plus',
            activeIconClass: 'glyphicon glyphicon-remove',
            toggle: 'hover',
            buttons: this.buttons
        };
    }
}
