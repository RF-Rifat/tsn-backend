export type PricingFeature = {
  name: string;
  key: string;
  value: number | boolean;
};

export type PricingPlan = {
  planName: string;
  price: number;
  features: PricingFeature[];
  isPopular?: boolean;
};
