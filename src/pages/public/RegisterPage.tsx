import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plane, Mail, Lock, Eye, EyeOff, User, AlertCircle, Check } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Button, Input, Card } from '../../components/ui';
import { isValidEmail } from '../../utils/helpers';

const RegisterPage: React.FC = () => {
    const navigate = useNavigate();
    const { register, isLoading } = useAuth();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        acceptTerms: false,
    });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');

    const passwordRequirements = [
        { label: 'Legalább 8 karakter', met: formData.password.length >= 8 },
        { label: 'Tartalmaz számot', met: /\d/.test(formData.password) },
        { label: 'Jelszavak egyeznek', met: formData.password === formData.confirmPassword && formData.confirmPassword !== '' },
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');


        const cleanName = formData.name.trim();
        const cleanEmail = formData.email.trim();

        if (!cleanName) {
            setError('Kérjük, adja meg a nevét.');
            return;
        }

        if (!isValidEmail(cleanEmail)) {
            setError('Kérjük, adjon meg egy érvényes email címet.');
            return;
        }



        try {

            const success = await register(cleanName, cleanEmail, formData.password);

            if (success) {
                navigate('/', { replace: true });
            } else {
                setError('A regisztráció sikertelen. Lehet, hogy ez az email cím már foglalt.');
            }
        } catch (err) {
            console.error('Registration error:', err);
            setError('Váratlan hiba történt. Kérjük, próbálja újra később.');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-sand-50 via-white to-primary-50 flex items-center justify-center p-4">

            <div className="absolute inset-0 bg-hero-pattern opacity-30" />

            <div className="relative w-full max-w-md">

                <Link to="/" className="flex items-center justify-center gap-3 mb-8">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl flex items-center justify-center shadow-glow">
                        <Plane className="w-6 h-6 text-white" />
                    </div>
                    <span className="font-display text-2xl font-bold text-gray-900">
            Utazz<span className="text-primary-500">Velünk</span>
          </span>
                </Link>

                <Card padding="lg" className="animate-scale-in">
                    <div className="text-center mb-8">
                        <h1 className="text-2xl font-display font-bold text-gray-900 mb-2">
                            Hozzon létre fiókot
                        </h1>
                        <p className="text-gray-600">
                            Regisztráljon az egyedi utazási élményekért
                        </p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 animate-slide-down">
                            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                            <p className="text-red-700 text-sm">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <Input
                            label="Teljes név"
                            type="text"
                            placeholder="Kovács Péter"
                            value={formData.name}
                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            leftIcon={<User className="w-5 h-5" />}
                            required
                        />

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

                        <Input
                            label="Jelszó megerősítése"
                            type={showPassword ? 'text' : 'password'}
                            placeholder="••••••••"
                            value={formData.confirmPassword}
                            onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                            leftIcon={<Lock className="w-5 h-5" />}
                            required
                        />


                        {formData.password && (
                            <div className="space-y-2">
                                {passwordRequirements.map((req, index) => (
                                    <div
                                        key={index}
                                        className={`flex items-center gap-2 text-sm ${
                                            req.met ? 'text-green-600' : 'text-gray-400'
                                        }`}
                                    >
                                        <Check className={`w-4 h-4 ${req.met ? 'opacity-100' : 'opacity-30'}`} />
                                        {req.label}
                                    </div>
                                ))}
                            </div>
                        )}

                        <label className="flex items-start gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.acceptTerms}
                                onChange={(e) => setFormData(prev => ({ ...prev, acceptTerms: e.target.checked }))}
                                className="w-4 h-4 mt-1 rounded border-gray-300 text-primary-500 focus:ring-primary-500"
                            />
                            <span className="text-sm text-gray-600">
                Elfogadom az{' '}
                                <Link to="/terms" className="text-primary-600 hover:underline">
                  Általános Szerződési Feltételeket
                </Link>{' '}
                                és az{' '}
                                <Link to="/privacy" className="text-primary-600 hover:underline">
                  Adatvédelmi Szabályzatot
                </Link>
              </span>
                        </label>

                        <Button
                            type="submit"
                            variant="primary"
                            size="lg"
                            className="w-full"
                            isLoading={isLoading}
                        >
                            Regisztráció
                        </Button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-gray-600">
                            Már van fiókja?{' '}
                            <Link to="/login" className="text-primary-600 hover:text-primary-700 font-semibold">
                                Jelentkezzen be
                            </Link>
                        </p>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default RegisterPage;