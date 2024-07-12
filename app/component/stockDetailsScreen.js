import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Image, ScrollView, Dimensions, TouchableOpacity } from 'react-native';
import { fetchCompanyInfo ,fetchTimeSeriesIntraDay} from '../controllers/companyOverviewController.js';
import { LineChart } from 'react-native-chart-kit';
import LinearGradient from 'react-native-linear-gradient';
import Loader from "../utils/loading.js"
import {formatNumber,processTimeSeriesData} from '../utils/commonUtils.js';

const StockDetails = ({ navigation, route }) => {
  const [companyData, setCompanyData] = useState(null);
  const [companyDataForIntraDay, setCompanyDataForIntraDay] = useState(null);
  const [loading, setLoading] = useState(true);
  const [symbol, setSymbol] = useState('');
  const [logo, setLogo] = useState('');
  const [price, setPrice] = useState('');
  const [selectedChart, setSelectedChart] = useState('1D');
  
  //fetching params data.
  useEffect(() => {
    const { data } = route.params;
    if (data) {
      setSymbol(data.ticker);
      setLogo(data.logo ? data.logo : "https://imgs.search.brave.com/fg3mE_A2Kg9NhsalZqasBq8jjvJ4BcSfPWd8yB-KDE4/rs:fit:500:0:0:0/g:ce/aHR0cHM6Ly90NC5m/dGNkbi5uZXQvanBn/LzA3LzgyLzk5Lzg3/LzM2MF9GXzc4Mjk5/ODc1MF92WFdFb2ho/MU8yWnhzU1RLVXlV/WENRTHJSb2VER0Z0/TS5qcGc");
      setPrice(data.price);
    }
  }, [route.params]);

  //fetching the company data.  
  useEffect(() => {
    try{const getData = async () => {
      if (symbol) {
        const result = await fetchCompanyInfo(symbol);
        setCompanyData(result);
        const intraDay = await fetchTimeSeriesIntraDay(symbol);
        setCompanyDataForIntraDay(intraDay);
        setLoading(false);
      }
    };
    getData();}
    catch(error){
      console.log(error);
    }
  }, [symbol]);
  
  //show loader till All the data is fetched
  if (loading) {
    return <Loader />
  }  
  
  //categorize Data into classes (IntraDay,daily,etc....)
  const processData = processTimeSeriesData(companyData.timeSeries, companyDataForIntraDay);

  //Design structure of the Graph chart.
  const chartConfig = {
    backgroundColor: '#e26a00',
    backgroundGradientFrom: '#fb8c00',
    backgroundGradientTo: '#ffa726',
    decimalPlaces: 2,
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`, 
    style: {
      borderRadius: 16,
    },
  };

  //UI for the chart.
  const renderChart = (title, data, useIntraDay = false) => {
    const chartData = useIntraDay ? companyDataForIntraDay : companyData.timeSeries;

    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>{title}</Text>
        <LineChart
          data={{
            labels: data,
            datasets: [{
              data: data.map(date => parseFloat(chartData[date]['4. close']))
            }]
          }}
          width={Dimensions.get('window').width - 30}
          height={220}
          chartConfig={chartConfig}
          style={styles.chart}
          withDots={false}
          withInnerLines={false}
        />
      </View>
    );
  };

  // select which data to project.
  const getChartData = () => {
    switch (selectedChart) {
      case '1D':
        return renderChart('Current Day', processData.currentDay, true);
      case '1M':
        return renderChart('Last Month', processData.lastMonth);
      case '3M':
        return renderChart('Last 3 Months', processData.last3Months);
      case '6M':
        return renderChart('Last 6 Months', processData.last6Months);
      case '1Y':
        return renderChart('Last Year', processData.lastYear);
      default:
        return renderChart('Current Day', processData.currentDay, true);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Details Screen</Text>
        <Text style={styles.search}>Search</Text>
      </View>
      <View style={styles.companyContainer}>
        <Image
          source={{ uri: logo }}
          style={styles.logo}
        />
        <Text style={styles.companyName}>{companyData.Name}</Text>
        <Text style={styles.ticker}>{companyData.Symbol}, Common Stock</Text>
        <Text style={styles.stockPrice}>${(price)}</Text>
      </View>
      
      {getChartData()}
      <View style={styles.chartButtonsContainer}>
        {['1D', '1M', '3M', '6M', '1Y'].map((period, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => setSelectedChart(period)}
            style={styles.chartButton}
          >
            <LinearGradient
              colors={['#4c669f', '#3b5998', '#192f6a']}
              style={styles.gradient}
            >
              <Text style={styles.chartButtonText}>{period}</Text>
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.aboutContainer}>
        <Text style={styles.sectionTitle}>About {companyData.Name}</Text>
        <Text style={styles.aboutText}>{companyData.Description}</Text>
      </View>
      <View style={styles.infoContainer}>
        <Text style={styles.infoLabel}>Industry: {companyData.Industry}</Text>
        <Text style={styles.infoLabel}>Sector: {companyData.Sector}</Text>
      </View>
      <View style={styles.statsContainer}>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>52-Week Low</Text>
          <Text style={styles.statValue}>${formatNumber(companyData['52WeekLow'])}</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>52-Week High</Text>
          <Text style={styles.statValue}>${formatNumber(companyData['52WeekHigh'])}</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>Market Cap</Text>
          <Text style={styles.statValue}>${formatNumber(companyData.MarketCapitalization)}</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>PE Ratio</Text>
          <Text style={styles.statValue}>{formatNumber(companyData.PERatio)}</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>Beta</Text>
          <Text style={styles.statValue}>{formatNumber(companyData.Beta)}</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>Dividend Yield</Text>
          <Text style={styles.statValue}>{formatNumber(companyData.DividendYield)}%</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>Profit Margin</Text>
          <Text style={styles.statValue}>{formatNumber(companyData.ProfitMargin)}%</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  search: {
    fontSize: 18,
    color: '#007BFF',
  },
  companyContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 10,
  },
  companyName: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  ticker: {
    fontSize: 16,
    color: '#555',
  },
  stockPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  chartContainer: {
    marginBottom: 20,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  chartButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    padding: 20,
  },
  chartButton: {
    marginHorizontal: 10,
    borderRadius: 20,
    overflow: 'hidden',
  },
  gradient: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  chartButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },

  aboutContainer: {
    marginVertical: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  aboutText: {
    fontSize: 14,
    color: '#555',
  },
  infoContainer: {
    marginVertical: 20,
  },
  infoLabel: {
    fontSize: 16,
    color: '#555',
    marginBottom: 5,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  stat: {
    width: '48%',
    backgroundColor: '#f9f9f9',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  statLabel: {
    fontSize: 14,
    color: '#888',
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default StockDetails;
