import React, { useState } from 'react';
import {
    Settings,
    Globe,
    Mail,
    Bell,
    Shield,
    Database,
    Palette,
    Save,
    Loader2,
    CheckCircle,
    Key,
    CreditCard,
    FileText,
    AlertTriangle
} from 'lucide-react';
import { Card, Button, Input, Badge } from '../../components/ui';

const AdminSettings: React.FC = () => {
    const [activeTab, setActiveTab] = useState('general');
    const [isSaving, setIsSaving] = useState(false);
    const [savedMessage, setSavedMessage] = useState(false);

    // Form states
    const [generalSettings, setGeneralSettings] = useState({
        siteName: 'UtazzVelünk',
        siteDescription: 'Személyre szabott utazási élmények',
        contactEmail: 'info@utazzvelunk.hu',
        contactPhone: '+36 1 234 5678',
        address: '6800 Hódmezővásárhely, Munkácsy Mihály utca 4.',
        currency: 'HUF',
        timezone: 'Europe/Budapest',
    });

    const [notificationSettings, setNotificationSettings] = useState({
        emailNewBooking: true,
        emailBookingCancelled: true,
        emailNewUser: true,
        emailDailyReport: false,
        emailWeeklyReport: true,
    });

    const [paymentSettings, setPaymentSettings] = useState({
        enableOnlinePayment: true,
        enableBankTransfer: true,
        stripeLive: false,
        depositPercentage: 30,
    });

    const handleSave = async () => {
        setIsSaving(true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        setIsSaving(false);
        setSavedMessage(true);
        setTimeout(() => setSavedMessage(false), 3000);
    };

    const tabs = [
        { id: 'general', label: 'Általános', icon: Settings },
        { id: 'notifications', label: 'Értesítések', icon: Bell },
        { id: 'payment', label: 'Fizetés', icon: CreditCard },
        { id: 'security', label: 'Biztonság', icon: Shield },
        { id: 'api', label: 'API Kulcsok', icon: Key },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Beállítások</h1>
                    <p className="text-gray-500">Rendszer konfigurálás és testreszabás</p>
                </div>
                <Button
                    variant="primary"
                    leftIcon={isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    onClick={handleSave}
                    disabled={isSaving}
                >
                    Mentés
                </Button>
            </div>


            {savedMessage && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3 text-green-700">
                    <CheckCircle className="w-5 h-5" />
                    Beállítások sikeresen mentve!
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Sidebar*/}
                <div className="lg:col-span-1">
                    <Card padding="sm">
                        <nav className="space-y-1">
                            {tabs.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                                        activeTab === tab.id
                                            ? 'bg-primary-50 text-primary-700'
                                            : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                                >
                                    <tab.icon className="w-5 h-5" />
                                    <span className="font-medium">{tab.label}</span>
                                </button>
                            ))}
                        </nav>
                    </Card>
                </div>


                <div className="lg:col-span-3">

                    {activeTab === 'general' && (
                        <Card padding="lg">
                            <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                                <Globe className="w-5 h-5 text-primary-500" />
                                Általános beállítások
                            </h2>

                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Weboldal neve
                                        </label>
                                        <Input
                                            value={generalSettings.siteName}
                                            onChange={(e) => setGeneralSettings(prev => ({ ...prev, siteName: e.target.value }))}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Weboldal leírása
                                        </label>
                                        <Input
                                            value={generalSettings.siteDescription}
                                            onChange={(e) => setGeneralSettings(prev => ({ ...prev, siteDescription: e.target.value }))}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Kapcsolat email
                                        </label>
                                        <Input
                                            type="email"
                                            value={generalSettings.contactEmail}
                                            onChange={(e) => setGeneralSettings(prev => ({ ...prev, contactEmail: e.target.value }))}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Telefonszám
                                        </label>
                                        <Input
                                            value={generalSettings.contactPhone}
                                            onChange={(e) => setGeneralSettings(prev => ({ ...prev, contactPhone: e.target.value }))}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Cím
                                    </label>
                                    <Input
                                        value={generalSettings.address}
                                        onChange={(e) => setGeneralSettings(prev => ({ ...prev, address: e.target.value }))}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Pénznem
                                        </label>
                                        <select
                                            value={generalSettings.currency}
                                            onChange={(e) => setGeneralSettings(prev => ({ ...prev, currency: e.target.value }))}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        >
                                            <option value="HUF">HUF - Magyar Forint</option>
                                            <option value="EUR">EUR - Euró</option>
                                            <option value="USD">USD - Amerikai Dollár</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Időzóna
                                        </label>
                                        <select
                                            value={generalSettings.timezone}
                                            onChange={(e) => setGeneralSettings(prev => ({ ...prev, timezone: e.target.value }))}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        >
                                            <option value="Europe/Budapest">Europe/Budapest (CET)</option>
                                            <option value="UTC">UTC</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    )}


                    {activeTab === 'notifications' && (
                        <Card padding="lg">
                            <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                                <Bell className="w-5 h-5 text-primary-500" />
                                Értesítési beállítások
                            </h2>

                            <div className="space-y-4">
                                <div className="p-4 bg-gray-50 rounded-xl">
                                    <h3 className="font-medium text-gray-900 mb-4">Email értesítések</h3>
                                    <div className="space-y-3">
                                        {[
                                            { key: 'emailNewBooking', label: 'Új foglalás esetén' },
                                            { key: 'emailBookingCancelled', label: 'Foglalás lemondása esetén' },
                                            { key: 'emailNewUser', label: 'Új regisztráció esetén' },
                                            { key: 'emailDailyReport', label: 'Napi összefoglaló' },
                                            { key: 'emailWeeklyReport', label: 'Heti összefoglaló' },
                                        ].map(item => (
                                            <label key={item.key} className="flex items-center justify-between cursor-pointer">
                                                <span className="text-gray-700">{item.label}</span>
                                                <div className="relative">
                                                    <input
                                                        type="checkbox"
                                                        checked={notificationSettings[item.key as keyof typeof notificationSettings]}
                                                        onChange={(e) => setNotificationSettings(prev => ({
                                                            ...prev,
                                                            [item.key]: e.target.checked
                                                        }))}
                                                        className="sr-only"
                                                    />
                                                    <div className={`w-11 h-6 rounded-full transition-colors ${
                                                        notificationSettings[item.key as keyof typeof notificationSettings]
                                                            ? 'bg-primary-500'
                                                            : 'bg-gray-300'
                                                    }`}>
                                                        <div className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                                                            notificationSettings[item.key as keyof typeof notificationSettings]
                                                                ? 'translate-x-5'
                                                                : 'translate-x-0'
                                                        }`} />
                                                    </div>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </Card>
                    )}


                    {activeTab === 'payment' && (
                        <Card padding="lg">
                            <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                                <CreditCard className="w-5 h-5 text-primary-500" />
                                Fizetési beállítások
                            </h2>

                            <div className="space-y-6">
                                <div className="p-4 bg-gray-50 rounded-xl">
                                    <h3 className="font-medium text-gray-900 mb-4">Fizetési módok</h3>
                                    <div className="space-y-3">
                                        <label className="flex items-center justify-between cursor-pointer">
                                            <div>
                                                <span className="text-gray-700 font-medium">Online fizetés</span>
                                                <p className="text-sm text-gray-500">Bankkártyás fizetés (Stripe)</p>
                                            </div>
                                            <div className="relative">
                                                <input
                                                    type="checkbox"
                                                    checked={paymentSettings.enableOnlinePayment}
                                                    onChange={(e) => setPaymentSettings(prev => ({
                                                        ...prev,
                                                        enableOnlinePayment: e.target.checked
                                                    }))}
                                                    className="sr-only"
                                                />
                                                <div className={`w-11 h-6 rounded-full transition-colors ${
                                                    paymentSettings.enableOnlinePayment ? 'bg-primary-500' : 'bg-gray-300'
                                                }`}>
                                                    <div className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                                                        paymentSettings.enableOnlinePayment ? 'translate-x-5' : 'translate-x-0'
                                                    }`} />
                                                </div>
                                            </div>
                                        </label>

                                        <label className="flex items-center justify-between cursor-pointer">
                                            <div>
                                                <span className="text-gray-700 font-medium">Banki átutalás</span>
                                                <p className="text-sm text-gray-500">Hagyományos banki átutalás</p>
                                            </div>
                                            <div className="relative">
                                                <input
                                                    type="checkbox"
                                                    checked={paymentSettings.enableBankTransfer}
                                                    onChange={(e) => setPaymentSettings(prev => ({
                                                        ...prev,
                                                        enableBankTransfer: e.target.checked
                                                    }))}
                                                    className="sr-only"
                                                />
                                                <div className={`w-11 h-6 rounded-full transition-colors ${
                                                    paymentSettings.enableBankTransfer ? 'bg-primary-500' : 'bg-gray-300'
                                                }`}>
                                                    <div className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                                                        paymentSettings.enableBankTransfer ? 'translate-x-5' : 'translate-x-0'
                                                    }`} />
                                                </div>
                                            </div>
                                        </label>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Előleg mértéke (%)
                                    </label>
                                    <Input
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={paymentSettings.depositPercentage}
                                        onChange={(e) => setPaymentSettings(prev => ({
                                            ...prev,
                                            depositPercentage: parseInt(e.target.value) || 0
                                        }))}
                                    />
                                    <p className="text-sm text-gray-500 mt-1">
                                        A foglaláskor fizetendő előleg százaléka
                                    </p>
                                </div>

                                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
                                    <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="font-medium text-amber-800">Stripe konfiguráció szükséges</p>
                                        <p className="text-sm text-amber-700">
                                            Az online fizetéshez állítsa be a Stripe API kulcsokat az API Kulcsok fülön.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    )}


                    {activeTab === 'security' && (
                        <Card padding="lg">
                            <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                                <Shield className="w-5 h-5 text-primary-500" />
                                Biztonsági beállítások
                            </h2>

                            <div className="space-y-6">
                                <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                                    <div className="flex items-center gap-2 mb-2">
                                        <CheckCircle className="w-5 h-5 text-green-600" />
                                        <span className="font-medium text-green-800">SSL tanúsítvány aktív</span>
                                    </div>
                                    <p className="text-sm text-green-700">
                                        A weboldal HTTPS kapcsolaton keresztül érhető el.
                                    </p>
                                </div>

                                <div className="p-4 bg-gray-50 rounded-xl">
                                    <h3 className="font-medium text-gray-900 mb-4">Jelszó követelmények</h3>
                                    <div className="space-y-2 text-sm text-gray-600">
                                        <p>• Minimum 8 karakter</p>
                                        <p>• Legalább egy nagybetű</p>
                                        <p>• Legalább egy szám</p>
                                    </div>
                                </div>

                                <div className="p-4 bg-gray-50 rounded-xl">
                                    <h3 className="font-medium text-gray-900 mb-4">Session kezelés</h3>
                                    <div className="space-y-2 text-sm text-gray-600">
                                        <p>• Session időtúllépés: 24 óra</p>
                                        <p>• Automatikus kijelentkezés inaktivitás esetén</p>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    )}


                    {activeTab === 'api' && (
                        <Card padding="lg">
                            <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                                <Key className="w-5 h-5 text-primary-500" />
                                API Kulcsok
                            </h2>

                            <div className="space-y-6">
                                <div className="p-4 border border-gray-200 rounded-xl">
                                    <div className="flex items-center justify-between mb-3">
                                        <div>
                                            <h3 className="font-medium text-gray-900">Appwrite</h3>
                                            <p className="text-sm text-gray-500">Backend szolgáltatás</p>
                                        </div>
                                        <Badge variant="success">Konfigurálva</Badge>
                                    </div>
                                    <Input
                                        type="password"
                                        value="••••••••••••••••"
                                        readOnly
                                        className="bg-gray-50"
                                    />
                                </div>

                                <div className="p-4 border border-gray-200 rounded-xl">
                                    <div className="flex items-center justify-between mb-3">
                                        <div>
                                            <h3 className="font-medium text-gray-900">Google Gemini AI</h3>
                                            <p className="text-sm text-gray-500">AI útiterv generálás</p>
                                        </div>
                                        <Badge variant="success">Konfigurálva</Badge>
                                    </div>
                                    <Input
                                        type="password"
                                        value="••••••••••••••••"
                                        readOnly
                                        className="bg-gray-50"
                                    />
                                </div>

                                <div className="p-4 border border-gray-200 rounded-xl">
                                    <div className="flex items-center justify-between mb-3">
                                        <div>
                                            <h3 className="font-medium text-gray-900">Unsplash</h3>
                                            <p className="text-sm text-gray-500">Képek API</p>
                                        </div>
                                        <Badge variant="warning">Opcionális</Badge>
                                    </div>
                                    <Input
                                        placeholder="Unsplash Access Key"
                                        className="bg-gray-50"
                                    />
                                </div>

                                <div className="p-4 border border-gray-200 rounded-xl">
                                    <div className="flex items-center justify-between mb-3">
                                        <div>
                                            <h3 className="font-medium text-gray-900">Stripe</h3>
                                            <p className="text-sm text-gray-500">Fizetési szolgáltató</p>
                                        </div>
                                        <Badge variant="secondary">Nincs konfigurálva</Badge>
                                    </div>
                                    <div className="space-y-3">
                                        <Input
                                            placeholder="Stripe Publishable Key"
                                            className="bg-gray-50"
                                        />
                                        <Input
                                            type="password"
                                            placeholder="Stripe Secret Key"
                                            className="bg-gray-50"
                                        />
                                    </div>
                                </div>

                                <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                                    <p className="text-sm text-blue-700">
                                        <strong>Megjegyzés:</strong> Az API kulcsokat soha ne ossza meg nyilvánosan.
                                        A kulcsok módosítása után a rendszer újraindítása szükséges lehet.
                                    </p>
                                </div>
                            </div>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminSettings;
