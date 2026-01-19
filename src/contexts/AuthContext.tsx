import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthState } from '../types';
import { authService } from '../services/authService';


interface AuthContextType extends AuthState {
    login: (email: string, password: string) => Promise<boolean>;
    register: (name: string, email: string, password: string) => Promise<boolean>;
    logout: () => Promise<void>;
    updateUser: (userData: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [state, setState] = useState<AuthState>({
        user: null,
        isAuthenticated: false,
        isLoading: true,
    });

    // init
    useEffect(() => {
        const initAuth = async () => {
            try {
                const user = await authService.getCurrentUser();
                setState({
                    user,
                    isAuthenticated: !!user,
                    isLoading: false,
                });
            } catch (error) {
                console.error('Auth initialization failed:', error);
                setState({
                    user: null,
                    isAuthenticated: false,
                    isLoading: false,
                });
            }
        };

        initAuth();
    }, []);


    const login = async (email: string, password: string): Promise<boolean> => {
        setState(prev => ({ ...prev, isLoading: true }));

        try {
            await authService.login(email, password);
            const user = await authService.getCurrentUser();

            setState({
                user,
                isAuthenticated: true,
                isLoading: false,
            });
            return true;
        } catch (error) {
            console.error('Login failed:', error);
            setState(prev => ({ ...prev, isLoading: false, isAuthenticated: false }));
            return false;
        }
    };


    const register = async (name: string, email: string, password: string): Promise<boolean> => {
        setState(prev => ({ ...prev, isLoading: true }));

        try {

            const user = await authService.register(email, password, name);

            setState({
                user,
                isAuthenticated: true,
                isLoading: false,
            });
            return true;
        } catch (error) {
            console.error('Registration failed:', error);
            setState(prev => ({ ...prev, isLoading: false }));
            return false;
        }
    };


    const logout = async () => {
        setState(prev => ({ ...prev, isLoading: true }));
        try {
            await authService.logout();
        } catch (error) {
            console.error('Logout failed:', error);
        } finally {
            setState({
                user: null,
                isAuthenticated: false,
                isLoading: false,
            });
        }
    };


    const updateUser = async (userData: Partial<User>) => {
        if (state.user) {
            const updatedLocalUser = { ...state.user, ...userData };
            setState(prev => ({ ...prev, user: updatedLocalUser }));

            try {
                if (state.user.id) {
                    await authService.updateUser(state.user.id, userData);
                }
            } catch (error) {
                console.error('Backend hiba', error);

            }
        }
    };

    return (
        <AuthContext.Provider value={{ ...state, login, register, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
};


// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};