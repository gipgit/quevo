"use client";

import React, { useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon, ClockIcon, MapPinIcon } from '@heroicons/react/24/outline';

// Flight data
const flightData: {
  flights_by_destination: {
    [key: string]: FlightOption[];
  };
} = {
  "flights_by_destination": {
    "Sofia (SOF)": [
      {
        "total_price": "€35",
        "notes": "Cheapest combination, midday return.",
        "outbound_flight": {
          "date": "Fri, Nov 7",
          "departure_time": "1:05 PM",
          "arrival_time": "4:10 PM",
          "airline": "Wizz Air",
          "duration": "2 hr 5 min",
          "route": "Milan Bergamo (BGY) → Sofia (SOF)"
        },
        "inbound_flight": {
          "date": "Mon, Nov 10",
          "departure_time": "11:15 AM",
          "arrival_time": "12:30 PM",
          "airline": "Wizz Air",
          "duration": "2 hr 15 min",
          "route": "Sofia (SOF) → Milan Bergamo (BGY)"
        }
      },
      {
        "total_price": "€45",
        "notes": "Later return option in the afternoon.",
        "outbound_flight": {
          "date": "Fri, Nov 7",
          "departure_time": "3:50 PM",
          "arrival_time": "6:50 PM",
          "airline": "Ryanair",
          "duration": "2 hr 0 min",
          "route": "Milan Bergamo (BGY) → Sofia (SOF)"
        },
        "inbound_flight": {
          "date": "Mon, Nov 10",
          "departure_time": "12:50 PM",
          "arrival_time": "1:50 PM",
          "airline": "Ryanair",
          "duration": "2 hr 0 min",
          "route": "Sofia (SOF) → Milan Bergamo (BGY)"
        }
      }
    ],
    "Kraków (KRK)": [
      {
        "total_price": "€49",
        "notes": "Cheapest option, late Friday departure and early Monday return.",
        "outbound_flight": {
          "date": "Fri, Nov 7",
          "departure_time": "10:40 PM",
          "arrival_time": "12:30 AM (Sat)",
          "airline": "Ryanair",
          "duration": "1 hr 50 min",
          "route": "Milan Bergamo (BGY) → Kraków (KRK)"
        },
        "inbound_flight": {
          "date": "Mon, Nov 10",
          "departure_time": "6:00 AM",
          "arrival_time": "7:50 AM",
          "airline": "Ryanair",
          "duration": "1 hr 50 min",
          "route": "Kraków (KRK) → Milan Bergamo (BGY)"
        }
      },
      {
        "total_price": "€53",
        "notes": "Afternoon departure and afternoon Monday arrival.",
        "outbound_flight": {
          "date": "Fri, Nov 7",
          "departure_time": "3:10 PM",
          "arrival_time": "5:00 PM",
          "airline": "Ryanair",
          "duration": "1 hr 50 min",
          "route": "Milan Bergamo (BGY) → Kraków (KRK)"
        },
        "inbound_flight": {
          "date": "Mon, Nov 10",
          "departure_time": "12:20 PM",
          "arrival_time": "2:10 PM",
          "airline": "Ryanair",
          "duration": "1 hr 50 min",
          "route": "Kraków (KRK) → Milan Bergamo (BGY)"
        }
      },
      {
        "total_price": "€56",
        "notes": "Late return for a full day in Kraków.",
        "outbound_flight": {
          "date": "Fri, Nov 7",
          "departure_time": "10:40 PM",
          "arrival_time": "12:30 AM (Sat)",
          "airline": "Ryanair",
          "duration": "1 hr 50 min",
          "route": "Milan Bergamo (BGY) → Kraków (KRK)"
        },
        "inbound_flight": {
          "date": "Mon, Nov 10",
          "departure_time": "8:50 PM",
          "arrival_time": "10:40 PM",
          "airline": "Ryanair",
          "duration": "1 hr 50 min",
          "route": "Kraków (KRK) → Milan Bergamo (BGY)"
        }
      }
    ],
    "Dublin (DUB)": [
      {
        "total_price": "€56",
        "notes": "Cheapest option, evening departure and mid-morning return.",
        "outbound_flight": {
          "date": "Fri, Nov 7",
          "departure_time": "8:35 PM",
          "arrival_time": "10:10 PM",
          "airline": "Ryanair",
          "duration": "2 hr 35 min",
          "route": "Milan Bergamo (BGY) → Dublin (DUB)"
        },
        "inbound_flight": {
          "date": "Mon, Nov 10",
          "departure_time": "7:25 AM",
          "arrival_time": "11:00 AM",
          "airline": "Ryanair",
          "duration": "2 hr 35 min",
          "route": "Dublin (DUB) → Milan Bergamo (BGY)"
        }
      },
      {
        "total_price": "€64",
        "notes": "Evening return for a full Monday in Dublin.",
        "outbound_flight": {
          "date": "Fri, Nov 7",
          "departure_time": "8:35 PM",
          "arrival_time": "10:10 PM",
          "airline": "Ryanair",
          "duration": "2 hr 35 min",
          "route": "Milan Bergamo (BGY) → Dublin (DUB)"
        },
        "inbound_flight": {
          "date": "Mon, Nov 10",
          "departure_time": "6:10 PM",
          "arrival_time": "9:45 PM",
          "airline": "Ryanair",
          "duration": "2 hr 35 min",
          "route": "Dublin (DUB) → Milan Bergamo (BGY)"
        }
      },
      {
        "total_price": "€79",
        "notes": "Midday Friday departure and afternoon Monday arrival.",
        "outbound_flight": {
          "date": "Fri, Nov 7",
          "departure_time": "3:25 PM",
          "arrival_time": "5:00 PM",
          "airline": "Ryanair",
          "duration": "2 hr 35 min",
          "route": "Milan Bergamo (BGY) → Dublin (DUB)"
        },
        "inbound_flight": {
          "date": "Mon, Nov 10",
          "departure_time": "11:40 AM",
          "arrival_time": "3:15 PM",
          "airline": "Ryanair",
          "duration": "2 hr 35 min",
          "route": "Dublin (DUB) → Milan Bergamo (BGY)"
        }
      }
    ],
    "Prague (PRG)": [
      {
        "total_price": "€58",
        "notes": "Cheapest option, late Friday departure and early Monday return.",
        "outbound_flight": {
          "date": "Fri, Nov 7",
          "departure_time": "11:45 PM",
          "arrival_time": "1:15 AM (Sat)",
          "airline": "Ryanair",
          "duration": "1 hr 30 min",
          "route": "Milan Bergamo (BGY) → Prague (PRG)"
        },
        "inbound_flight": {
          "date": "Mon, Nov 10",
          "departure_time": "6:00 AM",
          "arrival_time": "7:30 AM",
          "airline": "Ryanair",
          "duration": "1 hr 30 min",
          "route": "Prague (PRG) → Milan Bergamo (BGY)"
        }
      },
      {
        "total_price": "€73",
        "notes": "Late Friday departure and evening Monday arrival.",
        "outbound_flight": {
          "date": "Fri, Nov 7",
          "departure_time": "11:45 PM",
          "arrival_time": "1:15 AM (Sat)",
          "airline": "Ryanair",
          "duration": "1 hr 30 min",
          "route": "Milan Bergamo (BGY) → Prague (PRG)"
        },
        "inbound_flight": {
          "date": "Mon, Nov 10",
          "departure_time": "6:00 PM",
          "arrival_time": "7:30 PM",
          "airline": "Ryanair",
          "duration": "1 hr 30 min",
          "route": "Prague (PRG) → Milan Bergamo (BGY)"
        }
      },
      {
        "total_price": "€120",
        "notes": "Afternoon Friday departure and evening Monday arrival.",
        "outbound_flight": {
          "date": "Fri, Nov 7",
          "departure_time": "1:45 PM",
          "arrival_time": "3:15 PM",
          "airline": "Ryanair",
          "duration": "1 hr 30 min",
          "route": "Milan Bergamo (BGY) → Prague (PRG)"
        },
        "inbound_flight": {
          "date": "Mon, Nov 10",
          "departure_time": "6:00 PM",
          "arrival_time": "7:30 PM",
          "airline": "Ryanair",
          "duration": "1 hr 30 min",
          "route": "Prague (PRG) → Milan Bergamo (BGY)"
        }
      }
    ],
    "Budapest (BUD)": [
      {
        "total_price": "€99",
        "notes": "Cheapest option, early Monday return.",
        "outbound_flight": {
          "date": "Fri, Nov 7",
          "departure_time": "5:00 PM",
          "arrival_time": "6:35 PM",
          "airline": "Ryanair",
          "duration": "1 hr 35 min",
          "route": "Milan Bergamo (BGY) → Budapest (BUD)"
        },
        "inbound_flight": {
          "date": "Mon, Nov 10",
          "departure_time": "6:05 AM",
          "arrival_time": "7:40 AM",
          "airline": "Ryanair",
          "duration": "1 hr 35 min",
          "route": "Budapest (BUD) → Milan Bergamo (BGY)"
        }
      },
      {
        "total_price": "€114",
        "notes": "Late return for a full day in Budapest, arriving at night.",
        "outbound_flight": {
          "date": "Fri, Nov 7",
          "departure_time": "5:00 PM",
          "arrival_time": "6:35 PM",
          "airline": "Ryanair",
          "duration": "1 hr 35 min",
          "route": "Milan Bergamo (BGY) → Budapest (BUD)"
        },
        "inbound_flight": {
          "date": "Mon, Nov 10",
          "departure_time": "7:55 PM",
          "arrival_time": "9:30 PM",
          "airline": "Ryanair",
          "duration": "1 hr 35 min",
          "route": "Budapest (BUD) → Milan Bergamo (BGY)"
        }
      }
    ],
    "Faro (FAO)": [
      {
        "total_price": "€124",
        "notes": "Only direct flight combination available for this route and dates.",
        "outbound_flight": {
          "date": "Fri, Nov 7",
          "departure_time": "12:35 PM",
          "arrival_time": "2:30 PM",
          "airline": "Ryanair",
          "duration": "2 hr 55 min",
          "route": "Milan Bergamo (BGY) → Faro (FAO)"
        },
        "inbound_flight": {
          "date": "Mon, Nov 10",
          "departure_time": "6:40 AM",
          "arrival_time": "10:35 AM",
          "airline": "Ryanair",
          "duration": "2 hr 55 min",
          "route": "Faro (FAO) → Milan Bergamo (BGY)"
        }
      }
    ],
    "Porto (OPO)": [
      {
        "total_price": "€175",
        "notes": "Only direct flight combination available for this route and dates.",
        "outbound_flight": {
          "date": "Fri, Nov 7",
          "departure_time": "6:35 PM",
          "arrival_time": "8:15 PM",
          "airline": "Ryanair",
          "duration": "2 hr 40 min",
          "route": "Milan Bergamo (BGY) → Porto (OPO)"
        },
        "inbound_flight": {
          "date": "Mon, Nov 10",
          "departure_time": "7:00 AM",
          "arrival_time": "10:40 AM",
          "airline": "Ryanair",
          "duration": "2 hr 40 min",
          "route": "Porto (OPO) → Milan Bergamo (BGY)"
        }
      }
    ]
  }
};

interface Flight {
  date: string;
  departure_time: string;
  arrival_time: string;
  airline: string;
  duration: string;
  route: string;
}

interface FlightOption {
  total_price: string;
  notes: string;
  outbound_flight: Flight;
  inbound_flight: Flight;
}

interface FlightCardProps {
  option: FlightOption;
  index: number;
  isActive: boolean;
}

const FlightCard: React.FC<FlightCardProps> = ({ option, index, isActive }) => {
  return (
    <div className={`bg-white rounded-xl shadow-lg p-6 transition-all duration-300 ${
      isActive ? 'scale-105 shadow-xl' : 'scale-95 opacity-75'
    }`}>
      {/* Price and Notes Header */}
      <div className="text-center mb-6">
        <div className="text-3xl font-bold text-blue-600 mb-2">{option.total_price}</div>
        <div className="text-sm text-gray-600 italic">{option.notes}</div>
      </div>

      {/* Flight Details */}
      <div className="space-y-4">
        {/* Outbound Flight */}
        <div className="border-l-4 border-blue-500 pl-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-gray-800">Departure</h3>
            <span className="text-sm text-gray-500">{option.outbound_flight.date}</span>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-blue-500">✈️</span>
              <span className="font-medium">{option.outbound_flight.departure_time} - {option.outbound_flight.arrival_time}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <ClockIcon className="w-4 h-4" />
              <span>{option.outbound_flight.duration}</span>
              <span className="mx-2">•</span>
              <span>{option.outbound_flight.airline}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <MapPinIcon className="w-4 h-4" />
              <span>{option.outbound_flight.route}</span>
            </div>
          </div>
        </div>

        {/* Inbound Flight */}
        <div className="border-l-4 border-green-500 pl-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-gray-800">Return</h3>
            <span className="text-sm text-gray-500">{option.inbound_flight.date}</span>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-green-500">✈️</span>
              <span className="font-medium">{option.inbound_flight.departure_time} - {option.inbound_flight.arrival_time}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <ClockIcon className="w-4 h-4" />
              <span>{option.inbound_flight.duration}</span>
              <span className="mx-2">•</span>
              <span>{option.inbound_flight.airline}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <MapPinIcon className="w-4 h-4" />
              <span>{option.inbound_flight.route}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

function ViajesitoPage() {
  const destinations = Object.keys(flightData.flights_by_destination);
  const [currentDestination, setCurrentDestination] = useState(0);
  const [currentFlight, setCurrentFlight] = useState(0);

  const currentDest = destinations[currentDestination];
  const currentFlights = flightData.flights_by_destination[currentDest];

  const nextDestination = () => {
    setCurrentDestination((prev) => (prev + 1) % destinations.length);
    setCurrentFlight(0);
  };

  const prevDestination = () => {
    setCurrentDestination((prev) => (prev - 1 + destinations.length) % destinations.length);
    setCurrentFlight(0);
  };

  const nextFlight = () => {
    setCurrentFlight((prev) => (prev + 1) % currentFlights.length);
  };

  const prevFlight = () => {
    setCurrentFlight((prev) => (prev - 1 + currentFlights.length) % currentFlights.length);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">✈️ Viajesito</h1>
          <p className="text-lg text-gray-600">Discover amazing travel deals from Milan</p>
        </div>

        {/* Destination Navigation */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <button
            onClick={prevDestination}
            className="p-2 rounded-full bg-white shadow-md hover:shadow-lg transition-shadow"
          >
            <ChevronLeftIcon className="w-6 h-6 text-gray-600" />
          </button>
          
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800">{currentDest}</h2>
            <p className="text-sm text-gray-500">{currentFlights.length} flight option{currentFlights.length !== 1 ? 's' : ''}</p>
          </div>
          
          <button
            onClick={nextDestination}
            className="p-2 rounded-full bg-white shadow-md hover:shadow-lg transition-shadow"
          >
            <ChevronRightIcon className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Flight Cards Carousel */}
        <div className="relative">
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={prevFlight}
              className="p-3 rounded-full bg-white shadow-md hover:shadow-lg transition-shadow"
              disabled={currentFlights.length <= 1}
            >
              <ChevronLeftIcon className="w-5 h-5 text-gray-600" />
            </button>

            <div className="flex-1 max-w-lg">
              <FlightCard 
                option={currentFlights[currentFlight]} 
                index={currentFlight}
                isActive={true}
              />
            </div>

            <button
              onClick={nextFlight}
              className="p-3 rounded-full bg-white shadow-md hover:shadow-lg transition-shadow"
              disabled={currentFlights.length <= 1}
            >
              <ChevronRightIcon className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Flight Indicators */}
          {currentFlights.length > 1 && (
            <div className="flex justify-center gap-2 mt-4">
              {currentFlights.map((_: FlightOption, index: number) => (
                <button
                  key={index}
                  onClick={() => setCurrentFlight(index)}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    index === currentFlight ? 'bg-blue-500' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Destination Indicators */}
        <div className="flex justify-center gap-2 mt-8">
          {destinations.map((dest, index) => (
            <button
              key={index}
              onClick={() => {
                setCurrentDestination(index);
                setCurrentFlight(0);
              }}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                index === currentDestination 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              {dest.split(' ')[0]}
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>Prices and schedules subject to change. Book directly with airlines for most up-to-date information.</p>
        </div>
      </div>
    </div>
  );
}

export default ViajesitoPage;
