import React from 'react';
import * as d3 from 'd3';
import $ from "jquery";
import PubSub from 'pubsub-js'
import DataProvider from "./DataProvider";

class UI extends React.Component {
    constructor(props) {
        super(props);
      
    }

    userRecordsQuery(e) {
        e.preventDefault();
        let user = d3.select('#userInput').property("value")
        let person_dict = {}
        person_dict[user] = 1
        $.post('http://localhost:4001/getRecordsByUser/', JSON.stringify(
            {'persons': person_dict}))
               .done(function( data ) {
                
                PubSub.publish('send-data', JSON.parse(data));

                if(this.detailData == undefined){

                    $.post('http://localhost:4001/getDetailsByUser/', JSON.stringify(
                    {'persons': person_dict}))
                    .done(function( data ) {

                        PubSub.publish('details-data', JSON.parse(data));
                        this.detailData = JSON.parse(data)
                        DataProvider.detailData = this.detailData
                    });

                }
                else{

                    PubSub.publish('details-data', this.detailData);
                }
                
        });

        
      }

    componentDidMount() {
        
        d3.selectAll('.mapboxgl-ctrl').remove()
    }

    render() {
        return (
            <div style={{zIndex:'9999', left:'10px', top:'10px', position:'absolute'}}>
                <input id='userInput' value='18608080118'/>
                <button onClick={this.userRecordsQuery} >Query</button>
            </div>
        )
    }
}

export default UI;