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

        d3.select('#statContainer').selectAll('svg').remove()

        let width = 600
        let height = 300

        d3.select('#statContainer').append('svg')
        .attr('width', width)
        .attr('height', height)
        .append('g').attr('transform', 'translate(0, 30)')
        .attr('id','canvas')

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

        this.drawMatrix(day_night_data, 50, 10, 'day', 'night')
        this.drawMatrix(work_relax_data, 270, 10, 'work day', 'relax day')

        this.drawLineChart(avg_call, 480, 10, 'avg call time')
        this.drawLineChart(avg_during, 530, 10, 'avg during time')
        this.drawLineChart(avg_move, 580, 10, 'avg move distance')
    }

    drawMatrix(data, anchor_x, anchor_y, x_name, y_name){

        let width = 150
        let height = 150

        let xScale = d3.scaleLinear().domain([d3.min(data, d => d[0]), 
            d3.max(data, d => d[0])]).range([0, width])
        let yScale = d3.scaleLinear().domain([d3.min(data, d => d[1]), 
            d3.max(data, d => d[1])]).range([0, height])

        let svg = d3.select('#statContainer').select('#canvas').append('g')
        .attr('transform', 'translate(' + anchor_x + ',' + anchor_y + ')')

        let back = svg.append('g')
        back.append('line')
        .attr('stroke', 'grey')
        .attr('stroke-width', '1.5')
        .attr('x1', 0).attr('x2', width)
        .attr('y1', 0).attr('y2', 0)

        back.append('line')
        .attr('stroke', 'grey')
        .attr('stroke-width', '1.5')
        .attr('x1', 1).attr('x2', width - 1)
        .attr('y1', height).attr('y2', height)

        back.append('line')
        .attr('stroke', 'grey')
        .attr('stroke-width', '1.5')
        .attr('x1', 0).attr('x2', 0)
        .attr('y1', 1).attr('y2', height - 1)

        back.append('line')
        .attr('stroke', 'grey')
        .attr('stroke-width', '1.5')
        .attr('x1', width).attr('x2', width)
        .attr('y1', 1).attr('y2', height - 1)

        back.append('text')
        .attr('x', width / 4).attr('y', height + 30)
        .attr('font-size', 10)
        .text('call times in ' + x_name)

        back.append('g').attr('transform', 'rotate(90)')
        .append('text')
        .attr('x', width / 4).attr('y', 35)
        .attr('font-size', 10)
        .text('call times in ' + y_name)

        var x_axis = d3.axisBottom().scale(xScale).ticks(5)
        var y_axis = d3.axisLeft().scale(yScale).ticks(10)

        let x_axes = svg.append("g").attr('transform','translate(' + 0 + ',' + height + ')')
        .call(x_axis)
        let y_axes = svg.append("g").attr('transform','translate(' + 0 + ',' + 0 + ')')
        .call(y_axis)

        x_axes.selectAll('path').attr('stroke','black')
        x_axes.selectAll('line').attr('stroke','black')
        x_axes.selectAll('text').attr('fill','black')

        y_axes.selectAll('path').attr('stroke','black')
        y_axes.selectAll('line').attr('stroke','black')
        y_axes.selectAll('text').attr('fill','black')

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

    drawLineChart(data, anchor_x, anchor_y, name){
        
        let height = 150

        if (name == 'avg move distance'){
            for(let i =0;i<data.length;i++){
                data[i] = data[i] * 99
            }
        }

        let svg = d3.select('#statContainer').select('#canvas').append('g')
        .attr('transform', 'translate(' + anchor_x + ',' + anchor_y + ')')

        let yScale = d3.scaleLinear().domain([d3.min(data, d => d), 
            d3.max(data, d => d)]).range([0, height])

        let back = svg.append('g')
        back.append('rect')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', 5)
        .attr('height', height)
        .attr('fill', () => {
            if (name == 'avg move distance') return 'red'
            return 'black'
        })
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
        .attr('x', height / 4).attr('y', 20)
        .attr('font-size', 10)
        .text(name)

        svg.append('text')
        .attr('font-size', 12)
        .attr('fill','black')
        .attr('x', 3)
        .attr('y', -10)
        .style("text-anchor", "middle")
        .text(parseInt(d3.max(data)))

        svg.append('text')
        .attr('font-size', 12)
        .attr('fill','black')
        .attr('x', 3)
        .attr('y', height + 20)
        .style("text-anchor", "middle")
        .text(parseInt(d3.min(data)))

    }

    render() {
        return (
            <div id='statContainer' style={{background:'rgba(255,255,255,0)', left:'30px', position:'absolute', width:'600px', zIndex:'999', height:'250px', top:'53%', maxHeight: '1620px',
            overflowY: 'auto'}}>

                <div style={{ float:'left', marginLeft:'50px', width:'150px', height:'30px', background:'grey', fontSize:24, color:'white', borderRadius:'5px'}} > Group Stat. </div>

            </div>
        )
    }
}

export default StatMat;