export type ShippingRate = {
  state: string;
  priceNgn: number;
};

export const SHIPPING_RATES: ShippingRate[] = [
  { state: "Abia", priceNgn: 4500 },
  { state: "Adamawa", priceNgn: 6500 },
  { state: "Akwa Ibom", priceNgn: 5200 },
  { state: "Anambra", priceNgn: 4600 },
  { state: "Bauchi", priceNgn: 6500 },
  { state: "Bayelsa", priceNgn: 5200 },
  { state: "Benue", priceNgn: 5800 },
  { state: "Borno", priceNgn: 7200 },
  { state: "Cross River", priceNgn: 5600 },
  { state: "Delta", priceNgn: 4800 },
  { state: "Ebonyi", priceNgn: 5200 },
  { state: "Edo", priceNgn: 4500 },
  { state: "Ekiti", priceNgn: 4300 },
  { state: "Enugu", priceNgn: 4800 },
  { state: "Gombe", priceNgn: 6500 },
  { state: "Imo", priceNgn: 4800 },
  { state: "Jigawa", priceNgn: 6900 },
  { state: "Kaduna", priceNgn: 6200 },
  { state: "Kano", priceNgn: 6700 },
  { state: "Katsina", priceNgn: 6900 },
  { state: "Kebbi", priceNgn: 7200 },
  { state: "Kogi", priceNgn: 5200 },
  { state: "Kwara", priceNgn: 4800 },
  { state: "Lagos", priceNgn: 2500 },
  { state: "Nasarawa", priceNgn: 5200 },
  { state: "Niger", priceNgn: 6200 },
  { state: "Ogun", priceNgn: 3000 },
  { state: "Ondo", priceNgn: 4200 },
  { state: "Osun", priceNgn: 4200 },
  { state: "Oyo", priceNgn: 4000 },
  { state: "Plateau", priceNgn: 6200 },
  { state: "Rivers", priceNgn: 5200 },
  { state: "Sokoto", priceNgn: 7200 },
  { state: "Taraba", priceNgn: 7000 },
  { state: "Yobe", priceNgn: 7200 },
  { state: "Zamfara", priceNgn: 7200 },

  // Federal Capital Territory
  { state: "FCT (Abuja)", priceNgn: 3500 }
];

export const DEFAULT_SHIPPING_NGN = 5000;

export function listShippingStates(): string[] {
  return SHIPPING_RATES.map((r) => r.state);
}

export function shippingPriceForState(state: string | null | undefined): number {
  if (!state) return DEFAULT_SHIPPING_NGN;
  const found = SHIPPING_RATES.find(
    (r) => r.state.toLowerCase() === state.toLowerCase()
  );
  return found ? found.priceNgn : DEFAULT_SHIPPING_NGN;
}