import React from 'react';
import * as d3 from 'd3';
import $ from "jquery";
import PubSub from 'pubsub-js'
import DataProvider from "./DataProvider";

class SocialGraph extends React.Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {

        let that = this

        this.token = PubSub.subscribe('social-data', (eventName, data)=>{

            //let user = Object.keys(data)[1]
        
            //let cell_finger = data[user]

            that.drawGraphs(data)
            

        })
        
    }

    drawGraphs(cells){

        d3.select('#graphContainer').selectAll('*').remove()

        let canvas = d3.select('#graphContainer').append('svg')
        .attr('width', width)
        .attr('height', canvas_height)

    }

    render() {
        return (
            <div id='graphContainer' style={{background:'rgba(255,255,255,0.9)', left:'0', position:'absolute', width:'300px', zIndex:'999', height:'70%', top:'20px', maxHeight: '1620px',
            overflowY: 'auto'}}>
                
            </div>
        )
    }
}

export default SocialGraph;