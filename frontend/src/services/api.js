import axios from 'axios';

const api = axios.create({
  baseURL: '/api/olap',
});

export const getRollupContinentYearCases = () => api.get('/rollup');
export const getDrilldownCountry = (countryName) => api.get(`/drilldown/${countryName}`);
export const getSliceYear = (year) => api.get(`/slice/${year}`);
export const getDice = (params) => api.get('/dice', { params });
export const getCorrelation = () => api.get('/correlation');
export const getScatterData = () => api.get('/scatter-data');
export const getCountries = () => api.get('/countries');

export default api;
