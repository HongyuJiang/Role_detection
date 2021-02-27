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

        let width = window.innerWidth

        let height = 300

        let canvas = d3.select('#ganttContainer').append('svg')
        .attr('width', width)
        .attr('height', height)

        let clusters = DataProvider.clusters;
  
    }

    render() {
        return (
            <div id='ganttContainer' style={{background:'rgba(205,235,225,0.6)', left:'0', bottom:'0', position:'absolute', height:'200px', zIndex:'999', width:'100%'}}>
                
            </div>
        )
    }
}

export default GanttBot;