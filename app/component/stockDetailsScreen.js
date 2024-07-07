// exploreStockScreen.js
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, ActivityIndicator, Button } from 'react-native';
import axios from 'axios';
import { LineChart } from 'react-native-chart-kit';
import { ALPHA_VANTAGE_API_KEY } from '@env';
import { storeDataInCache,getCachedData } from '../utils/storeData.js';

import { Dimensions } from 'react-native';

const API_URL = 'https://www.alphavantage.co/query';

const fetchStocksData = async () => {
  try {
    const response = await axios.get(API_URL, {
      params: {
        function: 'TOP_GAINERS_LOSERS',
        apikey: API_KEY,
      },
      headers: {'User-Agent': 'request'},
    });
    return response.data;
  } catch (error) {
    console.error(error);
    return null;
  }
};
const ExploreStocks= () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigation = useNavigation();
  
    useEffect(() => {
      const getData = async () => {
        const result = await fetchStocksData();
        setData(result);
        setLoading(false);
      };
  
      getData();
    }, []);
  
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
        </View>
      );
    }
  
    const renderItem = ({ item }) => (
      <TouchableOpacity style={styles.item} onPress={() => navigation.navigate('StockDetails', { symbol: item.ticker })}>
        <Text style={styles.ticker}>{item.ticker}</Text>
        <Text style={styles.price}>${item.price}</Text>
        <Text style={[styles.change, item.change_amount.startsWith('-') ? styles.negativeChange : styles.positiveChange]}>
          {item.change_amount} ({item.change_percentage})
        </Text>
      </TouchableOpacity>
    );
  
    return (
      <View style={styles.container}>
        <Text style={styles.sectionTitle}>Top Gainers</Text>
        <FlatList
          data={data.top_gainers}
          renderItem={renderItem}
          keyExtractor={(item) => item.ticker}
          horizontal={false}
        />
        <Text style={styles.sectionTitle}>Top Losers</Text>
        <FlatList
          data={data.top_losers}
          renderItem={renderItem}
          keyExtractor={(item) => item.ticker}
          horizontal={false}
        />
      </View>
    );
  };
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#fff',
      padding: 10,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    sectionTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      marginVertical: 10,
    },
    item: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      padding: 15,
      marginVertical: 5,
      backgroundColor: '#f9f9f9',
      borderRadius: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.3,
      shadowRadius: 1.5,
      elevation: 3,
    },
    ticker: {
      fontSize: 18,
      fontWeight: 'bold',
    },
    price: {
      fontSize: 18,
      color: '#333',
    },
    change: {
      fontSize: 18,
    },
    positiveChange: {
      color: '#4caf50',
    },
    negativeChange: {
      color: '#f44336',
    },
  });
  
  export default ExploreStocks;
  