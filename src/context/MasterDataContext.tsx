import React, { createContext, useContext, useEffect, useState } from 'react';
import { fetchTestingCenters, type TestingCenter } from '../api/client';

interface MasterDataContextType {
    testingCenters: TestingCenter[];
    loading: boolean;
    error: any;
    refreshData: () => Promise<void>;
}

const MasterDataContext = createContext<MasterDataContextType | undefined>(undefined);

export const MasterDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [testingCenters, setTestingCenters] = useState<TestingCenter[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<any>(null);

    const loadData = async () => {
        setLoading(true);
        try {
            const [centersData] = await Promise.all([fetchTestingCenters()]);
            setTestingCenters(centersData);
            setError(null);
        } catch (err) {
            console.error("Failed to load master data", err);
            setError(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    return (
        <MasterDataContext.Provider value={{ testingCenters, loading, error, refreshData: loadData }}>
            {children}
        </MasterDataContext.Provider>
    );
};

export const useMasterData = () => {
    const context = useContext(MasterDataContext);
    if (context === undefined) {
        throw new Error('useMasterData must be used within a MasterDataProvider');
    }
    return context;
};
