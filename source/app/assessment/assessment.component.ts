import {Component, OnInit} from '@angular/core';
import './assessment.component.scss';

@Component({
    selector: 'app-assessment',
    templateUrl: './assessment.component.html'
})
export class AssessmentComponent implements OnInit {

    public assessmentImage = `${this.getPath()}dist/assets/images/assessmentImage.png`;
    public examImage = `${this.getPath()}dist/assets/images/examImage.png`;

    getPath() {
        const l = window.location.href.split('/');
        const c = l.length - l.indexOf('index.html');
        return '../'.repeat(c);
    }

    ngOnInit() {
    }

    fixImage(event: any) {
        if (event.target.src.includes('dist')) {
            return event.target.src = event.target.src.replace('/dist', '');
        }
    }


}
