import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Plane, Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Button, Input, Card } from '../../components/ui';
import { isValidEmail } from '../../utils/helpers';

const LoginPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { login, isLoading } = useAuth();

    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');

    const from = (location.state as { from?: string })?.from || '/';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');


        const cleanEmail = formData.email.trim();

        if (!isValidEmail(cleanEmail)) {
            setError('Kérjük, adjon meg egy érvényes email címet.');
            return;
        }

        try {

            const success = await login(cleanEmail, formData.password);

            if (success) {
                navigate(from, { replace: true });
            } else {
                setError('Hibás email cím vagy jelszó. Kérjük, próbálja újra.');
            }
        } catch (err) {

            console.error('Login error:', err);
            setError('Váratlan hiba történt a bejelentkezés során.');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center p-4 relative overflow-hidden">

            <div className="absolute inset-0 bg-hero-pattern opacity-40" />
            <div className="absolute top-20 left-20 w-72 h-72 bg-primary-300/30 rounded-full blur-3xl" />
            <div className="absolute bottom-20 right-20 w-96 h-96 bg-secondary-300/20 rounded-full blur-3xl" />

            <div className="relative w-full max-w-md">

                <Link to="/" className="flex items-center justify-center gap-3 mb-8">
                    <div className="w-14 h-14 bg-gradient-to-br from-primary-500 via-primary-600 to-secondary-600 rounded-2xl flex items-center justify-center shadow-glow">
                        <Plane className="w-7 h-7 text-white" />
                    </div>
                    <span className="font-display text-2xl font-bold">
                        <span className="text-gray-900">Utazz</span>
                        <span className="gradient-text-static">Velünk</span>
                    </span>
                </Link>

                <Card padding="lg" className="animate-scale-in backdrop-blur-sm bg-white/90">
                    <div className="text-center mb-8">
                        <h1 className="text-2xl font-display font-bold text-gray-900 mb-2">
                            Üdvözöljük újra!
                        </h1>
                        <p className="text-gray-600">
                            Jelentkezzen be fiókjába a folytatáshoz
                        </p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3 animate-slide-down">
                            <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
                            <p className="text-rose-700 text-sm">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <Input
                            label="Email cím"
                            type="email"
                            placeholder="pelda@email.com"
                            value={formData.email}
                            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                            leftIcon={<Mail className="w-5 h-5" />}
                            required
                        />

                        <Input
                            label="Jelszó"
                            type={showPassword ? 'text' : 'password'}
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                            leftIcon={<Lock className="w-5 h-5" />}
                            rightIcon={
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            }
                            required
                        />

                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="w-4 h-4 rounded border-gray-300 text-primary-500 focus:ring-primary-500"
                                />
                                <span className="text-sm text-gray-600">Emlékezzen rám</span>
                            </label>
                            <Link to="/forgot-password" className="text-sm text-primary-600 hover:text-primary-700">
                                Elfelejtett jelszó?
                            </Link>
                        </div>

                        <Button
                            type="submit"
                            variant="primary"
                            size="lg"
                            className="w-full"
                            isLoading={isLoading}
                        >
                            Bejelentkezés
                        </Button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-gray-600">
                            Még nincs fiókja?{' '}
                            <Link to="/register" className="text-primary-600 hover:text-primary-700 font-semibold">
                                Regisztráljon most
                            </Link>
                        </p>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default LoginPage;