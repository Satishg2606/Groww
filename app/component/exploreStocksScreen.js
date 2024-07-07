import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
} from 'react-native';
import getStockData from '../controllers/getAllStocksDataController.js';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Loader from "../utils/loading.js"

function navigateToDetails({navigation, item}) {
  navigation.navigate('StockDetails', {data: item});
}

const ExploreStocks = ({navigation}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [gainers, setGainers] = useState(true);
  const arrow = gainers ? '▲' : '▼';
  
  //fetching stocks data
  useEffect(() => {
    try{
      const getData = async () => {
      const result = await getStockData();
      
      setData(result);
      setLoading(false);
    };

    console.log('HealthCheck--OK', data);
    getData();
    }
    catch(error){
      console.log(error);
    }
  }, []);

  if (loading) {
    return <Loader />
  }

  //Flatlist stucture 
  const renderItem = ({item}) => (
    <TouchableOpacity
      style={styles.stockContainer}
      onPress={() => navigateToDetails({navigation, item})}>
      <Image
        source={{
          uri: item.logo
            ? item.logo
            : 'https://imgs.search.brave.com/fg3mE_A2Kg9NhsalZqasBq8jjvJ4BcSfPWd8yB-KDE4/rs:fit:500:0:0:0/g:ce/aHR0cHM6Ly90NC5m/dGNkbi5uZXQvanBn/LzA3LzgyLzk5Lzg3/LzM2MF9GXzc4Mjk5/ODc1MF92WFdFb2ho/MU8yWnhzU1RLVXlV/WENRTHJSb2VER0Z0/TS5qcGc',
        }}
        style={styles.logo}
      />
      <View style={styles.stockDetails}>
        <Text style={styles.ticker}>
          {item.name}({item.ticker})
        </Text>
        <Text style={styles.price}>${item.price}</Text>
        <Text
          style={[
            styles.change,
            item.change_amount.startsWith('-')
              ? styles.negativeChange
              : styles.positiveChange,
          ]}>
          {parseFloat(item.change_percentage).toFixed(2)} {arrow}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Image
        style={styles.growwLogo}
        source={require('../assets/images/groww-logo.png')}
        resizeMode="contain"
      />
      {gainers ? (
        <>
          <Text style={styles.sectionTitle}>Top Gainers</Text>
          
          {data ? (
            <>
              <FlatList
                data={data?.top_gainers}
                renderItem={renderItem}
                keyExtractor={item => item.ticker}
                numColumns={2}
                columnWrapperStyle={styles.row}
                horizontal={false}
              />
            </>
          ) : (
            <View style={styles.noDataContainer}>
            <Icon name="info" size={30} color="white" style={styles.noDataIcon} />
            <Text style={styles.noDataText}>No data available </Text>
            <Text style={{flex:2}}>( May be because API Limit is reached.)</Text>
          </View>
          )}
        </>
      ) : (
        <>
          <Text style={styles.sectionTitle}>Top Losers</Text>
          {data ? (
            <>
              <FlatList
                data={data?.top_losers}
                renderItem={renderItem}
                keyExtractor={item => item.ticker}
                numColumns={2}
                columnWrapperStyle={styles.row}
                horizontal={false}
              />
            </>
          ) : 
          <View style={styles.noDataContainer}>
            <Icon name="info" size={30} color="white" style={styles.noDataIcon} />
            <Text style={styles.noDataText}>No data available </Text>
            <Text style={{flex:2}}>( May be because API Limit is reached.)</Text>
          </View>
          }
        </>
      )}
      <View style={{flexDirection: 'row'}}>
        <TouchableOpacity
          style={[styles.button, gainers && styles.buttonActive]}
          onPress={() => setGainers(true)}>
          <Text>Top Gainer</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, !gainers && styles.buttonActive]}
          onPress={() => setGainers(false)}>
          <Text>Top Losers</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#fff',
  },
  growwLogo: {
    alignSelf: 'flex-start',
    height: 40,
    width: 150,
  },
  row: {
    flex: 1,
    justifyContent: 'space-between',
  },
  stockContainer: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 10,
    margin: 5,
    alignItems: 'flex-start',
  },
  logo: {
    alignSelf: 'flex-start',
    borderRadius: 25,
    width: 60,
    height: 60,
  },
  stockDetails: {
    marginTop: 10,
    alignItems: 'center',
  },
  ticker: {
    flexWrap: 'wrap',
    maxHeight: 70,
    fontSize: 18,
    fontWeight: 'bold',
  },
  price: {
    alignItems: 'flex-start',
    alignSelf: 'flex-start',
    fontSize: 18,
    color: '#333',
  },
  change: {
    alignItems: 'flex-start',
    verticalAlign: 'bottom',
    alignSelf: 'flex-start',
    fontSize: 18,
  },
  positiveChange: {
    color: '#4caf50',
  },
  negativeChange: {
    color: '#f44336',
  },
  companyName: {
    fontSize: 16,
    color: '#555',
    marginTop: 5,
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
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.3,
    shadowRadius: 1.5,
    elevation: 3,
  },
  button: {
    flex: 1,
    margin: 1,
    padding: 10,
    alignItems: 'center',
    borderColor: 'black',
    borderWidth: 2,
  },
  buttonActive: {
    backgroundColor: '#ddd',
  },
  noDataContainer: {
    flex:1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8d7da',
    padding: 10,
    borderRadius: 8,
    borderColor: '#f5c6cb',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 1,
    marginVertical: 20,
  },
  noDataIcon: {
    marginRight: 10,
  },
  noDataText: {
    color: '#721c24',
    fontWeight: 'bold',
    fontSize: 16,
  },

});

export default ExploreStocks;
