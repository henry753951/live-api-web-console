import { useEffect, useState, memo } from "react";
import { useLiveAPIContext } from "../../../contexts/LiveAPIContext";
import { FunctionDeclaration, LiveServerToolCall, Type } from "@google/genai";

const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
if (!GOOGLE_MAPS_API_KEY) {
  throw new Error("set REACT_APP_GOOGLE_MAPS_API_KEY in .env");
}

export interface WeatherData {
  text: string;
  temperature: number;
  humidity: number;
  position: {
    latitude: number;
    longitude: number;
    name: string;
  };
}

export const declaration: FunctionDeclaration = {
  name: "search_weather",
  description: "Displays weather information.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      position: {
        type: Type.STRING,
        description:
          "The position to search for weather information, e.g., 'New York'.",
      },
    },
    required: ["position"],
  },
};

function WeatherComponent() {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const { client } = useLiveAPIContext();

  useEffect(() => {
    const onToolCall = async (toolCall: LiveServerToolCall) => {
      if (!toolCall.functionCalls) {
        return;
      }
      const fc = toolCall.functionCalls.find(
        (fc) => fc.name === declaration.name
      );
      if (fc) {
        const position = (fc.args as any).position;
        const cordsApiUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
          position
        )}&key=${GOOGLE_MAPS_API_KEY}`;
        const cordsData = await fetch(cordsApiUrl).then((res) => res.json());
        if (!cordsData || cordsData.status !== "OK") {
          console.error("Failed to fetch coordinates:", cordsData);
          client.sendToolResponse({
            functionResponses: [
              {
                response: {
                  success: false,
                  error: "Failed to fetch coordinates.",
                },
                id: fc.id,
                name: fc.name,
              },
            ],
          });
          return;
        }
        const location = cordsData.results[0].geometry.location;
        const [latitude, longitude] = [location.lat, location.lng];

        const weatherApiUrl = `https://weather.googleapis.com/v1/currentConditions:lookup?key=${GOOGLE_MAPS_API_KEY}&location.latitude=${latitude}&location.longitude=${longitude}`;
        const weatherDataResponse = await fetch(weatherApiUrl).then((res) =>
          res.json()
        );
        if (!weatherDataResponse || !weatherDataResponse) {
          console.error("Failed to fetch weather data:", weatherDataResponse);
          client.sendToolResponse({
            functionResponses: [
              {
                response: {
                  success: false,
                  error: "Failed to fetch weather data.",
                },
                id: fc.id,
                name: fc.name,
              },
            ],
          });
          return;
        }
        const data: WeatherData = {
          text: weatherDataResponse.weatherCondition.description.text,
          temperature: weatherDataResponse.temperature.degrees,
          humidity: weatherDataResponse.relativeHumidity,
          position: {
            latitude: latitude,
            longitude: longitude,
            name: position,
          },
        };
        setWeatherData(data);

        client.sendToolResponse({
          functionResponses: [
            {
              response: { output: weatherDataResponse },
              id: fc.id,
              name: fc.name,
            },
          ],
        });
      }
    };
    client.on("toolcall", onToolCall);
    return () => {
      client.off("toolcall", onToolCall);
    };
  }, [client]);

  useEffect(() => {
    if (weatherData) {
      console.log("weatherData", weatherData);
    }
  }, [weatherData]);
  return (
    <>
      {weatherData ? (
        <div>
          <h3>Weather Information</h3>
          <p>{weatherData.text}</p>
          <p>Location: {weatherData.position.name}</p>
          <p>Temperature: {weatherData.temperature}°C</p>
          <p>Humidity: {weatherData.humidity}%</p>
        </div>
      ) : (
        <></>
      )}
    </>
  );
}

export const Weather = memo(WeatherComponent);
