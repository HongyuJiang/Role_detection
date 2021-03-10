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

        const tParser = d3.timeParse("%d/%m/%Y %H:%M:%S")

        records.forEach(d => {
            d.date = tParser(d.time)
        })

        let begin_date = tParser('1/3/2015 00:00:00')
        let end_date = tParser('14/3/2015 00:00:00')

        records = records.filter(d => {
            if(d.date > begin_date && d.date < end_date)
            return 1
        })

        records.forEach(d => {

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

        let existedCluster = {}

        records.forEach(d => {

            if(clusterAssigner[d.cell] != undefined)
                existedCluster[clusterAssigner[d.cell]] = 1
        })

        let clusterNum = Object.keys(existedCluster).length

        let xScale = d3.scaleTime().domain([time_min, time_max]).range([50, width - 50])

        let yScale = d3.scaleLinear().domain([0, clusterNum]).range([20, height - 20])

        var clusterColors = d3.scaleOrdinal().domain(cluster_IDs)
        .range(d3.schemeSet2);

        let timeList = []

        let delta_time = time_min.getTime()
        let time_max_unix = time_max.getTime()

        while(delta_time < time_max_unix){

            let bt = new Date(delta_time)
            delta_time += 86400000
            let et = new Date(delta_time)

            timeList.push({'bt': bt, 'et': et})
        }

        canvas.append('g').selectAll('.day_rect')
        .data(timeList)
        .enter()
        .append('rect')
        .attr('width', d => xScale(d.et) - xScale(d.bt))
        .attr('stroke', 'white')
        .attr('stroke-width', 2)
        .attr('height', 200)
        .attr('fill', 'black')
        .attr('x', d => xScale(d.bt))
        .attr('y', 0)
        .attr('opacity', 0.1)

        let weekdays = ['Mon', 'Tue', 'Web', 'Thu', 'Fri', 'Sat', 'Sun']

        canvas.append('g').selectAll('.day_name')
        .data(timeList)
        .enter()
        .append('text')
        .attr('fill', 'black')
        .attr('x', d => xScale(d.bt) + 35)
        .attr('y', 180)
        .attr('opacity', 1)
        .attr('font-size', 16)
        .text(d => weekdays[d.bt.getDay()])

        canvas.append('g').selectAll('.event_line')
        .data(eventList)
        .enter()
        .append('line')
        .attr('x1', d => xScale(d.start))
        .attr('x2', d => xScale(d.end))
        .attr('y1', d => yScale(clusterAssigner[d.cell]))
        .attr('y2', d => yScale(clusterAssigner[d.cell]))
        .attr('stroke', 'black')
        .attr('stroke-opacity', '0.3')
        .attr('stroke-width', '1')

        canvas.append('g').selectAll('.cell_node')
        .data(records.filter(d => clusterAssigner[d.cell] != undefined))
        .enter()
        .append('circle')
        .attr('cx', d => (xScale(d.date)))
        .attr('cy', d => {

            if(clusterAssigner[d.cell] != undefined)
                return yScale(clusterAssigner[d.cell])
    
        })
        .attr('r', 3)
        .attr('stroke', d => clusterColors(clusterAssigner[d.cell]))
        .attr('fill', 'none')
  
    }

    render() {
        return (
            <div id='ganttContainer' style={{background:'rgba(255,255,255,1)', left:'0', bottom:'0', position:'absolute', height:'200px', zIndex:'999', width:'100%'}}>
                
            </div>
        )
    }
}

export default GanttBot;