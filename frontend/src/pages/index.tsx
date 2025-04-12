import { NextPage } from 'next';
import RootLayout from '../components/layout/RootLayout';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Leaf, DollarSign, TrendingUp, TrendingDown, BarChart3, Lightbulb, Trees, Target, AlertCircle } from 'lucide-react';

const scrollToSection = (elementId: string) => {
  const element = document.getElementById(elementId);
  if (element) {
    element.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  }
};

const features = [
  {
    name: 'Track Spending Impact',
    description: 'See how your purchases affect your carbon footprint in real-time.',
    icon: DollarSign,
  },
  {
    name: 'Environmental Insights',
    description: 'Get personalized recommendations to reduce your carbon footprint.',
    icon: Leaf,
  },
  {
    name: 'Progress Tracking',
    description: 'Monitor your improvement over time with detailed analytics.',
    icon: TrendingUp,
  },
  {
    name: 'Track Your Carbon Footprint',
    description: 'See how your spending habits impact the environment in real-time. Our platform automatically calculates the carbon footprint of your purchases based on scientific data.',
    icon: Leaf,
  },
  {
    name: 'Personalized Insights',
    description: 'Get a clear picture of your environmental impact with easy-to-understand comparisons. See how your carbon footprint compares to national averages and visualize your progress over time.',
    icon: BarChart3,
  },
  {
    name: 'Eco-Friendly Recommendations',
    description: 'Receive personalized suggestions for more sustainable alternatives to high-carbon purchases, helping you make environmentally conscious decisions without compromising on quality.',
    icon: Lightbulb,
  },
  {
    name: 'Track Your Progress',
    description: 'Monitor your improvement over time with detailed analytics. Celebrate milestones as you reduce your carbon footprint and see the positive impact you\'re making on the planet.',
    icon: TrendingDown,
  },
  {
    name: 'Environmental Impact',
    description: 'Understand your impact in relatable terms. See how many trees you\'ve saved or how your monthly emissions compare to driving a car across the country.',
    icon: Trees,
  },
  {
    name: 'Carbon Budgeting',
    description: 'Set personal carbon budgets and receive alerts when you\'re approaching your limits. Take control of your environmental impact with goal-setting and tracking tools.',
    icon: Target,
  },
  {
    name: 'High-Impact Alerts',
    description: 'Get notified about repeated high-carbon purchases and discover more sustainable alternatives. Make informed decisions about your spending habits.',
    icon: AlertCircle,
  },
];

const Home: NextPage = () => {
  return (
    <RootLayout>
      <div className="relative min-h-screen bg-gradient-to-b from-white to-gray-50 overflow-x-hidden">
        <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-5"></div>
        
        {/* Hero Section */}
        <div className="relative isolate bg-white">
          <div className="mx-auto max-w-7xl px-6 py-12 sm:py-16 lg:flex lg:items-start lg:gap-x-10 lg:px-8 lg:py-24">
            <div className="mx-auto max-w-2xl lg:mx-0 lg:flex-auto lg:max-w-2xl">
              <h1 className="max-w-2xl text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
                Track Your Carbon Footprint Through Your Spending
              </h1>
              <p className="mt-6 text-lg leading-8 text-gray-600 max-w-xl">
                Make a positive impact on the environment by understanding and reducing your carbon footprint. 
                Connect your bank account to automatically track and analyze your spending's environmental impact.
              </p>
              <div className="mt-10 flex items-center gap-x-6">
                <Link
                  href="/register"
                  className="rounded-md bg-black px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-gray-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
                >
                  Get started
                </Link>
                <button 
                  onClick={() => scrollToSection('how-it-works')}
                  className="text-sm font-semibold leading-6 text-gray-900 group"
                >
                  Learn more 
                  <ArrowRight className="inline-block ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            </div>
            <div className="mt-16 sm:mt-24 lg:mt-0 lg:flex-shrink-0 lg:flex-grow">
              <div className="relative -right-64 w-[750px] overflow-hidden rounded-2xl shadow-2xl ring-1 ring-gray-900/10">
                <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 via-purple-500/20 to-pink-500/20 animate-gradient-xy"></div>
                <div className="relative w-full" style={{ height: 'calc(750px * 0.625)' }}>
                  <img
                    src="https://placehold.co/1600x1000/1a1a1a/ffffff?text=Dashboard+Preview"
                    alt="Footprint App Dashboard"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-gray-900/10"></div>
              </div>
            </div>
          </div>
        </div>

        {/* How It Works Section */}
        <div id="how-it-works" className="py-24 sm:py-32 bg-gray-50">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl lg:text-center">
              <h2 className="text-base font-semibold leading-7 text-black">How It Works</h2>
              <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Track, Understand, and Reduce Your Carbon Footprint
              </p>
              <p className="mt-6 text-lg leading-8 text-gray-600">
                Footprint connects your spending data to scientific carbon emission factors, 
                giving you a clear picture of your environmental impact and helping you make 
                more sustainable choices.
              </p>
            </div>
            <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
              <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
                {features.map((feature) => (
                  <div key={feature.name} className="flex flex-col">
                    <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                      <feature.icon className="h-5 w-5 flex-none text-black" aria-hidden="true" />
                      {feature.name}
                    </dt>
                    <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                      <p className="flex-auto">{feature.description}</p>
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>

        {/* Data Sources Section */}
        <div className="py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl lg:text-center">
              <h2 className="text-base font-semibold leading-7 text-black">Scientific Foundation</h2>
              <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Built on Reliable Data
              </p>
              <p className="mt-6 text-lg leading-8 text-gray-600">
                Our carbon footprint calculations are based on scientific research and data from 
                trusted sources, ensuring accurate and meaningful insights about your environmental impact.
              </p>
            </div>
            <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
              <div className="grid grid-cols-1 gap-x-8 gap-y-10 lg:grid-cols-2">
                <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-200">
                  <h3 className="text-lg font-semibold leading-8 text-gray-900">EPA Supply Chain Data</h3>
                  <p className="mt-4 text-base leading-7 text-gray-600">
                    We use the Environmental Protection Agency's comprehensive database of greenhouse gas 
                    emission factors to calculate the carbon footprint of your purchases. This data covers 
                    thousands of products and services across different industries.
                  </p>
                </div>
                <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-200">
                  <h3 className="text-lg font-semibold leading-8 text-gray-900">Academic Research</h3>
                  <p className="mt-4 text-base leading-7 text-gray-600">
                    Our methodology incorporates findings from leading environmental research institutions, 
                    including studies on consumer behavior, carbon emissions, and sustainable alternatives.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-black relative z-10">
          <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
            <div>
              <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                <span className="block">Ready to dive in?</span>
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 animate-gradient-xy">Start your journey today.</span>
              </h2>
              <p className="mt-4 text-lg leading-6 text-gray-300">
                Join thousands of users who are already managing their finances smarter.
              </p>
            </div>
            <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
              <Link
                href="/register"
                className="relative inline-flex items-center justify-center px-6 py-3 text-base font-medium text-white border border-white rounded-md hover:bg-white/10 transition-all duration-200 group"
              >
                Get started
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </RootLayout>
  );
};

export default Home; 