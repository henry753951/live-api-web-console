import { useEffect, useState, memo } from "react";
import { useLiveAPIContext } from "../../../contexts/LiveAPIContext";
import { FunctionDeclaration, LiveServerToolCall, Type } from "@google/genai";

export interface WeatherData {
  weather_code: "sunny" | "cloudy" | "rainy" | "snowy";
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
    const onToolCall = (toolCall: LiveServerToolCall) => {
      if (!toolCall.functionCalls) {
        return;
      }
      const fc = toolCall.functionCalls.find(
        (fc) => fc.name === declaration.name
      );
      if (fc) {
        const position = (fc.args as any).position;
        const cordsApiUrl = `xxx`;
        const [latitude, longitude] = [0, 0];
        const weatherApiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m`;
        const data: WeatherData = {
          weather_code: "sunny",
          temperature: 25,
          humidity: 60,
          position: {
            latitude,
            longitude,
            name: position,
          },
        };
        setWeatherData(data);

        client.sendToolResponse({
          functionResponses: [
            {
              response: { output: data },
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
          <p>Location: {weatherData.position.name}</p>
          <p>Temperature: {weatherData.temperature}°C</p>
          <p>Condition: {weatherData.weather_code}</p>
          <p>Humidity: {weatherData.humidity}%</p>
        </div>
      ) : (
        <></>
      )}
    </>
  );
}

export const Weather = memo(WeatherComponent);
