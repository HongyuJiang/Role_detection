import React from 'react';
import * as d3 from 'd3';

class UI extends React.Component {
    constructor(props) {
        super(props);
      
    }

    componentDidMount() {
        
        d3.selectAll('.mapboxgl-ctrl').remove()
    }

    render() {
        return (
            <div style={{zIndex:'9999', background:'rgba(0,0,0,0.1)', left:'0px', color:'#666', fontWeight:500, paddingTop:'5px', top:'0px', position:'absolute', width:'100%', height: '4%'}}>
                User Roles and Behavior Patterns Visual Analysis System
            </div>
        )
    }
}

export default UI;