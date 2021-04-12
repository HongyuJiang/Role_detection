import React from 'react';
import * as d3 from 'd3';
import { tip as d3tip } from "d3-v6-tip";
import PubSub from 'pubsub-js'
import DataProvider from "./DataProvider";
import "../d3-tip.min.css"

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

        const MyTip = d3tip().attr('class', 'd3-tip').html((EVENT,d) => {
            return '基站:' + DataProvider.cell_info[d.cell].name + '<br>' + '时间: ' + d.time
        });

        records.forEach(d => {
            d.date = tParser(d.time)
        })

        records.forEach(d => {

            if(d.date > time_max) time_max = d.date
            if(d.date < time_min) time_min = d.date
        })

        records = records.sort((a,b) => {
            return a.date - b.date
        })

        for(let i = 1; i < records.length; i += 1){

            let event = {}
            event['start'] = records[i-1].date
            event['end'] = records[i].date
            event['scell'] = records[i-1].cell
            event['ecell'] = records[i].cell

            eventList.push(event)
        }

        let width = window.innerWidth

        let height = 220

        d3.select('#ganttContainer').selectAll('svg').remove()

        let canvas = d3.select('#ganttContainer').append('svg')
        .attr('width', width)
        .attr('height', height)
        .append('g')
        .attr('transform','translate(0, 20)')

        canvas.call(MyTip)

        let clusters = DataProvider.clusters;

        let clusterAssigner = {}

        for(let no = 0; no < clusters.length; no++){

            clusters[no].forEach(node => {
                clusterAssigner[node] = no
            })
        }

        let existedCluster = {}

        for (let cluster in clusterAssigner){
            existedCluster[clusterAssigner[cluster]] = 1
        }

        let xScale = d3.scaleTime().domain([time_min, time_max]).range([50, width - 50])

        let yScale = d3.scaleLinear().domain([0, Object.keys(existedCluster).length]).range([10, height - 10])

        let timeList = []

        let delta_time = time_min.getTime()
        let time_max_unix = time_max.getTime()

        while(delta_time < time_max_unix){

            let bt = new Date(delta_time)
            delta_time += 86400000
            let et = new Date(delta_time)

            timeList.push({'bt': bt, 'et': et})
        }

        let histData = d3.bin()
            .value(d => d.date)
            .thresholds(20)
        (records)

        let lscale = d3.scaleLinear().domain([0, d3.max(histData, d => d.length)]).range([0, height / 2])

        //console.log(histData)

        let area = d3.area()
            .curve(d3.curveBasis)
            .x(d => xScale((d.x1 + d.x0) / 2))
            .y0(height - 20)
            .y1(d => height - 20 - lscale(d.length))

        canvas.append('g').append("path")
            .datum(histData)
            .attr("d", area)
            .attr('fill', 'black')
            .attr('opacity', 0.1)

        canvas.append('g').selectAll('.day_rect')
        .data(timeList)
        .enter()
        .append('rect')
        .attr('width', d => xScale(d.et) - xScale(d.bt))
        .attr('stroke', 'white')
        .attr('stroke-width', 2)
        .attr('height', height - 20)
        .attr('fill', 'black')
        .attr('x', d => xScale(d.bt))
        .attr('y', 0)
        .attr('opacity', 0.1)

        let weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

        canvas.append('g').selectAll('.day_name')
        .data(timeList)
        .enter()
        .append('text')
        .attr('fill', 'black')
        .attr('x', d => xScale(d.bt) + 15)
        .attr('y', 190)
        .attr('opacity', 1)
        .attr('font-size', 12)
        .attr('opacity', '0.7')
        .text(d => weekdays[d.bt.getDay()])

        canvas.append('g').selectAll('.event_line')
        .data(eventList.filter(d => clusterAssigner[d.scell] != undefined 
            && clusterAssigner[d.ecell] != undefined))
        .enter()
        .append('line')
        .attr('x1', d => xScale(d.start))
        .attr('x2', d => xScale(d.end))
        .attr('y1', d => {
            return yScale(clusterAssigner[d.scell])
        })
        .attr('y2', d => yScale(clusterAssigner[d.ecell]))
        .attr('stroke', 'grey')
        .attr('stroke-dasharray', d => {
            if (d.scell != d.ecell) return '2 2 2 2'
            else return 'none'
        })
        .attr('stroke-opacity', '0.5')
        .attr('stroke-width', '2')

        let color_assigner = DataProvider.color_assigner

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
        .attr('stroke', d => color_assigner(clusterAssigner[d.cell]))
        .attr('fill', 'none')
        .attr('stroke-width', 1.5)
        .on('mouseover', (e, d) => {

            const element = d3.select(this)

            MyTip.show(e, d, element.node())
        })
        .on('mouseout', MyTip.hide)
  
    }

    render() {
        return (
            <div id='ganttContainer' style={{background:'rgba(255,255,255,1)', left:'0', bottom:'30px', position:'absolute', height:'250px', zIndex:'999', width:'100%'}}>
                <div style={{ float:'right', marginRight:'20px', width:'200px', height:'30px', background:'grey', fontSize:24, color:'white', borderRadius:'5px'}} > Individual Gantt </div>
            </div>
        )
    }
}

export default GanttBot;