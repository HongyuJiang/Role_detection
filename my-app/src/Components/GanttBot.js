import React from 'react';
import * as d3 from 'd3';
import $ from "jquery";
import PubSub from 'pubsub-js'
import DataProvider from "./DataProvider";

class GanttBot extends React.Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {

        let that = this

        this.token = PubSub.subscribe('details-data', (eventName, data)=>{

            that.drawGantt(data)

        })
        
    }

    drawGantt(records){

        let time_min = new Date()

        let time_max = new Date('2010-10-1 12:00:00')

        let eventList = []

        records.forEach(d => {

            const tParser = d3.timeParse("%d/%m/%Y %H:%M:%S")

            //console.log(d.time)

            d.date = tParser(d.time)

            if(d.date > time_max) time_max = d.date
            if(d.date < time_min) time_min = d.date
        })

        for(let i=1;i<records.length;i+=1){

            let event = {}
            event['start'] = records[i-1].date
            event['end'] = records[i].date
            event['cell'] = records[i-1].cell

            eventList.push(event)
        }

        let width = window.innerWidth

        let height = 200

        d3.select('#ganttContainer').selectAll('*').remove()

        let canvas = d3.select('#ganttContainer').append('svg')
        .attr('width', width)
        .attr('height', height)

        let clusters = DataProvider.clusters;

        let cluster_IDs = Array.from(new Array(clusters.length + 1).keys()).slice(1)

        let clusterAssigner = {}

        for(let no = 0; no < clusters.length; no++){

            clusters[no].forEach(node => {

                clusterAssigner[node] = no
            })
        }

        let xScale = d3.scaleTime().domain([time_min, time_max]).range([50, width - 50])

        let yScale = d3.scaleLinear().domain([0, d3.max(cluster_IDs)]).range([20, height - 20])

        var clusterColors = d3.scaleOrdinal().domain(cluster_IDs)
        .range(d3.schemeSet2);

        canvas.append('g').selectAll('.cell_node')
        .data(records)
        .enter()
        .append('circle')
        .attr('cx', d => (xScale(d.date)))
        .attr('cy', d => {

            if(clusterAssigner[d.cell] != undefined)
                return yScale(clusterAssigner[d.cell])
    
        })
        .attr('r', 3)
        .attr('fill', d => clusterColors(clusterAssigner[d.cell]))

        console.log(eventList)

        canvas.append('g').selectAll('.event_line')
        .data(eventList)
        .enter()
        .append('line')
        .attr('x1', d => xScale(d.start))
        .attr('x2', d => xScale(d.end))
        .attr('y1', d => yScale(clusterAssigner[d.cell]))
        .attr('y2', d => yScale(clusterAssigner[d.cell]))
        .attr('stroke', 'black')
        .attr('stroke-width', '2')
  
    }

    render() {
        return (
            <div id='ganttContainer' style={{background:'rgba(255,255,255,1)', left:'0', bottom:'0', position:'absolute', height:'200px', zIndex:'999', width:'100%'}}>
                
            </div>
        )
    }
}

export default GanttBot;