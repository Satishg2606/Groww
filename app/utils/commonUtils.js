export const formatNumber = (num) => {
    return num ? parseFloat(num).toFixed(2) : 'N/A';
};

export const processTimeSeriesData = (data, intraDayData) => {
  const dates = Object.keys(data).reverse(); // Dates in ascending order
  const intraDayDates = Object.keys(intraDayData).reverse();

  const currentDay = intraDayDates;
  const lastMonth = dates.slice(-30);
  const last3Months = dates.filter((_, index) => index % 1 === 0).slice(-90); // Every 15 days
  const last6Months = dates.filter((_, index) => index % 1 === 0).slice(-180); // Every 15 days
  const lastYear = dates.filter((_, index) => index % 2 === 0).slice(-365); // Every month

  return {
    currentDay,
    lastMonth,
    last3Months,
    last6Months,
    lastYear,
  };
};  

