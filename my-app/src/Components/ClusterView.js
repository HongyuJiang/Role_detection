import React from 'react';
import * as d3 from 'd3';
import $ from "jquery";
import PubSub from 'pubsub-js'
import DataProvider from "./DataProvider";
import { reduce } from 'd3';

class ClusterView extends React.Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {

        let that = this

        DataProvider.getUserEmbData().then(response => {

            let data = response.data;

            that.drawEmbGraphs(data)

            DataProvider.getUserRelationData().then(response => {

                let data = response.data
                that.relationsData = data
            })
        })

    }

    queryPersonalData(user){

        $.post('http://localhost:4001/getRecordsByUser/', user)
               .done(function( data ) {
                
                PubSub.publish('send-data', JSON.parse(data));

                if(this.detailData == undefined){
                   
                    if(DataProvider.person_seqs_dict[user] != undefined){

                        let seq = DataProvider.person_seqs_dict[user]
                        DataProvider.detailData = seq
                        PubSub.publish('details-data', seq);
                    }
                     
                }
                else{

                    PubSub.publish('details-data', this.detailData);
                }
                
        });
    }

    drawUsers(svg, persons){

        //persons = persons.splice(0,20)
        let that = this
        let personDict = {}
        let connections = []

        persons.forEach(person => {

            personDict[person] = 1
        })

        persons.forEach(person => {

            if(this.relationsData[person] != undefined){

                let receivers = this.relationsData[person]

                for (let recer in receivers){
                    if (personDict[recer] != undefined)
                        connections.push({
                            'source': person, 
                            'target': recer, 
                            'weight':receivers[recer]})
                }
            }

        })

        d3.select('#userContainer').remove()
        let userContainer = svg.append('g').attr('id', 'userContainer')
        let person_num = persons.length
        let R = window.innerHeight / 4
        let arcR = R * 0.9
        var pi = Math.PI;
        let startAngle = 10 * (pi/180);
        let endAngle = 170 * (pi/180);
        
        userContainer.attr('transform', d => 'translate(' + (R * 0.7) + ',' + R + ')')

        let angleScale = d3.scaleLinear().domain([0, person_num]).range([startAngle, endAngle])

        userContainer.selectAll('.userName')
        .data(persons)
        .enter()
        .append('text')
        .attr('class', 'userName')
        .attr('x', (d,i) => arcR * Math.sin(angleScale(i)) + 10)
        .attr('y', (d,i) => arcR * Math.cos(angleScale(i)) + 5)
        .text( d => '#' + d.slice(7, 11) )
        .attr('font-size', 12)
        .attr('class', 'userName')
        .on('click', (event, d) => {

            d3.selectAll('.userName').attr('fill', q => {
                if (q == d) return 'red'
                else return 'grey'
            })

            that.queryPersonalData(d)
        })
        .on("mouseover", function (d) {
            d3.select(this).style("cursor", "grab");
        })

        userContainer.selectAll('.userDot')
        .data(persons)
        .enter()
        .append('circle')
        .attr('class', 'userDot')
        .attr('id', d => {
            return 'dot' + d
        })
        .attr('r', 3)
        .attr('cx', (d,i) => arcR * Math.sin(angleScale(i)))
        .attr('cy', (d,i) => arcR * Math.cos(angleScale(i)))
        .attr('stroke', 'steelblue')
        .attr('stroke-width', '2')
        .attr('fill', 'white')

        connections.forEach(link => {

            let sourceNode = userContainer.select('#dot' + link.source)
            let targetNode = userContainer.select('#dot' + link.target)

            let sourceLoc = {'x': sourceNode.attr('cx'), 'y': sourceNode.attr('cy')}
            let targetLoc = {'x': targetNode.attr('cx'), 'y': targetNode.attr('cy')}

            if(targetLoc.y - sourceLoc.y < 0){

                let line = userContainer.append('path')
                .attr('d', d => {

                    var dx = (targetLoc.x - sourceLoc.x),
                    dy = (targetLoc.y - sourceLoc.y),
                    dr = Math.sqrt(dx * dx + dy * dy) * 0.8;
                    return "M" + sourceLoc.x + "," + sourceLoc.y + "A" 
                    + dr + "," + dr + " 0 0,1 " + targetLoc.x + "," + targetLoc.y;
            
                })
                .attr('stroke', '#000000f5')
                .attr('stroke-width', '3')
                .attr('stroke-dasharray', '2 2 2 2')
                .attr('fill', 'none')
            }
            
        })
        
        userContainer.append('circle')
        .attr('r', 30)
        .attr('id', 'center')
        .attr('cx', R * 0.3)
        .attr('cy', 0)
        .attr('fill', 'black')
        .attr('opacity', 0.5)
        .on('click', d => {

            d3.selectAll('.userDot').transition()
            .attr('cx', 0).attr('cy', 0).attr('opacity', 0)

            d3.selectAll('.userName').transition()
            .attr('x', 0).attr('y', 0).attr('opacity', 0)

            d3.select('#center').transition()
            .attr('r', R).attr('opacity', 0)
            .on("end", q => {

                d3.select('#userContainer').remove()

                d3.selectAll('.point').transition()
                .attr('opacity', 0.5).attr('fill', 'black')
            });
            
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

    drawEmbGraphs(data) {

        let height = window.innerHeight / 2

        let width = height
        let that = this

        let zoom_lambda = width / 200

        d3.select('#clusterContainer').selectAll('*').remove()

        let canvas = d3.select('#clusterContainer').append('svg')
            .attr('width', width + 50)
            .attr('height', height + 50)

        const svg = canvas.append('g')
            .attr('transform', 'translate(0,50)')

        let selecting = false
        let selected_persons = {}

        let dotContainer =  svg.append('g')

        this.drawBackGround(dotContainer, width, height)
        
        dotContainer.selectAll('points')
            .data(data)
            .enter()
            .append('circle')
            .attr('class', 'point')
            .attr('person', d => d.person)
            .attr('r', 1)
            .attr('fill', 'black')
            .attr('selected', '0')
            .attr('opacity', '0.5')
            .attr('cx', d => d.x * zoom_lambda + width / 2)
            .attr('cy', d => d.y * zoom_lambda + height / 2)

        dotContainer.on("mouseover", function (d) {
                d3.select(this).style("cursor", "crosshair");
            })
            .on('mousedown', function (d) {

                var coords = d3.pointer(d, this);
                dotContainer.append('circle')
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
                    dotContainer.select('#pointer')
                        .attr('cx', coords[0])
                        .attr('cy', coords[1])

                    let x = coords[0]
                    let y = coords[1]

                    d3.selectAll('.point')
                        .style('fill', d => {

                            let cx = d.x * zoom_lambda + width / 2
                            let cy = d.y * zoom_lambda + height / 2
                            let dis = (x - cx) * (x - cx) + (y - cy) * (y - cy)

                            if (d.selected == '2') return 'red'
                        
                            if (dis <= 25) {
                                selected_persons[d.person] = 1
                                d.selected = 2
                                return 'red'
                            }

                            return 'black'
                        })
                }

            })
            
            .on('mouseup', function (d) {

                d3.selectAll('.point')
                .attr('fill', 'none')
                .attr('opacity', '0')

                let persons = []
                for (let user in selected_persons)
                    persons.push(user)

                that.drawUsers(svg, persons)
                selected_persons = {}
            
                dotContainer.select('#pointer').remove()

                selecting = false;

                d3.selectAll('.point').attr('selected', d =>{
                    d.selected = 0
                })

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