import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    ArrowRight,
    Sparkles,
    Shield,
    Heart,
    Users,
    ChevronRight,
    MapPin,
    Loader2
} from 'lucide-react';
import { Button, Card, Badge } from '../../components/ui';
import { PackageCard } from '../../components/features';

import { packageService } from '../../services/packageService';
import { TravelPackage } from '../../types';

const HomePage: React.FC = () => {

    const [featuredPackages, setFeaturedPackages] = useState<TravelPackage[]>([]);
    const [isLoading, setIsLoading] = useState(true);


    useEffect(() => {
        const loadFeaturedPackages = async () => {
            try {
                const packages = await packageService.getFeatured(3);
                setFeaturedPackages(packages);
            } catch (error) {
                console.error('Failed to load featured packages:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadFeaturedPackages();
    }, []);



    const features = [
        {
            icon: Sparkles,
            title: 'AI Útitervező',
            description: 'Személyre szabott útitervek mesterséges intelligencia segítségével, percek alatt.',
        },
        {
            icon: Shield,
            title: 'Biztonságos foglalás',
            description: 'Biztonságos fizetés és teljes pénzvisszafizetési garancia lemondás esetén.',
        },
        {
            icon: Heart,
            title: 'Egyedi élmények',
            description: 'Gondosan válogatott programok és helyi túravezetők autentikus élményekért.',
        },
    ];



    return (
        <div className="overflow-hidden">

            <section className="relative min-h-[90vh] flex items-center">

                <div className="absolute inset-0">
                    <img
                        src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1920"
                        alt="Travel"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-primary-950/90 via-primary-900/70 to-secondary-900/50" />
                    <div className="absolute inset-0 bg-hero-pattern opacity-30" />
                    <div className="absolute top-20 right-20 w-72 h-72 bg-secondary-500/20 rounded-full blur-3xl" />
                    <div className="absolute bottom-20 left-20 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl" />
                </div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                    <div className="max-w-2xl">
                        <Badge variant="secondary" className="mb-6 animate-fade-in bg-white/10 backdrop-blur-sm border-white/20 text-white">
                            ✨ Új: AI-alapú útitervező
                        </Badge>

                        <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-bold text-white leading-tight animate-slide-up">
                            Fedezze fel a világ
                            <span className="block bg-gradient-to-r from-primary-300 via-secondary-300 to-accent-300 bg-clip-text text-transparent">
                                csodáit velünk
                            </span>
                        </h1>

                        <p className="text-xl text-primary-100/90 mt-6 max-w-xl animate-slide-up animate-delay-100">
                            Személyre szabott utazási élmények, mesterséges intelligenciával támogatott
                            tervezés és megbízható szolgáltatás. Tegye emlékezetessé a nyaralását!
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 mt-10 animate-slide-up animate-delay-200">
                            <Link to="/packages">
                                <Button variant="primary" size="lg" rightIcon={<ArrowRight className="w-5 h-5" />}>
                                    Utazások böngészése
                                </Button>
                            </Link>
                            <Link to="/ai-planner">
                                <Button variant="secondary" size="lg" leftIcon={<Sparkles className="w-5 h-5" />} className="bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20">
                                    AI Útitervező
                                </Button>
                            </Link>
                        </div>



                    </div>
                </div>


                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
                    <div className="w-8 h-12 border-2 border-white/30 rounded-full flex items-start justify-center p-2">
                        <div className="w-1.5 h-3 bg-white/60 rounded-full animate-pulse" />
                    </div>
                </div>
            </section>


            <section className="py-24 bg-white relative overflow-hidden">

                <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-primary-50 to-transparent" />
                <div className="absolute bottom-0 left-0 w-1/3 h-full bg-gradient-to-r from-secondary-50 to-transparent" />
                
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <Badge variant="primary" className="mb-4">Miért válasszon minket?</Badge>
                        <h2 className="text-4xl md:text-5xl font-display font-bold text-gray-900">
                            Utazási élmény <span className="gradient-text-static">új szinten</span>
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {features.map((feature, index) => (
                            <Card key={index} padding="lg" className="text-center group hover:shadow-glow transition-all duration-300 border border-primary-100/50">
                                <div className="w-16 h-16 mx-auto bg-gradient-to-br from-primary-100 via-primary-50 to-secondary-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:shadow-lg transition-all duration-300">
                                    <feature.icon className="w-8 h-8 text-primary-600" />
                                </div>
                                <h3 className="text-xl font-display font-semibold text-gray-900 mb-3">
                                    {feature.title}
                                </h3>
                                <p className="text-gray-600">
                                    {feature.description}
                                </p>
                            </Card>
                        ))}
                    </div>
                </div>
            </section>

            {/* Packages */}
            <section className="py-24 bg-sand-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
                        <div>
                            <Badge variant="secondary" className="mb-4">Kiemelt ajánlatok</Badge>
                            <h2 className="text-4xl md:text-5xl font-display font-bold text-gray-900">
                                Legnépszerűbb <span className="text-primary-500">úti céljaink</span>
                            </h2>
                        </div>
                        <Link to="/packages">
                            <Button variant="ghost" rightIcon={<ChevronRight className="w-5 h-5" />}>
                                Összes utazás
                            </Button>
                        </Link>
                    </div>


                    {isLoading ? (
                        <div className="flex justify-center items-center py-12">
                            <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
                        </div>
                    ) : featuredPackages.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {featuredPackages.map((pkg) => (
                                <PackageCard key={pkg.id} package={pkg} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 text-gray-500">
                            <p>Jelenleg nincsenek kiemelt ajánlatok.</p>
                        </div>
                    )}
                </div>
            </section>


            <section className="py-24 bg-gradient-to-br from-primary-500 via-primary-600 to-secondary-600 relative overflow-hidden">
                <div className="absolute inset-0 bg-hero-pattern opacity-10" />
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col lg:flex-row items-center gap-12">
                        <div className="flex-1 text-center lg:text-left">
                            <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-2 mb-6">
                                <Sparkles className="w-5 h-5 text-white" />
                                <span className="text-white font-medium">Új funkció</span>
                            </div>
                            <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-6">
                                Tervezze meg álomutazását AI segítségével
                            </h2>
                            <p className="text-xl text-white/80 mb-8 max-w-xl">
                                Adja meg preferenciáit, és mesterséges intelligenciánk pillanatok alatt
                                személyre szabott, napokra bontott útitervet készít Önnek.
                            </p>
                            <Link to="/ai-planner">
                                <Button
                                    variant="secondary"
                                    size="lg"
                                    className="bg-white hover:bg-gray-50"
                                    rightIcon={<ArrowRight className="w-5 h-5" />}
                                >
                                    Próbálja ki most
                                </Button>
                            </Link>
                        </div>

                        <div className="flex-1 w-full max-w-md">
                            <Card padding="lg" className="backdrop-blur-sm bg-white/95">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                                            <MapPin className="w-5 h-5 text-primary-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Úti cél</p>
                                            <p className="font-medium text-gray-900">Tokió, Japán</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-secondary-100 flex items-center justify-center">
                                            <Users className="w-5 h-5 text-secondary-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Utazók</p>
                                            <p className="font-medium text-gray-900">2 fő, páros utazás</p>
                                        </div>
                                    </div>
                                    <div className="pt-4 border-t border-gray-100">
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-600">Generált útiterv</span>
                                            <Badge variant="success">10 nap</Badge>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </div>
                </div>
            </section>





            <section className="py-24 bg-gray-900 relative overflow-hidden">
                <div className="absolute inset-0 bg-hero-pattern opacity-5" />
                <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-6">
                        Készen áll a következő kalandra?
                    </h2>
                    <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
                        Csatlakozzon több ezer elégedett utasunkhoz, és tegye emlékezetessé a nyaralását!
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to="/packages">
                            <Button variant="primary" size="lg" rightIcon={<ArrowRight className="w-5 h-5" />}>
                                Böngésszen az utazások között
                            </Button>
                        </Link>
                        <Link to="/register">
                            <Button variant="secondary" size="lg">
                                Regisztráljon most
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default HomePage;