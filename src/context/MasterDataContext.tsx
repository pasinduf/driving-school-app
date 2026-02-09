import React, { createContext, useContext, useEffect, useState } from 'react';
import { fetchSuburbs, type Suburb } from '../api/client';

interface MasterDataContextType {
    suburbs: Suburb[];
    loading: boolean;
    error: any;
    refreshSuburbs: () => Promise<void>;
}

const MasterDataContext = createContext<MasterDataContextType | undefined>(undefined);

export const MasterDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [suburbs, setSuburbs] = useState<Suburb[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<any>(null);

    const loadSuburbs = async () => {
        setLoading(true);
        try {
            const data = await fetchSuburbs();
            setSuburbs(data);
            setError(null);
        } catch (err) {
            console.error("Failed to load suburbs", err);
            setError(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadSuburbs();
    }, []);

    return (
        <MasterDataContext.Provider value={{ suburbs, loading, error, refreshSuburbs: loadSuburbs }}>
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
