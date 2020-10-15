import React from 'react';
import axios from 'axios';
import Chart from 'chart.js';
import * as d3 from 'd3';

export default class MyChart extends React.Component {
    dataSource = {
        datasets: [
            {
                data: [],
                backgroundColor: []
            }
        ],
        labels: []
    };

    componentDidMount() {
        axios.get('http://localhost:3000/budget')
        .then(res => {
            for(var i=0; i<res.data.myBudget.length; i++){
                this.dataSource.datasets[0].data[i] = res.data.myBudget[i].budget;
                this.dataSource.datasets[0].backgroundColor[i] = res.data.myBudget[i].backgroundColor;
                this.dataSource.labels[i] = res.data.myBudget[i].title;
            }

            const ctx = document.getElementById("myChart");
            new Chart(ctx, {
                type: "pie",
                data: this.dataSource
            });

        });

        
        //d3 code:


        var svg = d3.select(".myDoughnutChart")
            .append("svg")
            .append("g")

        svg.append("g")
            .attr("width",100)
            .attr("height",100)
            .attr("viewBox", "0 0 1000 1000")
        svg.append("g")
            .attr("class", "slices");
        svg.append("g")
            .attr("class", "labels");
        svg.append("g")
            .attr("class", "lines");

        var width = 960,
            height = 450,
            margin = 40,
            radius = Math.min(width, height) / 2 - margin;

        var pie = d3.layout.pie()
            .sort(null)
            .value(function(d) {
                return d.value;
            });

        var arc = d3.svg.arc()
            .outerRadius(radius * 0.6)
            .innerRadius(radius * 0.3);

        var outerArc = d3.svg.arc()
            .innerRadius(radius * 0.7)
            .outerRadius(radius * 0.7);

        svg.attr("transform", "translate(" + width / 2.5 + "," + height / 2.5 + ")");

        var key = function(d){ return d.data.label; };
        var array =[]
        var range = []
        var backgroundColor = []

        d3.json("http://localhost:3000/budget", function(data) {
            console.log(data["myBudget"][0].backgroundColor);

            for(var i = 0; i < data["myBudget"].length; i++){
                array[i] = data["myBudget"][i].title;
                range[i] = data["myBudget"][i].budget;
                backgroundColor[i] = data["myBudget"][i].backgroundColor;
                console.log(array[i]);
            }

            var color = d3.scale.ordinal()
                .domain(array)
                .range(backgroundColor);     

            function randomData (){
                var labels = color.domain();
                return labels.map(function(label){
                    return { label: label, value: Math.random() }
                });
            }

            change(randomData());

            d3.select(".randomize")
                .on("click", function(){
                    change(randomData());
                });


            function change(data) {

                /* ------- PIE SLICES -------*/
                var slice = svg.select(".slices").selectAll("path.slice")
                    .data(pie(data), key);

                slice.enter()
                    .insert("path")
                    .style("fill", function(d) { return color(d.data.label); })
                    .attr("class", "slice");

                slice		
                    .transition().duration(1000)
                    .attrTween("d", function(d) {
                        this._current = this._current || d;
                        var interpolate = d3.interpolate(this._current, d);
                        this._current = interpolate(0);
                        return function(t) {
                            return arc(interpolate(t));
                        };
                    })

                slice.exit()
                    .remove();

                /* ------- TEXT LABELS -------*/

                var text = svg.select(".labels").selectAll("text")
                    .data(pie(data), key);

                text.enter()
                    .append("text")
                    .attr("dy", ".35em")
                    .text(function(d) {
                        return d.data.label;
                    });
                
                function midAngle(d){
                    return d.startAngle + (d.endAngle - d.startAngle)/2;
                }

                text.transition().duration(1000)
                    .attrTween("transform", function(d) {
                        this._current = this._current || d;
                        var interpolate = d3.interpolate(this._current, d);
                        this._current = interpolate(0);
                        return function(t) {
                            var d2 = interpolate(t);
                            var pos = outerArc.centroid(d2);
                            pos[0] = radius * (midAngle(d2) < Math.PI ? 1 : -1);
                            return "translate("+ pos +")";
                        };
                    })
                    .styleTween("text-anchor", function(d){
                        this._current = this._current || d;
                        var interpolate = d3.interpolate(this._current, d);
                        this._current = interpolate(0);
                        return function(t) {
                            var d2 = interpolate(t);
                            return midAngle(d2) < Math.PI ? "start":"end";
                        };
                    });

                text.exit()
                    .remove();

                /* ------- SLICE TO TEXT POLYLINES -------*/

                var polyline = svg.select(".lines").selectAll("polyline")
                    .data(pie(data), key);
                
                polyline.enter()
                    .append("polyline");

                polyline.transition().duration(1000)
                    .attrTween("points", function(d){
                        this._current = this._current || d;
                        var interpolate = d3.interpolate(this._current, d);
                        this._current = interpolate(0);
                        return function(t) {
                            var d2 = interpolate(t);
                            var pos = outerArc.centroid(d2);
                            pos[0] = radius * 0.95 * (midAngle(d2) < Math.PI ? 1 : -1);
                            return [arc.centroid(d2), outerArc.centroid(d2), pos];
                        };			
                    });
                
                polyline.exit()
                    .remove();
            }; 
        });          


    }

    render() {
        return(  
            <div className="chart-container">
              {/* <svg className="myDoughnutChart" width="300" height="150"></svg>
              <canvas id="myChart" width="300" height="100"></canvas> */}
            </div>                   
        );
    }
}
