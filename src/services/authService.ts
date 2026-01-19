import { account, databases, ID, DATABASE_ID } from './appwrite';
import { User } from '../types';

const USERS_COLLECTION = 'users';

// Típusdefiníció a hibakezeléshez
interface AppwriteError {
    code: number;
    message: string;
}

export const authService = {

    async login(email: string, password: string) {
        try {

            try {
                const currentSession = await account.getSession('current');

                return currentSession;
            } catch {

                const newSession = await account.createEmailPasswordSession(email, password);
                return newSession;
            }
        } catch (error) {
            console.error('Login error:', error);
            throw new Error('Hibás email cím vagy jelszó.');
        }
    },


    async register(email: string, password: string, name: string): Promise<User> {
        try {

            const newAccount = await account.create(
                ID.unique(),
                email,
                password,
                name
            );


            await this.login(email, password);


            await databases.createDocument(
                DATABASE_ID,
                USERS_COLLECTION,
                newAccount.$id,
                {
                    name,
                    email,
                    role: 'user',

                }
            );

            const now = new Date();

            return {
                id: newAccount.$id,
                email,
                name,
                role: 'user',
                createdAt: now,
                updatedAt: now,
            };
        } catch (error) {
            console.error('Registration error:', error);

            const appwriteError = error as AppwriteError;
            if (appwriteError.code === 409) {
                throw new Error('Ez az email cím már regisztrálva van.');
            }
            throw error;
        }
    },


    async logout(): Promise<void> {
        try {
            await account.deleteSession('current');
        } catch (error) {

            console.warn('Logout warning (session might be already expired):', error);
        }
    },


    async getCurrentUser(): Promise<User | null> {
        try {

            const appwriteUser = await account.get();


            const userData = await databases.getDocument(
                DATABASE_ID,
                USERS_COLLECTION,
                appwriteUser.$id
            );

            return {
                id: appwriteUser.$id,
                email: appwriteUser.email,
                name: appwriteUser.name,
                role: userData.role as 'user' | 'admin',
                phone: userData.phone as string | undefined,
                createdAt: new Date(userData.$createdAt),
                updatedAt: new Date(userData.$updatedAt),
            };
        } catch (error) {
            const appwriteError = error as AppwriteError;

            if (appwriteError?.code === 404) {
                console.warn('User authenticated but no profile found. Logging out cleanup...');
                await this.logout(); // Kényszerített kijelentkezés
                return null;
            }


            if (appwriteError?.code !== 401) {
                console.warn('Get current user check failed:', error);
            }
            return null;
        }
    },


    async updateUser(userId: string, data: Partial<Pick<User, 'name' | 'phone'>>): Promise<User> {
        try {
            if (data.name) {
                await account.updateName(data.name);
            }

            const updated = await databases.updateDocument(
                DATABASE_ID,
                USERS_COLLECTION,
                userId,
                data
            );

            return {
                id: updated.$id,
                email: updated.email,
                name: updated.name,
                role: updated.role as 'user' | 'admin',
                phone: updated.phone as string | undefined,
                createdAt: new Date(updated.$createdAt),
                updatedAt: new Date(updated.$updatedAt),
            };
        } catch (error) {
            console.error('Update user error:', error);
            throw new Error('Nem sikerült frissíteni az adatokat.');
        }
    },


    async updatePassword(oldPassword: string, newPassword: string): Promise<void> {
        try {
            await account.updatePassword(newPassword, oldPassword);
        } catch (error) {
            console.error('Update password error:', error);
            throw new Error('A régi jelszó helytelen, vagy az új jelszó túl gyenge.');
        }
    },


    async sendPasswordRecovery(email: string): Promise<void> {
        try {
            await account.createRecovery(
                email,
                `${window.location.origin}/reset-password`
            );
        } catch (error) {
            console.error('Password recovery error:', error);
        }
    },


    async confirmPasswordRecovery(userId: string, secret: string, newPassword: string): Promise<void> {
        try {
            await account.updateRecovery(userId, secret, newPassword);
        } catch (error) {
            console.error('Confirm password recovery error:', error);
            throw error;
        }
    },
};