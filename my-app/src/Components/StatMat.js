import React from 'react';
import * as d3 from 'd3';
import PubSub from 'pubsub-js'

class StatMat extends React.Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {

        let that = this
        d3.json('/person_stat.json').then(data => {
            that.person_stats = data
            console.log(that.person_stats)
        })

        this.token = PubSub.subscribe('persons-selected', (eventName, persons)=>{
            that.drawGraphs(persons)
        })
    }

    drawGraphs(persons){

        let data = []

        persons.forEach(d => {
            data.push(this.person_stats[d])
        })

        d3.select('#statContainer').selectAll('*').remove()

        let width = 500
        let height = 200

        d3.select('#statContainer').append('svg')
        .attr('width', width)
        .attr('height', height)

        let day_night_data = []
        let work_relax_data = []
        let avg_call = []
        let avg_during = []
        let avg_move = []

        data.forEach(d => {
            day_night_data.push([d.acl, d.acn])
            work_relax_data.push([d.acw, d.acr])
            avg_call.push(d.act)
            avg_during.push(d.adt)
            avg_move.push(d.amd)
        })

        this.drawMatrix(day_night_data, 50, 10)
        this.drawMatrix(work_relax_data, 200, 10)

        this.drawLineChart(avg_call, 350, 10)
        this.drawLineChart(avg_during, 400, 10)
        this.drawLineChart(avg_move, 450, 10)
    }

    drawMatrix(data, anchor_x, anchor_y){

        let width = 100
        let height = 100

        let xScale = d3.scaleLinear().domain([d3.min(data, d => d[0]), 
            d3.max(data, d => d[0])]).range([0, width])
        let yScale = d3.scaleLinear().domain([d3.min(data, d => d[1]), 
            d3.max(data, d => d[1])]).range([0, height])

        let svg = d3.select('#statContainer').select('svg').append('g')
        .attr('transform', 'translate(' + anchor_x + ',' + anchor_y + ')')

        let back = svg.append('g')
        back.append('line')
        .attr('stroke', 'grey')
        .attr('stroke-width', '1')
        .attr('x1', 0).attr('x2', width)
        .attr('y1', 0).attr('y2', 0)

        back.append('line')
        .attr('stroke', 'grey')
        .attr('stroke-width', '1')
        .attr('x1', 5).attr('x2', width - 5)
        .attr('y1', height).attr('y2', height)

        back.append('line')
        .attr('stroke', 'grey')
        .attr('stroke-width', '1')
        .attr('x1', 0).attr('x2', 0)
        .attr('y1', 5).attr('y2', height - 5)

        back.append('line')
        .attr('stroke', 'grey')
        .attr('stroke-width', '1')
        .attr('x1', width).attr('x2', width)
        .attr('y1', 5).attr('y2', height - 5)

        back.append('text')
        .attr('x', 20).attr('y', height + 15)
        .attr('font-size', 10)
        .text('call times in day')

        back.append('g').attr('transform', 'rotate(90)')
        .append('text')
        .attr('x', 10).attr('y', 15)
        .attr('font-size', 10)
        .text('call times in night')

        svg.append('g')
        .selectAll('point')
        .data(data)
        .enter()
        .append('circle')
        .attr('cx', d => xScale(d[0]))
        .attr('cy', d => yScale(d[1]))
        .attr('r', 2)
        .attr('fill','steelblue')

    }

    drawLineChart(data, anchor_x, anchor_y){
        
        let height = 100

        let svg = d3.select('#statContainer').select('svg').append('g')
        .attr('transform', 'translate(' + anchor_x + ',' + anchor_y + ')')

        let yScale = d3.scaleLinear().domain([d3.min(data, d => d), 
            d3.max(data, d => d)]).range([0, height])

        let back = svg.append('g')
        back.append('rect')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', 5)
        .attr('height', height)
        .attr('fill', 'black')
        .attr('opacity', '0.1')

        svg.append('g')
        .selectAll('point')
        .data(data)
        .enter()
        .append('circle')
        .attr('cx', 3)
        .attr('cy', d => yScale(d))
        .attr('r', 2)
        .attr('fill','steelblue')

        back.append('g').attr('transform', 'rotate(90)')
        .append('text')
        .attr('x', 15).attr('y', 20)
        .attr('font-size', 10)
        .text('total call times')

    }

    render() {
        return (
            <div id='statContainer' style={{background:'rgba(255,255,255,0)', left:'0', position:'absolute', width:'600px', zIndex:'999', height:'200px', top:'55%', maxHeight: '1620px',
            overflowY: 'auto'}}>
                
            </div>
        )
    }
}

export default StatMat;