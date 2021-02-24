import React from 'react';
import * as d3 from 'd3';
import $ from "jquery";
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

        for(let cell in cells){

            let times = Object.keys(cells[cell])

            let sum = 0

            times.forEach(t => {sum += cells[cell][t]})

            cells[cell]['sum'] = sum

            if (DataProvider.cell_info[cell] != undefined)
                cell_list.push({'name': DataProvider.cell_info[cell].name, 'his': cells[cell]})
            else
                cell_list.push({'name': cell, 'his': cells[cell]})
        }

        let width = 300

        let height = window.innerHeight

        let canvas = d3.select('#cardContainer').append('svg')
        .attr('width', width)
        .attr('height', height)

        let cards = canvas.selectAll('.card')
        .data(cell_list.filter(d => d.his.sum > 10))
        .enter()
        .append('g')
        .attr('transform', 'translate(0,0)')

        cards.append('rect')
        .attr('width', 300)
        .attr('height', 75)
        .attr('fill', 'grey')
        .attr('opacity', 0.2)

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
        .attr('y', d => 75 - d.value * 10)
        .attr('width', 8)
        .attr('height', d => d.value * 10)
        .attr('fill', 'steelblue')
        .attr('opacity', 0.7)

        cards.transition().duration(1200).attr('transform', (d,i) => {
            return 'translate(0,' + (10 + i * 80) + ')'
        })
  
    }

    render() {
        return (
            <div id='cardContainer' style={{background:'rgba(255,255,255,0.9)', right:'0', position:'absolute', width:'300px', zIndex:'999', height:'100%'}}>
                
            </div>
        )
    }
}

export default CellCard;