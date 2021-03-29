import React from 'react';
import * as d3 from 'd3';
import PubSub from 'pubsub-js'
import DataProvider from "./DataProvider";

class CellCard extends React.Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {

        let that = this

        this.token = PubSub.subscribe('send-data', (eventName, data)=>{

            let user = Object.keys(data)[1]
        
            let cell_finger = data[user]

            that.drawCards(cell_finger)
            

        })
        
    }

    drawCards(cells){

        let cell_list = []

        let sum_max = 0, sum_min = 100000

        for(let cell in cells){

            let times = Object.keys(cells[cell])

            let sum = 0

            times.forEach(t => {sum += cells[cell][t]})

            cells[cell]['sum'] = sum

            times.forEach(t => {

                let v = cells[cell][t]

                if(v > sum_max) sum_max = v
                if(v < sum_min) sum_min = v
            })

        
            if (DataProvider.cell_info[cell] != undefined)
                cell_list.push({'name': DataProvider.cell_info[cell].name, 'his': cells[cell]})
            else
                cell_list.push({'name': cell, 'his': cells[cell]})
        }

        cell_list = cell_list.sort((a,b) => {return b.his.sum - a.his.sum})

        let sumScale = d3.scaleLinear().domain([sum_min, sum_max]).range([0, 75])

        let width = 300

        let shown_cell_list = cell_list.filter(d => d.his.sum > 10)

        let canvas_height = shown_cell_list.length * 80 + 15

        d3.select('#cardContainer').selectAll('*').remove()

        let canvas = d3.select('#cardContainer').append('svg')
        .attr('width', width)
        .attr('height', canvas_height)

        let cards = canvas.selectAll('.card')
        .data(shown_cell_list)
        .enter()
        .append('g')
        .attr('transform', 'translate(0,0)')

        cards.append('rect')
        .attr('width', 300)
        .attr('height', 75)
        .attr('fill', 'grey')
        .attr('opacity', 0.2)

        cards.append('text')
        .attr('x', width - 15)
        .attr('y', 10)
        .attr('font-size', 11)
        .text(sum_max)

        cards.append('text')
        .attr('x', 15)
        .attr('y', 75 - 5)
        .attr('font-size', 11)
        .text('0 - 24')

        cards.append('text')
        .attr('x', 10)
        .attr('y', 15)
        .attr('font-size', 12)
        .text(d => d.name)
        
        cards.selectAll('.bar')
        .data(d => {
            let arr = []
            for(let t in d.his){
                if (t != 'sum')
                    arr.push({'t': t, 'value': d.his[t]})
            }
            return arr
        })
        .enter()
        .append('rect')
        .attr('x', (d, i) => {return d.t * 10})
        .attr('y', d => 75 - sumScale(d.value))
        .attr('width', 8)
        .attr('height', d => sumScale(d.value))
        .attr('fill', '#ff1c2d')
        .attr('opacity', 0.3)

        cards.transition().duration(1200).attr('transform', (d,i) => {
            return 'translate(0,' + (10 + i * 80) + ')'
        })
  
    }

    render() {
        return (
            <div id='cardContainer' style={{background:'rgba(255,255,255,0.9)', right:'0', position:'absolute', width:'320px', zIndex:'999', height:'70%', top:'20px', maxHeight: '1620px',
            overflowY: 'auto'}}>
                
            </div>
        )
    }
}

export default CellCard;