import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, Mail, Shield, ShieldCheck, Loader2 } from 'lucide-react';
import { User } from '../../types';
import { Button, Input, Card, Modal, Avatar } from '../../components/ui';
import {DATABASE_ID, databases} from '../../services/appwrite';
import { authService } from '../../services/authService';
import { formatDate, cn } from '../../utils/helpers';

const AdminUsers: React.FC = () => {

    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Modal
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);

    // Edit
    const [editFormData, setEditFormData] = useState({ name: '', phone: '' });

    // Felhasználók
    const fetchUsers = async () => {
        setIsLoading(true);
        try {

            const response = await databases.listDocuments(
                DATABASE_ID,
                'users'
            );


            const loadedUsers = response.documents.map(doc => ({
                id: doc.$id,
                email: doc.email,
                name: doc.name,
                role: doc.role,
                phone: doc.phone,
                createdAt: new Date(doc.$createdAt),
                updatedAt: new Date(doc.$updatedAt)
            })) as User[];

            setUsers(loadedUsers);
        } catch (error) {
            console.error('Failed to fetch users:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleDelete = (user: User) => {
        setSelectedUser(user);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (selectedUser) {
            try {
                // Törlés
                await databases.deleteDocument(DATABASE_ID, 'users', selectedUser.id);

                // frissítés
                setUsers(users.filter(u => u.id !== selectedUser.id));
                setShowDeleteModal(false);
                setSelectedUser(null);
            } catch (error) {
                console.error('Delete failed:', error);
                alert('Törlés sikertelen. Lehet, hogy nincs jogosultságod.');
            }
        }
    };

    const handleEdit = (user: User) => {
        setSelectedUser(user);
        setEditFormData({ name: user.name, phone: user.phone || '' });
        setShowEditModal(true);
    };

    const saveEdit = async () => {
        if (!selectedUser) return;
        try {
            await authService.updateUser(selectedUser.id, editFormData);

            setUsers(users.map(u => u.id === selectedUser.id ? { ...u, ...editFormData } : u));
            setShowEditModal(false);
        } catch (error) {
            console.error('Update failed:', error);
            alert('Frissítés sikertelen.');
        }
    };

    const toggleRole = async (user: User) => {
        const newRole = user.role === 'admin' ? 'user' : 'admin';
        try {
            await databases.updateDocument(DATABASE_ID, 'users', user.id, { role: newRole });
            setUsers(users.map(u =>
                u.id === user.id ? { ...u, role: newRole } : u
            ));
        } catch (error) {
            console.error('Role toggle failed:', error);
            alert('Nem sikerült módosítani a szerepkört.');
        }
    };

    const adminCount = users.filter(u => u.role === 'admin').length;
    const userCount = users.filter(u => u.role === 'user').length;

    if (isLoading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Felhasználók kezelése</h1>
                    <p className="text-gray-500 mt-1">{users.length} regisztrált felhasználó</p>
                </div>
                <Button variant="primary" leftIcon={<Plus className="w-5 h-5" />}>
                    Új felhasználó
                </Button>
            </div>


            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <Card padding="md">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                            <Shield className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{users.length}</p>
                            <p className="text-sm text-gray-500">Összes felhasználó</p>
                        </div>
                    </div>
                </Card>
                <Card padding="md">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                            <ShieldCheck className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{adminCount}</p>
                            <p className="text-sm text-gray-500">Adminisztrátor</p>
                        </div>
                    </div>
                </Card>
                <Card padding="md" className="col-span-2 md:col-span-1">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                            <Mail className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{userCount}</p>
                            <p className="text-sm text-gray-500">Regisztrált ügyfél</p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Search */}
            <Card padding="md">
                <Input
                    placeholder="Keresés név vagy email alapján..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    leftIcon={<Search className="w-5 h-5" />}
                />
            </Card>

            {/* felhasznalok */}
            <Card padding="none" className="overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Felhasználó</th>
                            <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Email</th>
                            <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Telefon</th>
                            <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Szerepkör</th>
                            <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Regisztráció</th>
                            <th className="text-right px-6 py-4 text-sm font-semibold text-gray-900">Műveletek</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                        {filteredUsers.map((user) => (
                            <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <Avatar name={user.name} size="md" />
                                        <span className="font-medium text-gray-900">{user.name}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-gray-600">{user.email}</td>
                                <td className="px-6 py-4 text-gray-600">{user.phone || '-'}</td>
                                <td className="px-6 py-4">
                                    <button
                                        onClick={() => toggleRole(user)}
                                        className={cn(
                                            'inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium transition-colors',
                                            user.role === 'admin'
                                                ? 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        )}
                                    >
                                        {user.role === 'admin' ? (
                                            <>
                                                <ShieldCheck className="w-4 h-4" />
                                                Admin
                                            </>
                                        ) : (
                                            <>
                                                <Shield className="w-4 h-4" />
                                                Felhasználó
                                            </>
                                        )}
                                    </button>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-600">
                                    {formatDate(user.createdAt, { year: 'numeric', month: 'short', day: 'numeric' })}
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center justify-end gap-2">
                                        <button
                                            onClick={() => handleEdit(user)}
                                            className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                                            title="Szerkesztés"
                                        >
                                            <Edit2 className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(user)}
                                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Törlés"
                                            disabled={user.role === 'admin'}
                                        >
                                            <Trash2 className={cn(
                                                'w-5 h-5',
                                                user.role === 'admin' && 'opacity-30 cursor-not-allowed'
                                            )} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>

                {filteredUsers.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-gray-500">Nincs találat a keresési feltételeknek megfelelően.</p>
                    </div>
                )}
            </Card>

            {/* Delete */}
            <Modal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                title="Felhasználó törlése"
                size="sm"
            >
                <div className="space-y-4">
                    <p className="text-gray-600">
                        Biztosan törölni szeretné a következő felhasználót?
                    </p>
                    <div className="p-4 bg-gray-50 rounded-xl flex items-center gap-3">
                        <Avatar name={selectedUser?.name || ''} size="lg" />
                        <div>
                            <p className="font-semibold text-gray-900">{selectedUser?.name}</p>
                            <p className="text-sm text-gray-500">{selectedUser?.email}</p>
                        </div>
                    </div>
                    <p className="text-sm text-red-600">
                        Ez a művelet nem vonható vissza! A felhasználó adatai törlésre kerülnek az adatbázisból.
                    </p>
                    <div className="flex gap-3">
                        <Button
                            variant="secondary"
                            className="flex-1"
                            onClick={() => setShowDeleteModal(false)}
                        >
                            Mégsem
                        </Button>
                        <Button
                            variant="danger"
                            className="flex-1"
                            onClick={confirmDelete}
                        >
                            Törlés
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Edit */}
            <Modal
                isOpen={showEditModal}
                onClose={() => setShowEditModal(false)}
                title="Felhasználó szerkesztése"
                size="md"
            >
                {selectedUser && (
                    <div className="space-y-6">
                        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                            <Avatar name={selectedUser.name} size="xl" />
                            <div>
                                <p className="font-semibold text-gray-900">{selectedUser.name}</p>
                                <p className="text-sm text-gray-500">ID: {selectedUser.id}</p>
                            </div>
                        </div>

                        <Input
                            label="Teljes név"
                            value={editFormData.name}
                            onChange={e => setEditFormData({...editFormData, name: e.target.value})}
                        />

                        <Input
                            label="Email cím"
                            type="email"
                            value={selectedUser.email}
                            disabled
                            className="bg-gray-100"
                        />
                        <Input
                            label="Telefonszám"
                            value={editFormData.phone}
                            onChange={e => setEditFormData({...editFormData, phone: e.target.value})}
                            placeholder="+36 XX XXX XXXX"
                        />

                        <div className="flex gap-3 pt-4">
                            <Button
                                variant="secondary"
                                className="flex-1"
                                onClick={() => setShowEditModal(false)}
                            >
                                Mégsem
                            </Button>
                            <Button
                                variant="primary"
                                className="flex-1"
                                onClick={saveEdit}
                            >
                                Mentés
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default AdminUsers;