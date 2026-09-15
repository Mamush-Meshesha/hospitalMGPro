import { AnalyticsDAL } from './src/dal/analytics.dal';

async function test() {
  try {
    console.log("Lab:", await AnalyticsDAL.getLabAnalytics());
    console.log("Pharmacy:", await AnalyticsDAL.getPharmacyAnalytics());
    console.log("Storekeeper:", await AnalyticsDAL.getStorekeeperAnalytics());
    console.log("Procurement:", await AnalyticsDAL.getProcurementAnalytics());
    console.log("Clinical:", await AnalyticsDAL.getClinicalAnalytics());
    console.log("FrontDesk:", await AnalyticsDAL.getFrontDeskAnalytics());
    console.log("Success all!");
  } catch (error) {
    console.error("Error:", error);
  }
}

test();
