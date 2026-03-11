import React, { createContext, useContext } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchTestingCenters, type TestingCenter } from '../api/instructor-api';

interface MasterDataContextType {
    testingCenters: TestingCenter[];
    loading: boolean;
    error: any;
    refreshData: () => Promise<any>;
}

const MasterDataContext = createContext<MasterDataContextType | undefined>(undefined);

export const MasterDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { data: testingCenters = [], isLoading: loading, error, refetch: refreshData } = useQuery({
        queryKey: ['testingCenters'],
        queryFn: fetchTestingCenters,
    });

    return (
        <MasterDataContext.Provider value={{ testingCenters, loading, error, refreshData }}>
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
