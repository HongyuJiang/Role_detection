import axios from 'axios';

export default class DataProvider {
    static getCellInfo() {

        return axios.get('/cell_info.json');
    }

    static getUserEmbData() {

        return axios.get('/user_emb.json');
    }

    static cell_info = {}

}