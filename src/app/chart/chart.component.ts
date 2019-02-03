import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import './chart.component.scss';

@Component({
    selector: 'app-chart',
    templateUrl: './chart.component.html'
})
export class ChartComponent  implements  OnInit{



    @Output() public clicked: EventEmitter<any> = new EventEmitter();
    @Output() public hovered: EventEmitter<any> = new EventEmitter();
    @Input() public title: string;
    @Input() public chartLabels: string[] = [];
    @Input() public chartData: number[] = [];
    @Input() public chartType: string = 'line';
    public barData = [];

    ngOnInit() {
        this.barData = []
    }

    /*line, bar, radar, pie, polarArea, doughnut*/
    public chartOptions: any = {
        scales: {
            yAxes: [{
                ticks: {
                    beginAtZero: true
                }
            }]
        }
    }

    public chartColors = [
        {backgroundColor: [
            "#e84351",
            "#4BC0C0",
            "#FFCE56",
            "#E7E9ED",
            "#36A2EB",
            "#4F6384",
            "#c4732a",
            "#009e54",
            "#875ded",
            "#76eb7d",
                "#FF6384",
                "#FFEBCD",
                "#0000FF",
                "#8A2BE2",
                "#A52A2A",
                "#DEB887",
                "#5F9EA0",
                "#7FFF00",
                "#D2691E",
                "#FF7F50",
                "#6495ED",
                "#FFF8DC",
                "#DC143C",
                "#00FFFF",
                "#00008B",
                "#008B8B",
                "#B8860B",
                "#A9A9A9",
                "#006400",
                "#BDB76B",
                "#8B008B",
                "#556B2F",
                "#FF8C00",
                "#9932CC",
                "#8B0000",
                "#E9967A",
                "#8FBC8F",
                "#483D8B",
                "#2F4F4F",
                "#00CED1",
                "#9400D3",
                "#FF1493",
                "#00BFFF",
                "#696969",
                "#1E90FF",
                "#B22222",
                "#FFFAF0",
                "#228B22",
                "#FF00FF",
                "#DCDCDC",
                "#FFD700",
                "#DAA520",
                "#808080",
                "#008000",
                "#ADFF2F",
                "#F0FFF0",
                "#FF69B4",
                "#CD5C5C",
                "#4B0082",
                "#FFFFF0",
                "#F0E68C",
                "#FFF0F5",
                "#7CFC00",
                "#FFFACD",
                "#ADD8E6",
                "#F08080",
                "#E0FFFF",
                "#FAFAD2",
                "#90EE90",
                "#D3D3D3",
                "#FFB6C1",
            ]}
    ]

    // events on slice click
    public chartClicked(e: any): void {
        this.clicked.emit(e);
    }

    // event on pie chart slice hover
    public chartHovered(e: any): void {
        this.hovered.emit(e)
    }

}
