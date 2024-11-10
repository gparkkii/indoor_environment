'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type WeatherDataContextType = {
    cachedWeatherData: Record<string, any>;
    setCachedWeatherData: (key: string, data: any) => void;
    resetCachedWeatherData: () => void;
};

const WeatherDataContext = createContext<WeatherDataContextType | undefined>(
    undefined
);

export const WeatherDataProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [cachedWeatherData, setCache] = useState<Record<string, any>>({});

    const setCachedWeatherData = (key: string, data: any) => {
        setCache((prev) => ({ ...prev, [key]: data }));
    };

    const resetCachedWeatherData = () => {
        setCache({});
    };

    useEffect(() => {
        console.log(cachedWeatherData);
    }, [cachedWeatherData]);

    return (
        <WeatherDataContext.Provider
            value={{
                cachedWeatherData,
                resetCachedWeatherData,
                setCachedWeatherData,
            }}
        >
            {children}
        </WeatherDataContext.Provider>
    );
};

export const useWeatherData = () => {
    const context = useContext(WeatherDataContext);
    if (!context) {
        throw new Error(
            'useWeatherData must be used within a WeatherDataProvider'
        );
    }
    return context;
};
