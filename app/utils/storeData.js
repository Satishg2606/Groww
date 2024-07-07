import AsyncStorage from "@react-native-async-storage/async-storage";


// Function to store data in cache
const storeDataInCache = async (key, data) => {
    try {
      const jsonValue = JSON.stringify(data);
      await AsyncStorage.setItem(key, jsonValue);
    } catch (error) {
      console.error('Error storing in cache:', error);
    }
  };

  // Function to get cached data
const getCachedData = async (key) => {
    try {
      const value = await AsyncStorage.getItem(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Error reading from cache:', error);
      return null;
    }
  };

export {
    storeDataInCache,
    getCachedData
}