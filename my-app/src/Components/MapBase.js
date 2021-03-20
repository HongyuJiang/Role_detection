import React from 'react';
import mapboxgl from 'mapbox-gl';
import DataProvider from "./DataProvider";
import PubSub from 'pubsub-js'
import * as DC from 'density-clustering';
import minimumCircle from './minimumCircle'
import * as d3 from 'd3';

mapboxgl.accessToken = 'pk.eyJ1IjoiaG9uZ3l1amlhbmciLCJhIjoiY2tnajVvNTZiMGE5YTJ3bmZ4bTkwZ2FzeSJ9.Jn2qkNB2GcQUdbaSQTaGuQ';

class MapBase extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            lng: 104.849,
            lat: 31.558,
            zoom: 8.5
        };
    }

    addCell2Map(cells) {

        let cell_dict = DataProvider.cell_info

        let points = [];

        for (let cell_id in cells) {

            if (cell_dict[cell_id] != undefined) {
                let cell = cell_dict[cell_id];

                let meta = {};
                meta["properties"] = {};
                if (cell.name.split("_").length > 1)
                    cell.name = cell.name.split("_")[1];
                meta["properties"]["name"] = cell.name.replace("绵阳", "");
                meta["properties"]["weight"] = 1;
                meta["type"] = "Feature";
                meta["geometry"] = {};
                meta["geometry"]["type"] = "Point";
                meta["geometry"]["coordinates"] = [cell.lon, cell.lat];

                points.push(meta);
            } else {
                //console.log(cell_id)
            }
        }

        if (this.map.getSource("cells") != null) {
            this.map.getSource("cells").setData({
                type: "FeatureCollection",
                features: points,
            });
        } else {
            this.map.addSource("cells", {
                type: "geojson",
                data: {
                    type: "FeatureCollection",
                    features: points,
                },
            });

            this.map.addLayer({
                id: "cells-circle",
                type: "circle",
                source: "cells",
                paint: {
                    "circle-radius": 2,
                    "circle-color": "#666",
                    "circle-stroke-width": 1,
                    "circle-stroke-color": "#fff",
                },
                //minzoom: 10,
            });

            this.map.addLayer({
                id: "cells-text",
                type: "symbol",
                source: "cells",
                layout: {
                    "text-field": "{name}",
                    //"text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
                    "text-size": 12,
                    "text-offset": [0, 1.2],
                    "text-anchor": "top",
                },
                paint: {
                    "text-color": "#000",
                },
                //minzoom: 12,
            });
        }
    }

    CalculateCluster(cells){

        let dbscan = new DC.DBSCAN();

        let cell_dict = DataProvider.cell_info

        let points = []

        let names = []

        for (let cell in cells){

            let info = cell_dict[cell]

            if(info != undefined){

                var p = this.map.project(new mapboxgl.LngLat(info.lon, info.lat))

                points.push([p.x, p.y])
                names.push(cell)
            }
 
        }

        let cluster_with_id = []

        var clusters = dbscan.run(points, 15, 1);

        let ccList = []

        var myColor = d3.scaleOrdinal().domain(cluster_with_id)
        .range(d3.schemeSet2);

        clusters.forEach(cluster => {

            let pp = []

            let nodes = []

            cluster.forEach(c => {

                pp.push({'x': points[c][0], 'y': points[c][1]})
                nodes.push(names[c])

            })

            cluster_with_id.push(nodes)

            var cc = minimumCircle().data(pp)

            var ccData = cc()

            var p = this.map.unproject(ccData)

            let meta = {};
            meta["properties"] = {};
            meta["properties"]['radius'] = ccData.r + 3;
            meta["properties"]['color'] = myColor(cluster_with_id.length - 1)
            meta["type"] = "Feature";
            meta["geometry"] = {};
            meta["geometry"]["type"] = "Point";
            meta["geometry"]["coordinates"] = [p.lng, p.lat];

            ccList.push(meta)

        })

        DataProvider.color_assigner = myColor
        DataProvider.clusters = cluster_with_id

     //let cluster_IDs = Array.from(new Array(cluster_with_id.length + 1).keys()).slice(1)

        if (this.map.getSource("mCircles") != null) {
            this.map.getSource("mCircles").setData({
                type: "FeatureCollection",
                features: ccList,
            });
        } else {
            this.map.addSource("mCircles", {
                type: "geojson",
                data: {
                    type: "FeatureCollection",
                    features: ccList,
                },
            });

            this.map.addLayer({
                id: "mCircles-circle",
                type: "circle",
                source: "mCircles",
                paint: {
                    "circle-radius": { "type": "identity", "property": "radius" },
                    "circle-stroke-width": 2,
                    "circle-opacity": 0,
                    "circle-stroke-color": { "type": "identity", "property": "color" },
                },
                //minzoom: 10,
            });
        }

    }

    componentDidMount() {
        
        this.map = new mapboxgl.Map({
            container: this.mapContainer,
            style: 'mapbox://styles/hongyujiang/cja85j9mi0a752rsu2qjp5cev',
            center: [this.state.lng, this.state.lat],
            zoom: this.state.zoom
        });

        d3.selectAll('.mapboxgl-ctrl').remove()

        DataProvider.getCellInfo().then((response) => {
            let data = response.data;
            DataProvider.cell_info = data

        });

        DataProvider.getUserSeqs()

        let that = this
            
        this.token = PubSub.subscribe('send-data', (eventName, data)=>{

            let user = Object.keys(data)[1]
        
            that.addCell2Map(data[user])

            this.cells = data[user]

            this.CalculateCluster(this.cells)

        })

        this.map.on('moveend', d => {

            if(this.cells != undefined)
                that.CalculateCluster(this.cells)

            if(DataProvider.detailData != undefined){

                PubSub.publish('details-data', DataProvider.detailData);
            }
                
        })
    }

    render() {
        return (
            <div>
                <div ref={el => this.mapContainer = el} className="mapContainer" />
            </div>
        )
    }
}

export default MapBase;