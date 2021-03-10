import React from 'react';
import * as d3 from 'd3';
import $ from "jquery";
import PubSub from 'pubsub-js'
import DataProvider from "./DataProvider";

class ClusterView extends React.Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {

        let that = this

        DataProvider.getUserEmbData().then(response => {

            let data = response.data;

            that.drawGraphs(data)
        })

    }

    drawBackGround(svg, width, height) {

        svg.append('circle')
            .attr('r', width / 2)
            .attr('fill', 'black')
            .attr('opacity', 0.1)
            .attr('cx', width / 2)
            .attr('cy', height / 2)

        svg.append('g')
            .attr('transform', 'translate(' + width / 2 + ',' + (height / 2) + ')')
            .selectAll('axisLine')
            .data([0, 1, 2, 3, 4, 5, 6, 7])
            .enter()
            .append('line')
            .attr('x1', function (d, i) {

                let r = width / 2
                return r * Math.cos(2 * Math.PI / 8 * d)
            })
            .attr('x2', function (d, i) {

                let r = 0
                return r * Math.cos(2 * Math.PI / 8 * d)
            })
            .attr('y1', function (d, i) {

                let r = width / 2
                return r * Math.sin(2 * Math.PI / 8 * d)
            })
            .attr('y2', function (d, i) {

                let r = 0
                return r * Math.sin(2 * Math.PI / 8 * d)
            })
            .attr('stroke', 'white')
            .attr('stroke-width', '1.5')
            .attr('opacity', 0.8)

    }

    drawGraphs(data) {

        let height = window.innerHeight / 2

        let width = height

        let zoom_lambda = width / 200

        d3.select('#clusterContainer').selectAll('*').remove()

        let canvas = d3.select('#clusterContainer').append('svg')
            .attr('width', width + 50)
            .attr('height', height + 50)

        const svg = canvas.append('g')
            .attr('transform', 'translate(0,50)')

        this.drawBackGround(svg, width, height)

        let selecting = false
        let selected_persons = []

        svg.selectAll('points')
            .data(data)
            .enter()
            .append('circle')
            .attr('class', 'point')
            .attr('person', d => d.person)
            .attr('r', 1)
            .attr('fill', 'black')
            .attr('opacity', '0.5')
            .attr('cx', d => d.x * zoom_lambda + width / 2)
            .attr('cy', d => d.y * zoom_lambda + height / 2)

        svg.on("mouseover", function (d) {
            d3.select(this).style("cursor", "crosshair");
        })
            .on('mousedown', function (d) {

                var coords = d3.pointer(d, this);
                svg.append('circle')
                    .attr('id', 'pointer')
                    .attr('r', 5)
                    .attr('fill', 'red')
                    .attr('opacity', 0.5)
                    .attr('cx', coords[0])
                    .attr('cy', coords[1])

                selecting = true
            })
            .on('mousemove', function (d) {

                if (selecting) {

                    var coords = d3.pointer(d, this);

                    svg.select('#pointer')
                        .attr('cx', coords[0])
                        .attr('cy', coords[1])

                    let x = coords[0]
                    let y = coords[1]

                    svg.selectAll('.point')
                        .attr('fill', function (d) {

                            let cx = d.x * zoom_lambda + width / 2
                            let cy = d.y * zoom_lambda + height / 2
                            let dis = (x - cx) * (x - cx) + (y - cy) * (y - cy)

                            if (dis <= 25) {

                                if (d3.select(this).attr('selected') != 1) {
                                    
                                    d3.select(this).attr('selected', 1)
                                    let person = d3.select(this).attr('person')
                                    selected_persons.push(person)//selected_persons中为选中的person
                                    return 'red'
                                }
                                else{
                                    return 'red'
                                }
                      
                            }

                        })
                }

            })

            .on('mouseup', function (d) {

                svg.select('#pointer')
                    .remove()

                selecting = false;

                console.log(selected_persons)

                selected_persons = []

                d3.selectAll('.point').attr('selected', 0 )

            })

    }

    render() {
        return (
            <div id='clusterContainer' style={{
                background: 'none', left: '20px', position: 'absolute', width: '500px', zIndex: '999', height: '500px', top: '20px',
                overflowY: 'auto'
            }}>

            </div>
        )
    }
}

export default ClusterView;