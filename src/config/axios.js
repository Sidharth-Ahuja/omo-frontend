import axios from 'axios';

const instance = axios.create({
  // baseURL: 'https://us-central1-omo-v1.cloudfunctions.net/omoAPI/',
  baseURL: 'http://127.0.0.1:8999/',
});

export default instance;