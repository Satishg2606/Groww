import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ALPHA_VANTAGE_API_KEY } from '@env';
import { storeDataInCache,getCachedData } from '../utils/storeData.js';
const API_URL = "https://www.alphavantage.co/query";

const CACHE_KEY = 'companyOverview';
const CACHE_TIME_KEY = 'cacheTimeForCompanyApiCall';
const API_CALLS_KEY = 'apiCallsCountForCompany';
const MAX_API_CALLS = 10;

const getCurrentDate = () => {
  const now = new Date();
  return `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
};

const fetchTimeSeriesData = async (symbol) => {
  try {
    const response = await axios.get(API_URL, {
      params: {
        function: 'TIME_SERIES_DAILY',
        symbol: symbol,
        apikey: ALPHA_VANTAGE_API_KEY,
      },
    });

    return response.data['Time Series (Daily)'];
  } catch (error) {
    console.error('Error fetching time series data:', error);
    return null;
  }
};

export const fetchTimeSeriesIntraDay = async (symbol) => {
  const cacheKey = `timeSeriesIntraDay_${symbol}`;
  const cachedData = await getCachedData(cacheKey);

  if (cachedData) {
    return cachedData;
  }

  try {
    const response = await axios.get(API_URL, {
      params: {
        function: 'TIME_SERIES_INTRADAY',
        symbol: symbol,
        interval: '5min',
        apikey: ALPHA_VANTAGE_API_KEY,
      },
    });

    const timeSeriesData = response.data['Time Series (5min)'];
    if(timeSeriesData?.length>0)
    {
      await storeDataInCache(cacheKey, timeSeriesData);
    }else{
      console.log(response);
    }
    return timeSeriesData;
  } catch (error) {
    console.error('Error fetching time series data:', error);
    return null;
  }
};


export const fetchCompanyInfo = async (symbol) => {
  try {
    const cachedData = await getCachedData(CACHE_KEY);
    const cacheTime = await getCachedData(CACHE_TIME_KEY);
    const currentDate = getCurrentDate();

    if (cachedData && cacheTime === currentDate) {
      console.log('Cache data in use-------');
      return JSON.parse(cachedData);
    }

    const apiCallCount = parseInt(await getCachedData(API_CALLS_KEY + currentDate)) || 0;
    if (apiCallCount >= MAX_API_CALLS) {
      console.warn('API call limit reached for today');
      return cachedData ? JSON.parse(cachedData) : null;
    }

    const companyResponse = await axios.get(API_URL, {
      params: {
        function: 'OVERVIEW',
        symbol: symbol,
        apikey: ALPHA_VANTAGE_API_KEY,
      },
    });

    const timeSeriesData = await fetchTimeSeriesData(symbol);

    const combinedData = {
      ...companyResponse.data,
      timeSeries: timeSeriesData,
    };

    await storeDataInCache(API_CALLS_KEY + currentDate, (apiCallCount + 1).toString());
    await storeDataInCache(CACHE_KEY, JSON.stringify(combinedData));
    await storeDataInCache(CACHE_TIME_KEY, currentDate);

    return combinedData;
  } catch (error) {
    console.log('Error while fetching the Overview', error);
  }
};
