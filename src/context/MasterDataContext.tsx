import React, { createContext, useContext, useEffect, useState } from 'react';
import { fetchSuburbs, fetchTestingCenters, type Suburb, type TestingCenter } from '../api/client';

interface MasterDataContextType {
    suburbs: Suburb[];
    testingCenters: TestingCenter[];
    loading: boolean;
    error: any;
    refreshData: () => Promise<void>;
}

const MasterDataContext = createContext<MasterDataContextType | undefined>(undefined);

export const MasterDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [suburbs, setSuburbs] = useState<Suburb[]>([]);
    const [testingCenters, setTestingCenters] = useState<TestingCenter[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<any>(null);

    const loadData = async () => {
        setLoading(true);
        try {
            const [suburbsData, centersData] = await Promise.all([
                fetchSuburbs(),
                fetchTestingCenters()
            ]);
            setSuburbs(suburbsData);
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
        <MasterDataContext.Provider value={{ suburbs, testingCenters, loading, error, refreshData: loadData }}>
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
