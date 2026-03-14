
import React, { useContext } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getProfile } from '../api/user-api';
import { createContext, useEffect, useState } from 'react';

interface User {
    userId: string;
    email: string;
    role: string;
    name: string;
    companyId: string;
    existMultipleInstructors: boolean;
    profileImage?:string
}

interface AuthContextType {
    user: User | null;
    login: (token: string) => void;
    logout: () => void;
    updateUser: (data: Partial<User>) => void;
    isAuthenticated: boolean;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [tokenUser, setTokenUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const queryClient = useQueryClient();

    const { data: profileDetails } = useQuery({
        queryKey: ['userProfile'],
        queryFn: getProfile,
        enabled: !!tokenUser,
    });

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decoded = jwtDecode<User>(token);
                setTokenUser(decoded);
            } catch (error) {
                console.error("Invalid token", error);
                localStorage.removeItem('token');
            }
        }
        setLoading(false);
    }, []);

    const login = (token: string) => {
        localStorage.setItem('token', token);
        const decoded = jwtDecode<User>(token);
        setTokenUser(decoded);
    };

    const logout = () => {
        localStorage.removeItem('token');
        setTokenUser(null);
        queryClient.removeQueries({ queryKey: ['userProfile'] });
    };

    const updateUser = (data: Partial<User>) => {
        setTokenUser(prev => prev ? { ...prev, ...data } : null);
    };

    const user = React.useMemo(() => {
        if (!tokenUser) return null;
        if (!profileDetails) return tokenUser;
        return {
            ...tokenUser,
            name: profileDetails.name || tokenUser.name,
            profileImage: profileDetails.profileImage || tokenUser.profileImage,
            existMultipleInstructors: profileDetails.existMultipleInstructors ?? tokenUser.existMultipleInstructors
        };
    }, [tokenUser, profileDetails]);

    return (
        <AuthContext.Provider value={{ user, login, logout, updateUser, isAuthenticated: !!user, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
