import { Models } from 'appwrite';
import { databases, ID, Query, DATABASE_ID } from './appwrite';
import { User } from '../types';

const USERS_COLLECTION = 'users';

interface UserDocument extends Models.Document {
    name: string;
    email: string;
    role: string;
    phone?: string;
}

export const userService = {

    async getAll(filters?: {
        role?: 'user' | 'admin';
        search?: string;
        limit?: number;
        offset?: number;
    }): Promise<{ users: User[]; total: number }> {
        try {
            const queries: string[] = [Query.orderDesc('$createdAt')];

            if (filters?.role) {
                queries.push(Query.equal('role', filters.role));
            }
            if (filters?.search) {
                queries.push(Query.search('name', filters.search));
            }
            if (filters?.limit) {
                queries.push(Query.limit(filters.limit));
            }
            if (filters?.offset) {
                queries.push(Query.offset(filters.offset));
            }

            const response = await databases.listDocuments(
                DATABASE_ID,
                USERS_COLLECTION,
                queries
            );

            return {
                users: response.documents.map(doc => this.mapDocumentToUser(doc)),
                total: response.total,
            };
        } catch (error) {
            console.error('Error fetching users:', error);
            throw error;
        }
    },


    async getById(userId: string): Promise<User | null> {
        try {
            const doc = await databases.getDocument(
                DATABASE_ID,
                USERS_COLLECTION,
                userId
            );

            return this.mapDocumentToUser(doc);
        } catch (error) {
            console.error('Error fetching user:', error);
            return null;
        }
    },


    async updateRole(userId: string, role: 'user' | 'admin'): Promise<User> {
        try {
            const doc = await databases.updateDocument(
                DATABASE_ID,
                USERS_COLLECTION,
                userId,
                { role }
            );

            return this.mapDocumentToUser(doc);
        } catch (error) {
            console.error('Error updating user role:', error);
            throw error;
        }
    },


    async update(userId: string, data: Partial<Pick<User, 'name' | 'phone' | 'role'>>): Promise<User> {
        try {
            const doc = await databases.updateDocument(
                DATABASE_ID,
                USERS_COLLECTION,
                userId,
                data
            );

            return this.mapDocumentToUser(doc);
        } catch (error) {
            console.error('Error updating user:', error);
            throw error;
        }
    },


    async delete(userId: string): Promise<void> {
        try {
            await databases.deleteDocument(
                DATABASE_ID,
                USERS_COLLECTION,
                userId
            );
        } catch (error) {
            console.error('Error deleting user:', error);
            throw error;
        }
    },


    async getStats(): Promise<{
        total: number;
        users: number;
        admins: number;
        newThisMonth: number;
    }> {
        try {
            const [all, admins] = await Promise.all([
                databases.listDocuments(DATABASE_ID, USERS_COLLECTION, [Query.limit(1)]),
                databases.listDocuments(DATABASE_ID, USERS_COLLECTION, [
                    Query.equal('role', 'admin'),
                    Query.limit(1),
                ]),
            ]);


            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            const newUsers = await databases.listDocuments(
                DATABASE_ID,
                USERS_COLLECTION,
                [
                    Query.greaterThan('$createdAt', thirtyDaysAgo.toISOString()),
                    Query.limit(1),
                ]
            );

            return {
                total: all.total,
                users: all.total - admins.total,
                admins: admins.total,
                newThisMonth: newUsers.total,
            };
        } catch (error) {
            console.error('Error fetching user stats:', error);
            throw error;
        }
    },


    mapDocumentToUser(doc: Models.Document): User {
        const data = doc as unknown as UserDocument;

        return {
            id: doc.$id,
            email: data.email,
            name: data.name,
            role: (data.role as 'user' | 'admin') || 'user',
            phone: data.phone,
            createdAt: new Date(doc.$createdAt),
            updatedAt: new Date(doc.$updatedAt),
        };
    },
};
