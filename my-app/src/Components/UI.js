import React from 'react';
import * as d3 from 'd3';
import $ from "jquery";
import PubSub from 'pubsub-js'

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
        });
      }

    componentDidMount() {
        
    }

    render() {
        return (
            <div style={{zIndex:'9999'}}>
                <input id='userInput' value='13035631411'/>
                <button onClick={this.userRecordsQuery} >Query</button>
            </div>
        )
    }
}

export default UI;