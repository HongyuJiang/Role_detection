import axios from 'axios';
import * as d3 from 'd3';

export default class DataProvider {

    static getCellInfo() {

        return axios.get('/cell_info.json');
    }

    static getUserEmbData() {

        return axios.get('/user_emb.json');
    }

    static cell_info = {}

    static person_seqs_dict = {}

    static color_assigner = {}

    static getUserSeqs(){

       let that = this

       d3.csv('/person_seqs.csv').then(data => {

            data.forEach(d => {

                if (that.person_seqs_dict[d.person] != undefined){

                    that.person_seqs_dict[d.person].push({'time': d.time, 'cell': d.cell})

                }
                else{

                    that.person_seqs_dict[d.person] = []
                    that.person_seqs_dict[d.person].push({'time': d.time, 'cell': d.cell})
                }
            })

            
       })
    }

}