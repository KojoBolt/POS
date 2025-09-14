import React, { useState, useEffect } from 'react';
import { auth, db } from '../../firebase/config'; 
import { onAuthStateChanged, updateProfile, reauthenticateWithCredential, EmailAuthProvider, updatePassword } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';

const Settings = () => {
    // --- State for current admin's profile ---
    const [user, setUser] = useState(null);
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    
    // --- State for password change ---
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // --- State for Adding a New User (Admin or Cashier) ---
    const [newUserName, setNewUserName] = useState('');
    const [newUserEmail, setNewUserEmail] = useState('');
    const [newUserPassword, setNewUserPassword] = useState('');
    const [newUserRole, setNewUserRole] = useState('cashier'); // Default to cashier

    // --- State for UI feedback ---
    const [loading, setLoading] = useState(true);
    const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
    const [isCreatingUser, setIsCreatingUser] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');

    // --- Fetch current admin's data ---
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                const userDocRef = doc(db, 'users', currentUser.uid);
                const userDocSnap = await getDoc(userDocRef);
                if (userDocSnap.exists()) {
                    const userData = userDocSnap.data();
                    setFirstName(userData.firstName || '');
                    setLastName(userData.lastName || '');
                    setEmail(currentUser.email);
                }
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    // --- Password Update Logic ---
    const handlePasswordUpdate = async () => {
        if (!user || !currentPassword || !newPassword) return setError("Please fill all password fields.");
        if (newPassword !== confirmPassword) return setError("New passwords do not match.");
        setIsUpdatingPassword(true);
        setError(null);
        setSuccessMessage('');
        try {
            const credential = EmailAuthProvider.credential(user.email, currentPassword);
            await reauthenticateWithCredential(user, credential);
            await updatePassword(user, newPassword);
            setSuccessMessage("Password updated successfully!");
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err) {
            setError(err.message);
        } finally {
            setIsUpdatingPassword(false);
        }
    };

    // --- Logic to handle creating a new user ---
    const handleCreateUser = async (e) => {
        e.preventDefault();
        if (!newUserName || !newUserEmail || !newUserPassword) {
            return setError("Please fill in all fields for the new user.");
        }
        setIsCreatingUser(true);
        setError(null);
        setSuccessMessage('');

        try {
            const functions = getFunctions();
            const createUser = httpsCallable(functions, 'createUserWithRole');
            const result = await createUser({
                email: newUserEmail,
                password: newUserPassword,
                name: newUserName,
                role: newUserRole, // Pass the selected role
            });

            if (result.data.success) {
                setSuccessMessage(`New ${newUserRole} created successfully!`);
                setNewUserName('');
                setNewUserEmail('');
                setNewUserPassword('');
            } else {
                throw new Error(result.data.error || "Failed to create user.");
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setIsCreatingUser(false);
        }
    };

    if (loading) {
        return <div className="p-8 ml-[300px]">Loading profile...</div>;
    }

    return (
        <div className="lg:max-w-4xl lg:mx-auto p-8 w-full overflow-x-hidden">
            <h1 className="text-3xl font-bold text-gray-900 mb-5 mt-8">Settings</h1>

            {error && <div className="my-4 p-3 text-sm text-red-700 bg-red-100 rounded-md">{error}</div>}
            {successMessage && <div className="my-4 p-3 text-sm text-green-700 bg-green-100 rounded-md">{successMessage}</div>}

            {/* --- Password Update Section --- */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
                <div className="md:col-span-1">
                    <h2 className="text-xl font-semibold text-gray-900">Update password</h2>
                    <p className="mt-1 text-sm text-gray-600">Change your account password.</p>
                </div>
                <div className="md:col-span-2">
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Current password</label>
                            <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">New password</label>
                            <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm new password</label>
                            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                        </div>
                        <div className="text-right">
                            <button onClick={handlePasswordUpdate} disabled={isUpdatingPassword} className="bg-black text-white px-6 py-3 rounded font-medium hover:bg-gray-700 disabled:bg-gray-400">
                                {isUpdatingPassword ? 'Updating...' : 'Update password'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- Add New User Section --- */}
            <hr className="my-10 border-gray-300" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-1">
                    <h2 className="text-xl font-semibold text-gray-900">Add New User</h2>
                    <p className="mt-1 text-sm text-gray-600">Create a new admin or cashier account.</p>
                </div>
                <div className="md:col-span-2">
                    <form onSubmit={handleCreateUser} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                            <input type="text" value={newUserName} onChange={(e) => setNewUserName(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                            <input type="email" value={newUserEmail} onChange={(e) => setNewUserEmail(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                            <input type="password" value={newUserPassword} onChange={(e) => setNewUserPassword(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                            <select value={newUserRole} onChange={(e) => setNewUserRole(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md">
                                <option value="admin">Admin</option>
                                <option value="cashier">Cashier</option>
                            </select>
                        </div>
                        <div className="text-right">
                            <button type="submit" disabled={isCreatingUser} className="bg-blue-600 text-white px-6 py-3 rounded font-medium hover:bg-blue-700 disabled:bg-gray-400">
                                {isCreatingUser ? 'Creating User...' : 'Create User'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Settings;
