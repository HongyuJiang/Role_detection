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
            lng: 104.849, lat: 31.558, zoom: 8.5
        };
    }

    addCell2Map(cells) {

        let cell_dict = DataProvider.cell_info
        let points = [];

        for (let cell_id in cells) {

            if (cell_dict[cell_id] != undefined) {
                let cell = cell_dict[cell_id];
                let meta = {};
                console.log(cell['name'])
                meta["properties"] = {};
                meta["properties"]["name"] = cell['name'].replace("绵阳", "");
                meta["properties"]["weight"] = cells[cell_id]['sum'];
                meta["type"] = "Feature";
                meta["geometry"] = {};
                meta["geometry"]["type"] = "Point";
                meta["geometry"]["coordinates"] = [cell.lon, cell.lat];
                points.push(meta);
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

        var myColor = d3.scaleOrdinal().domain([0, clusters.length])
        .range(d3.schemeSet2);

        clusters.forEach(cluster => {

            let pp = []
            let nodes = []

            cluster.forEach(c => {
                pp.push({'x': points[c][0], 'y': points[c][1]})
                nodes.push(names[c])
            })

            cluster_with_id.push(nodes)
            let cc = minimumCircle().data(pp)
            let ccData = cc()
            let p = this.map.unproject(ccData)

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

    mapAddHeatmap() {

        if(typeof this.map.getLayer('cells-heat') !== 'undefined')
            return 0;

        this.map.addLayer({
          id: "cells-heat",
          type: "heatmap",
          source: "cells",
          maxzoom: 12,
          paint: {
            // Increase the heatmap weight based on frequency and property magnitude
            "heatmap-weight": [
              "interpolate",
              ["linear"], ["get", "weight"],
              8, 0,
              12, 1,
            ],
    
            "heatmap-intensity": [
              "interpolate",
              ["linear"], ["zoom"],
              8, 0,
              12, 1,
            ],
        
            "heatmap-color": [
              "interpolate",
              ["linear"],
              ["heatmap-density"],
              0, "rgba(0,0,0,0)",
              0.2, "rgba(104, 179, 247, 0)",
              0.4, "rgb(182, 104, 115)",
              0.6, "rgb(242, 183, 5)",
              0.8, "rgb(242, 110, 34)",
              1.0, "rgb(250, 130, 120)",
            ],
            // Adjust the heatmap radius by zoom level
            "heatmap-radius": [
              "interpolate",
              ["linear"], ["zoom"],
              5, 10,
              8, 20,
              10, 30,
            ],
            // Transition from heatmap to circle layer by zoom level
            "heatmap-opacity": ["interpolate", ["linear"], ["zoom"], 9, 0.8, 13, 0],
          },
        });
      }

    componentDidMount() {
        
        this.map = new mapboxgl.Map({
            container: this.mapContainer,
            style: 'mapbox://styles/hongyujiang/cja85j9mi0a752rsu2qjp5cev',
            //style: 'mapbox://styles/hongyujiang/cjl1ya0sn4m0m2sqj0pbkuqor',
            center: [this.state.lng, this.state.lat],
            zoom: this.state.zoom
        });

        d3.selectAll('.mapboxgl-ctrl').remove()

        DataProvider.getCellInfo().then((response) => {
            let data = response.data;
            
            for (let id in data){
                let cell = data[id]
                if (cell.name.split("_").length > 1){
                    if (cell.name.indexOf('室分') < 0){
                        cell.name = cell.name.split("_")[1];
                    }
                    else{
                        cell.name = cell.name.split("_")[2];
                    }
                }
            }

            DataProvider.cell_info = data

        });

        DataProvider.getUserSeqs()

        let that = this
            
        this.token = PubSub.subscribe('send-data', (eventName, data)=>{

            let user = Object.keys(data)[1]
            that.addCell2Map(data[user])
            that.mapAddHeatmap()
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