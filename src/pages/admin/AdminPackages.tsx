import React, { useState, useEffect } from 'react';
import {
    Plus, Search, Edit2, Trash2, Eye, Star, MapPin, Loader2
} from 'lucide-react';
import { TravelPackage } from '../../types';
import { Button, Input, Card, Badge, Modal } from '../../components/ui';
import { packageService } from '../../services/packageService';
import { formatCurrency, formatDate, getCategoryLabel, cn } from '../../utils/helpers';

import PackageForm, { PackageFormData } from '../../components/admin/PackageForm';

const AdminPackages: React.FC = () => {
    const [packages, setPackages] = useState<TravelPackage[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedPackage, setSelectedPackage] = useState<TravelPackage | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showFormModal, setShowFormModal] = useState(false);

    const fetchPackages = async () => {
        try {
            const data = await packageService.getAll();
            setPackages(data);
        } catch (error) {
            console.error('Fetch error:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPackages();
    }, []);

    const handleDelete = (pkg: TravelPackage) => {
        setSelectedPackage(pkg);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (selectedPackage) {
            try {
                await packageService.delete(selectedPackage.id);
                setPackages(packages.filter(p => p.id !== selectedPackage.id));
                setShowDeleteModal(false);
            } catch (error) {
                console.error('Delete error:', error);
                alert('Törlés sikertelen.');
            }
        }
    };

    const handleEdit = (pkg: TravelPackage) => {
        setSelectedPackage(pkg);
        setShowFormModal(true);
    };

    const handleCreateClick = () => {
        setSelectedPackage(null);
        setShowFormModal(true);
    };


    const handleFormSubmit = async (formData: PackageFormData) => {
        setIsSubmitting(true);
        try {

            const {
                id,
                $id,
                createdAt,
                $createdAt,
                updatedAt,
                $updatedAt,
                $permissions,
                $databaseId,
                $collectionId,
                ...cleanFormData
            } = formData as any;


            const dataToSave = {
                ...cleanFormData,
                departureDate: new Date(formData.departureDate),
                returnDate: new Date(formData.returnDate)
            };

            if (selectedPackage) {
                // UPDATE
                const updated = await packageService.update(selectedPackage.id, dataToSave);
                setPackages(packages.map(p => p.id === updated.id ? updated : p));
            } else {
                // CREATE
                const created = await packageService.create(dataToSave);
                setPackages([created, ...packages]);
            }
            setShowFormModal(false);
        } catch (error) {
            console.error('Operation failed:', error);
            alert('Hiba történt a mentés során. Részletek a konzolon.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const toggleActive = async (pkg: TravelPackage) => {
        try {
            const updated = await packageService.toggleActive(pkg.id, !pkg.isActive);
            setPackages(packages.map(p => p.id === updated.id ? updated : p));
        } catch (error) { console.error('Toggle failed:', error); }
    };

    const toggleFeatured = async (pkg: TravelPackage) => {
        try {
            const updated = await packageService.toggleFeatured(pkg.id, !pkg.isFeatured);
            setPackages(packages.map(p => p.id === updated.id ? updated : p));
        } catch (error) { console.error('Toggle featured failed:', error); }
    };

    const filteredPackages = packages.filter(pkg =>
        pkg.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h1 className="text-2xl font-bold text-gray-900">Utazások kezelése</h1>
                <Button variant="primary" leftIcon={<Plus className="w-5 h-5" />} onClick={handleCreateClick}>
                    Új utazás
                </Button>
            </div>

            <Card padding="md">
                <Input
                    placeholder="Keresés..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    leftIcon={<Search className="w-5 h-5" />}
                />
            </Card>

            <Card padding="none" className="overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Utazás</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Kategória</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Ár</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Indulás</th>
                            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Státusz</th>
                            <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Műveletek</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                        {filteredPackages.map((pkg) => (
                            <tr key={pkg.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-4">
                                        <img src={pkg.coverImage} alt={pkg.title} className="w-16 h-12 rounded-lg object-cover" />
                                        <div>
                                            <p className="font-medium text-gray-900">{pkg.title}</p>
                                            <p className="text-sm text-gray-500 flex items-center gap-1">
                                                <MapPin className="w-3 h-3" /> {pkg.destination}, {pkg.country}
                                            </p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4"><Badge variant="secondary">{getCategoryLabel(pkg.category)}</Badge></td>
                                <td className="px-6 py-4 font-semibold">{formatCurrency(pkg.price)}</td>
                                <td className="px-6 py-4 text-sm text-gray-600">{formatDate(pkg.departureDate, { month: 'short', day: 'numeric' })}</td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-col gap-1">
                                        <button onClick={() => toggleActive(pkg)} className={cn('inline-flex items-center px-2 py-1 rounded text-xs font-medium transition-colors w-fit', pkg.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600')}>
                                            {pkg.isActive ? 'Aktív' : 'Inaktív'}
                                        </button>
                                        <button onClick={() => toggleFeatured(pkg)} className={cn('inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors w-fit', pkg.isFeatured ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-500')}>
                                            <Star className={cn('w-3 h-3', pkg.isFeatured && 'fill-current')} /> Kiemelt
                                        </button>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex justify-end gap-2">
                                        <button onClick={() => window.open(`/packages/${pkg.slug}`, '_blank')} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"><Eye className="w-5 h-5" /></button>
                                        <button onClick={() => handleEdit(pkg)} className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"><Edit2 className="w-5 h-5" /></button>
                                        <button onClick={() => handleDelete(pkg)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-5 h-5" /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Törlés" size="sm">
                <p className="mb-4">Biztosan törölni szeretné: <strong>{selectedPackage?.title}</strong>?</p>
                <div className="flex gap-3">
                    <Button variant="secondary" onClick={() => setShowDeleteModal(false)} className="flex-1">Mégsem</Button>
                    <Button variant="danger" onClick={confirmDelete} className="flex-1">Törlés</Button>
                </div>
            </Modal>


            <Modal
                isOpen={showFormModal}
                onClose={() => setShowFormModal(false)}
                title={selectedPackage ? "Utazás szerkesztése" : "Új utazás létrehozása"}
                size="xl"
            >
                <PackageForm
                    initialData={selectedPackage}
                    onSubmit={handleFormSubmit}
                    onCancel={() => setShowFormModal(false)}
                    isLoading={isSubmitting}
                />
            </Modal>
        </div>
    );
};

export default AdminPackages;