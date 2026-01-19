import React, { useState } from 'react';
import { 
    User, 
    Mail, 
    Phone, 
    Calendar, 
    Edit2, 
    Save, 
    X, 
    Shield, 
    Key,
    Loader2,
    CheckCircle,
    AlertCircle
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { authService } from '../../services/authService';
import { Card, Button, Input } from '../../components/ui';

const ProfilePage: React.FC = () => {
    const { user, updateUser } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);


    const [formData, setFormData] = useState({
        name: user?.name || '',
        phone: user?.phone || '',
    });

    const [passwordData, setPasswordData] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({ ...prev, [name]: value }));
    };

    const handleSaveProfile = async () => {
        if (!user) return;

        setIsLoading(true);
        setMessage(null);

        try {
            await updateUser({
                name: formData.name,
                phone: formData.phone,
            });

            setMessage({ type: 'success', text: 'Profil sikeresen frissítve!' });
            setIsEditing(false);
        } catch (error) {
            console.error('Profile update error:', error);
            setMessage({ type: 'error', text: 'Nem sikerült frissíteni a profilt.' });
        } finally {
            setIsLoading(false);
        }
    };

    const handleChangePassword = async () => {
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setMessage({ type: 'error', text: 'Az új jelszavak nem egyeznek!' });
            return;
        }

        if (passwordData.newPassword.length < 8) {
            setMessage({ type: 'error', text: 'Az új jelszónak legalább 8 karakter hosszúnak kell lennie!' });
            return;
        }

        setIsLoading(true);
        setMessage(null);

        try {
            await authService.updatePassword(passwordData.oldPassword, passwordData.newPassword);
            setMessage({ type: 'success', text: 'Jelszó sikeresen módosítva!' });
            setIsChangingPassword(false);
            setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) {
            console.error('Password change error:', error);
            setMessage({ type: 'error', text: 'Nem sikerült módosítani a jelszót. Ellenőrizze a régi jelszót!' });
        } finally {
            setIsLoading(false);
        }
    };

    const cancelEdit = () => {
        setFormData({
            name: user?.name || '',
            phone: user?.phone || '',
        });
        setIsEditing(false);
    };

    const cancelPasswordChange = () => {
        setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
        setIsChangingPassword(false);
    };

    if (!user) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <p className="text-gray-500">Betöltés...</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-12">
            <h1 className="text-3xl font-display font-bold text-gray-900 mb-8">Profilom</h1>

            {message && (
                <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${
                    message.type === 'success' 
                        ? 'bg-green-50 text-green-700 border border-green-200' 
                        : 'bg-red-50 text-red-700 border border-red-200'
                }`}>
                    {message.type === 'success' ? (
                        <CheckCircle className="w-5 h-5" />
                    ) : (
                        <AlertCircle className="w-5 h-5" />
                    )}
                    {message.text}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                    <Card padding="lg" className="text-center">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center mx-auto mb-4">
                            <span className="text-3xl font-bold text-white">
                                {user.name.charAt(0).toUpperCase()}
                            </span>
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900">{user.name}</h2>
                        <p className="text-gray-500">{user.email}</p>
                        <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-sm">
                            <Shield className="w-4 h-4" />
                            {user.role === 'admin' ? 'Adminisztrátor' : 'Felhasználó'}
                        </div>
                        <div className="mt-6 pt-6 border-t border-gray-100">
                            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                                <Calendar className="w-4 h-4" />
                                Regisztráció: {user.createdAt.toLocaleDateString('hu-HU')}
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Profil */}
                <div className="lg:col-span-2 space-y-6">

                    <Card padding="lg">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-semibold text-gray-900">Személyes adatok</h3>
                            {!isEditing ? (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    leftIcon={<Edit2 className="w-4 h-4" />}
                                    onClick={() => setIsEditing(true)}
                                >
                                    Szerkesztés
                                </Button>
                            ) : (
                                <div className="flex gap-2">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        leftIcon={<X className="w-4 h-4" />}
                                        onClick={cancelEdit}
                                    >
                                        Mégse
                                    </Button>
                                    <Button
                                        variant="primary"
                                        size="sm"
                                        leftIcon={isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                        onClick={handleSaveProfile}
                                        disabled={isLoading}
                                    >
                                        Mentés
                                    </Button>
                                </div>
                            )}
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    <User className="w-4 h-4 inline mr-2" />
                                    Teljes név
                                </label>
                                {isEditing ? (
                                    <Input
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        placeholder="Teljes név"
                                    />
                                ) : (
                                    <p className="text-gray-900 py-2">{user.name}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    <Mail className="w-4 h-4 inline mr-2" />
                                    Email cím
                                </label>
                                <p className="text-gray-900 py-2">{user.email}</p>
                                <p className="text-xs text-gray-500">Az email cím nem módosítható.</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    <Phone className="w-4 h-4 inline mr-2" />
                                    Telefonszám
                                </label>
                                {isEditing ? (
                                    <Input
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        placeholder="+36 XX XXX XXXX"
                                    />
                                ) : (
                                    <p className="text-gray-900 py-2">
                                        {user.phone || <span className="text-gray-400">Nincs megadva</span>}
                                    </p>
                                )}
                            </div>
                        </div>
                    </Card>


                    <Card padding="lg">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-semibold text-gray-900">Jelszó módosítása</h3>
                            {!isChangingPassword && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    leftIcon={<Key className="w-4 h-4" />}
                                    onClick={() => setIsChangingPassword(true)}
                                >
                                    Jelszó módosítása
                                </Button>
                            )}
                        </div>

                        {isChangingPassword ? (
                            <div className="space-y-4">
                                <Input
                                    type="password"
                                    name="oldPassword"
                                    value={passwordData.oldPassword}
                                    onChange={handlePasswordChange}
                                    placeholder="Jelenlegi jelszó"
                                />
                                <Input
                                    type="password"
                                    name="newPassword"
                                    value={passwordData.newPassword}
                                    onChange={handlePasswordChange}
                                    placeholder="Új jelszó (min. 8 karakter)"
                                />
                                <Input
                                    type="password"
                                    name="confirmPassword"
                                    value={passwordData.confirmPassword}
                                    onChange={handlePasswordChange}
                                    placeholder="Új jelszó megerősítése"
                                />
                                <div className="flex gap-3 pt-2">
                                    <Button
                                        variant="ghost"
                                        onClick={cancelPasswordChange}
                                    >
                                        Mégse
                                    </Button>
                                    <Button
                                        variant="primary"
                                        leftIcon={isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Key className="w-4 h-4" />}
                                        onClick={handleChangePassword}
                                        disabled={isLoading}
                                    >
                                        Jelszó módosítása
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <p className="text-gray-500 text-sm">
                                A biztonság érdekében javasoljuk, hogy rendszeresen változtassa meg jelszavát.
                            </p>
                        )}
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
