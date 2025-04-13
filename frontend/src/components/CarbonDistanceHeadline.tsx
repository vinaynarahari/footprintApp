import React, { useState, useEffect } from 'react';

interface Transaction {
  date: string;
  amount: number;
  emissions?: {
    emissionFactor: {
      factor: number;
    } | null;
  } | null;
}

interface CarbonDistanceHeadlineProps {
  transactions: Transaction[];
}

// Carbon emission constants
const AVERAGE_CAR_EMISSIONS_PER_KM = 0.192; // kg CO2 per km for average car
const AVERAGE_TREE_ABSORPTION_PER_YEAR = 21.77; // kg CO2 per tree per year
const AVERAGE_SMARTPHONE_CHARGE = 0.0001; // kg CO2 per charge
const AVERAGE_HAMBURGER = 2.5; // kg CO2 per hamburger
const AVERAGE_LAUNDRY_LOAD = 0.5; // kg CO2 per load
const AVERAGE_EMAIL = 0.000004; // kg CO2 per email
const AVERAGE_STREAMING_HOUR = 0.00036; // kg CO2 per hour of streaming
const AVERAGE_LIGHTBULB_DAY = 0.0005; // kg CO2 per day for LED bulb
const AVERAGE_BALLOON = 0.014; // kg CO2 per helium balloon
const AVERAGE_BOOK = 2.5; // kg CO2 per book
const AVERAGE_BEER = 0.3; // kg CO2 per beer
const AVERAGE_PIZZA = 1.2; // kg CO2 per pizza
const AVERAGE_AVOCADO = 0.2; // kg CO2 per avocado
const AVERAGE_BANANA = 0.08; // kg CO2 per banana
const AVERAGE_COFFEE = 0.21; // kg CO2 per cup
const AVERAGE_T_SHIRT = 2.1; // kg CO2 per t-shirt
const AVERAGE_SMARTWATCH = 0.00005; // kg CO2 per hour of smartwatch use
const AVERAGE_GOOGLE_SEARCH = 0.0002; // kg CO2 per search
const AVERAGE_NETFLIX_HOUR = 0.0004; // kg CO2 per hour of Netflix
const AVERAGE_INSTAGRAM_POST = 0.00015; // kg CO2 per post
const AVERAGE_TIKTOK_VIDEO = 0.0003; // kg CO2 per minute
const AVERAGE_ZOOM_HOUR = 0.0009; // kg CO2 per hour of Zoom
const AVERAGE_SPOTIFY_HOUR = 0.00025; // kg CO2 per hour of Spotify
const AVERAGE_UBER_RIDE = 0.3; // kg CO2 per km
const AVERAGE_DOORDASH = 0.4; // kg CO2 per delivery
const AVERAGE_AMAZON_PACKAGE = 0.5; // kg CO2 per package
const AVERAGE_CRYPTO_TRANSACTION = 0.0001; // kg CO2 per transaction
const AVERAGE_AI_QUERY = 0.0002; // kg CO2 per AI query
const AVERAGE_CLOUD_STORAGE = 0.0001; // kg CO2 per GB per month
const AVERAGE_SOLAR_PANEL = 0.1; // kg CO2 offset per panel per day
const AVERAGE_WIND_TURBINE = 0.5; // kg CO2 offset per turbine per day
const AVERAGE_ELECTRIC_CAR = 0.05; // kg CO2 per km
const AVERAGE_PUBLIC_TRANSIT = 0.1; // kg CO2 per km
const AVERAGE_BIKE_RIDE = 0.001; // kg CO2 per km
const AVERAGE_WALK = 0.0001; // kg CO2 per km

const COMPARISONS = [
  {
    type: 'trees',
    calculate: (emissions: number) => emissions / AVERAGE_TREE_ABSORPTION_PER_YEAR,
    format: (value: number) => `That's equivalent to the carbon absorbed by ${Math.round(value)} trees in a year! 🌳`
  },
  {
    type: 'smartphones',
    calculate: (emissions: number) => emissions / AVERAGE_SMARTPHONE_CHARGE,
    format: (value: number) => `That's like charging your smartphone ${Math.round(value).toLocaleString()} times! 📱`
  },
  {
    type: 'hamburgers',
    calculate: (emissions: number) => emissions / AVERAGE_HAMBURGER,
    format: (value: number) => `That's the carbon footprint of eating ${Math.round(value)} hamburgers! 🍔`
  },
  {
    type: 'laundry',
    calculate: (emissions: number) => emissions / AVERAGE_LAUNDRY_LOAD,
    format: (value: number) => `That's like running ${Math.round(value)} loads of laundry! 👕`
  },
  {
    type: 'emails',
    calculate: (emissions: number) => emissions / AVERAGE_EMAIL,
    format: (value: number) => `That's the carbon footprint of sending ${Math.round(value).toLocaleString()} emails! 📧`
  },
  {
    type: 'streaming',
    calculate: (emissions: number) => emissions / AVERAGE_STREAMING_HOUR,
    format: (value: number) => `That's like streaming ${Math.round(value).toLocaleString()} hours of video! 📺`
  },
  {
    type: 'lightbulbs',
    calculate: (emissions: number) => emissions / AVERAGE_LIGHTBULB_DAY,
    format: (value: number) => `That's like running an LED lightbulb for ${Math.round(value).toLocaleString()} days! 💡`
  },
  {
    type: 'balloons',
    calculate: (emissions: number) => emissions / AVERAGE_BALLOON,
    format: (value: number) => `That's like releasing ${Math.round(value).toLocaleString()} helium balloons into the atmosphere! 🎈`
  },
  {
    type: 'books',
    calculate: (emissions: number) => emissions / AVERAGE_BOOK,
    format: (value: number) => `That's the carbon footprint of printing ${Math.round(value)} books! 📚`
  },
  {
    type: 'beers',
    calculate: (emissions: number) => emissions / AVERAGE_BEER,
    format: (value: number) => `That's like drinking ${Math.round(value)} beers! 🍺`
  },
  {
    type: 'pizzas',
    calculate: (emissions: number) => emissions / AVERAGE_PIZZA,
    format: (value: number) => `That's the carbon footprint of eating ${Math.round(value)} pizzas! 🍕`
  },
  {
    type: 'avocados',
    calculate: (emissions: number) => emissions / AVERAGE_AVOCADO,
    format: (value: number) => `That's like eating ${Math.round(value)} avocados! 🥑`
  },
  {
    type: 'bananas',
    calculate: (emissions: number) => emissions / AVERAGE_BANANA,
    format: (value: number) => `That's the carbon footprint of eating ${Math.round(value)} bananas! 🍌`
  },
  {
    type: 'coffees',
    calculate: (emissions: number) => emissions / AVERAGE_COFFEE,
    format: (value: number) => `That's like drinking ${Math.round(value)} cups of coffee! ☕`
  },
  {
    type: 'tshirts',
    calculate: (emissions: number) => emissions / AVERAGE_T_SHIRT,
    format: (value: number) => `That's the carbon footprint of producing ${Math.round(value)} t-shirts! 👕`
  },
  {
    type: 'smartwatch',
    calculate: (emissions: number) => emissions / AVERAGE_SMARTWATCH,
    format: (value: number) => `That's like using a smartwatch for ${Math.round(value).toLocaleString()} hours! ⌚`
  },
  {
    type: 'google',
    calculate: (emissions: number) => emissions / AVERAGE_GOOGLE_SEARCH,
    format: (value: number) => `That's like performing ${Math.round(value).toLocaleString()} Google searches! 🔍`
  },
  {
    type: 'netflix',
    calculate: (emissions: number) => emissions / AVERAGE_NETFLIX_HOUR,
    format: (value: number) => `That's like watching Netflix for ${Math.round(value).toLocaleString()} hours! 🎬`
  },
  {
    type: 'instagram',
    calculate: (emissions: number) => emissions / AVERAGE_INSTAGRAM_POST,
    format: (value: number) => `That's the carbon footprint of posting ${Math.round(value).toLocaleString()} Instagram photos! 📸`
  },
  {
    type: 'tiktok',
    calculate: (emissions: number) => emissions / AVERAGE_TIKTOK_VIDEO,
    format: (value: number) => `That's like watching ${Math.round(value).toLocaleString()} minutes of TikTok videos! 🎵`
  },
  {
    type: 'zoom',
    calculate: (emissions: number) => emissions / AVERAGE_ZOOM_HOUR,
    format: (value: number) => `That's like being on Zoom calls for ${Math.round(value).toLocaleString()} hours! 💻`
  },
  {
    type: 'spotify',
    calculate: (emissions: number) => emissions / AVERAGE_SPOTIFY_HOUR,
    format: (value: number) => `That's like streaming Spotify for ${Math.round(value).toLocaleString()} hours! 🎵`
  },
  {
    type: 'uber',
    calculate: (emissions: number) => emissions / AVERAGE_UBER_RIDE,
    format: (value: number) => `That's like taking an Uber for ${Math.round(value)} kilometers! 🚗`
  },
  {
    type: 'doordash',
    calculate: (emissions: number) => emissions / AVERAGE_DOORDASH,
    format: (value: number) => `That's the carbon footprint of ${Math.round(value)} DoorDash deliveries! 🍽️`
  },
  {
    type: 'amazon',
    calculate: (emissions: number) => emissions / AVERAGE_AMAZON_PACKAGE,
    format: (value: number) => `That's like receiving ${Math.round(value)} Amazon packages! 📦`
  },
  {
    type: 'crypto',
    calculate: (emissions: number) => emissions / AVERAGE_CRYPTO_TRANSACTION,
    format: (value: number) => `That's like performing ${Math.round(value).toLocaleString()} cryptocurrency transactions! 💰`
  },
  {
    type: 'ai',
    calculate: (emissions: number) => emissions / AVERAGE_AI_QUERY,
    format: (value: number) => `That's like making ${Math.round(value).toLocaleString()} AI queries! 🤖`
  },
  {
    type: 'cloud',
    calculate: (emissions: number) => emissions / AVERAGE_CLOUD_STORAGE,
    format: (value: number) => `That's like storing ${Math.round(value).toLocaleString()} GB in the cloud for a month! ☁️`
  },
  {
    type: 'solar',
    calculate: (emissions: number) => emissions / AVERAGE_SOLAR_PANEL,
    format: (value: number) => `That's like the daily carbon offset of ${Math.round(value)} solar panels! ☀️`
  },
  {
    type: 'wind',
    calculate: (emissions: number) => emissions / AVERAGE_WIND_TURBINE,
    format: (value: number) => `That's like the daily carbon offset of ${Math.round(value)} wind turbines! 🌬️`
  },
  {
    type: 'electric',
    calculate: (emissions: number) => emissions / AVERAGE_ELECTRIC_CAR,
    format: (value: number) => `That's like driving an electric car for ${Math.round(value)} kilometers! 🚗`
  },
  {
    type: 'transit',
    calculate: (emissions: number) => emissions / AVERAGE_PUBLIC_TRANSIT,
    format: (value: number) => `That's like taking public transit for ${Math.round(value)} kilometers! 🚌`
  },
  {
    type: 'bike',
    calculate: (emissions: number) => emissions / AVERAGE_BIKE_RIDE,
    format: (value: number) => `That's like biking for ${Math.round(value)} kilometers! 🚲`
  },
  {
    type: 'walk',
    calculate: (emissions: number) => emissions / AVERAGE_WALK,
    format: (value: number) => `That's like walking for ${Math.round(value)} kilometers! 🚶`
  }
];

export default function CarbonDistanceHeadline({ transactions }: CarbonDistanceHeadlineProps) {
  const [headline, setHeadline] = useState<string>('');

  useEffect(() => {
    calculateHeadline();
  }, [transactions]);

  const getRandomComparison = (emissions: number) => {
    const randomIndex = Math.floor(Math.random() * COMPARISONS.length);
    const comparison = COMPARISONS[randomIndex];
    const value = comparison.calculate(emissions);
    return comparison.format(value);
  };

  const calculateHeadline = () => {
    // Get current month's emissions
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const monthlyEmissions = transactions.reduce((total, tx) => {
      const txDate = new Date(tx.date);
      if (
        txDate.getMonth() === currentMonth &&
        txDate.getFullYear() === currentYear &&
        tx.emissions?.emissionFactor
      ) {
        return total + (Math.abs(tx.amount) * tx.emissions.emissionFactor.factor);
      }
      return total;
    }, 0);

    // Get a random comparison
    const comparison = getRandomComparison(monthlyEmissions);

    // Generate the headline
    const headline = `Your monthly carbon footprint: ${monthlyEmissions.toFixed(1)} kg CO₂\n${comparison}`;
    setHeadline(headline);
  };

  if (!headline) return null;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-center space-x-4">
        <div className="flex-1">
          <h2 className="text-xl font-bold mb-2">Your Carbon Impact</h2>
          <p className="text-lg text-gray-700 whitespace-pre-line">{headline}</p>
        </div>
      </div>
    </div>
  );
} 