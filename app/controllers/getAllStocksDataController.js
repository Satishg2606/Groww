import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { ALPHA_VANTAGE_API_KEY, FINHUB_API_KEY } from '@env';
import { getCachedData,storeDataInCache } from '../utils/storeData.js';
const API_URL = 'https://www.alphavantage.co/query';
const FINHUB_API_URL = 'https://finnhub.io/api/v1/stock/profile2';

const CACHE_KEY = 'stocksData';
const CACHE_TIME_KEY = 'cacheTime';
const API_CALLS_KEY = 'apiCallsCount';
const MAX_API_CALLS = 10;

const getCurrentDate = () => {
  const now = new Date();
  return `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
};

const fetchCompanyInfo = async (ticker) => {
  try {
    const response = await axios.get(FINHUB_API_URL, {
      params: {
        symbol: ticker,
        token: FINHUB_API_KEY,
      },
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching company info for ${ticker}: `, error);
    return null;
  }
};

const addCompanyInfo = async (stocks) => {
  let companyData = [];
  return await Promise.all(
    stocks.map(async (stock) => {
      const companyInfo = await fetchCompanyInfo(stock.ticker.substring(0, 4));
      companyData=[...companyData,companyInfo];
    //   console.log(companyData.toString());
      return {
        ...stock,
        name: companyInfo?.name || companyInfo.ticker,
        logo: companyInfo?.logo || null,
      };
    })
  );
  
};
const getStocksData = async () => {
  try {
    const cachedData = await getCachedData(CACHE_KEY);
    const cacheTime = await getCachedData(CACHE_TIME_KEY);
    const currentDate = getCurrentDate();

    if (cachedData && cacheTime === currentDate) {
        console.log("Cache data in use-------");
        // console.log(cachedData);
      return JSON.parse(cachedData);
    }

    const apiCallCount = parseInt(await getCachedData(API_CALLS_KEY + currentDate)) || 0;
    if (apiCallCount >= MAX_API_CALLS ) {
      console.warn('API call limit reached for today');
      return cachedData ? JSON.parse(cachedData) : null;
    }

    const response = await axios.get(API_URL, {
      params: {
        function: 'TOP_GAINERS_LOSERS',
        apikey: ALPHA_VANTAGE_API_KEY,
      },
      headers: { 'User-Agent': 'request' },
    });
    // console.log(response);
    if(response?.data?.Information){
        console.log("No Data Available");
        return null;
    }


    const modifiedData = {
      ...response.data,
      top_gainers: await addCompanyInfo(response.data.top_gainers),
      top_losers: await addCompanyInfo(response.data.top_losers),
    };
    console.log(modifiedData);
    await storeDataInCache(API_CALLS_KEY + currentDate, (apiCallCount + 1).toString());
    await storeDataInCache(CACHE_KEY ,JSON.stringify(modifiedData));
    await storeDataInCache(CACHE_TIME_KEY ,CACHE_TIME_KEY);
    // await AsyncStorage.setItem(API_CALLS_KEY + currentDate, (apiCallCount + 1).toString());
    // await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(modifiedData));
    // await AsyncStorage.setItem(CACHE_TIME_KEY, CACHE_TIME_KEY);

    return modifiedData;
  } catch (error) {
    console.error('Error while fetching data: ', error);
    return null;
  }
};

export default getStocksData;
