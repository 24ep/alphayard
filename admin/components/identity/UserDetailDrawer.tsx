import React, { useState, useEffect } from 'react';
import { GlobalUser, userService } from '../../services/userService';
import { Drawer } from '../ui/Drawer';
import { Button } from '../ui/Button';
import { UserAttributesEditor } from './UserAttributesEditor';
import { toast } from '../../src/hooks/use-toast';
import { Badge } from '../ui/Badge';
import { ToggleSwitch } from '../ui/ToggleSwitch';
import { MobileGuide } from '../ui/MobileGuide';
import { 
    XMarkIcon, 
    UserIcon, 
    EnvelopeIcon, 
    TagIcon,
    Squares2X2Icon,
    ShieldCheckIcon,
    ArrowPathIcon,
    NoSymbolIcon,
    BookOpenIcon,
    CameraIcon
} from '@heroicons/react/24/outline';
import { Input } from '../ui/Input';
import { ChipField } from '../ui/ChipField';
import { MediaPickerModal } from '../../components/cms/MediaPickerModal';

interface UserDetailDrawerProps {
    userId: string | null;
    onClose: () => void;
    onUserUpdated: () => void;
}

export const UserDetailDrawer: React.FC<UserDetailDrawerProps> = ({ userId, onClose, onUserUpdated }) => {
    const [user, setUser] = useState<GlobalUser | null>(null);
    const [activeTab, setActiveTab] = useState<'profile' | 'apps' | 'attributes'>('profile');
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [showAvatarPicker, setShowAvatarPicker] = useState(false);

    useEffect(() => {
        if (userId) {
            loadUser(userId);
        } else {
            setUser(null);
        }
    }, [userId]);

    const loadUser = async (id: string) => {
        setLoading(true);
        try {
            const data = await userService.getUserById(id);
            setUser(data || null);
        } catch (e) {
            toast({ title: "Error", description: "Failed to load user details", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (updates: Partial<GlobalUser>) => {
        if (!user) return;
        setSaving(true);
        try {
            const updatedUser = await userService.updateUser(user.id, updates);
            setUser(updatedUser);
            onUserUpdated();
            toast({ title: "Updated", description: "User details saved successfully." });
        } catch (e) {
            toast({ title: "Error", description: "Failed to save changes", variant: "destructive" });
        } finally {
            setSaving(false);
        }
    };

    if (!userId) return null;

    return (
        <Drawer 
            isOpen={!!userId} 
            onClose={onClose} 
            side="right" 
            hideHeader 
            noPadding
            className="max-w-xl"
        >
            {loading || !user ? (
                <div className="flex-1 flex items-center justify-center">
                    <div className="animate-spin h-8 w-8 border-2 border-blue-600 rounded-full border-t-transparent"></div>
                </div>
            ) : (
                <>
                    {/* Header */}
                    <div className="relative h-32 bg-gradient-to-r from-blue-600 to-indigo-700 shrink-0">
                        <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-black/10 hover:bg-black/20 rounded-full transition-colors text-white backdrop-blur-sm">
                            <XMarkIcon className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="relative z-20 px-8 -mt-12 pb-6 border-b border-gray-100 flex items-end justify-between">
                        <div className="flex items-end gap-5">
                            <div className="relative group">
                                <div className="h-24 w-24 rounded-2xl bg-white p-1.5 shadow-xl shadow-blue-900/10 cursor-pointer" onClick={() => setShowAvatarPicker(true)}>
                                    {user.avatarUrl ? (
                                        <img src={user.avatarUrl} className="w-full h-full rounded-xl object-cover" alt="" />
                                    ) : (
                                        <div className="w-full h-full rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-3xl font-bold">
                                            {user.firstName[0]}
                                        </div>
                                    )}
                                    
                                    {/* Edit Overlay */}
                                    <div className="absolute inset-0 m-1.5 bg-black/50 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                                        <CameraIcon className="w-8 h-8 text-white" />
                                    </div>
                                </div>
                            </div>
                            
                            <div className="mb-1">
                                <h2 className="text-2xl font-bold text-gray-900 leading-tight">{user.firstName} {user.lastName}</h2>
                                <div className="flex items-center gap-2 mt-1">
                                    <Badge variant={user.status === 'active' ? 'success' : user.status === 'banned' ? 'error' : 'warning'}>
                                        {user.status}
                                    </Badge>
                                    <span className="text-sm text-gray-500">• Member since {new Date(user.createdAt).getFullYear()}</span>
                                    <MobileGuide 
                                        title="User Data Reference"
                                        buttonLabel="Dev Guide"
                                        buttonVariant="labeled"
                                        className="h-7 px-2 ml-2"
                                        idLabel="User Global ID"
                                        idValue={user.id}
                                        usageExample={`// Get this user details
const user = await userService.getUserById('${user.id}');

// Update user status
await userService.updateUser('${user.id}', { status: 'inactive' });`}
                                        devNote="This ID is the primary key and is essential for all user-related relations (Circles, Messages, etc.)."
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex border-b border-gray-100 px-8 bg-white z-10 overflow-x-auto no-scrollbar">
                        <TabButton id="profile" icon={<UserIcon className="w-4 h-4" />} label="Profile" active={activeTab} onClick={setActiveTab} />
                        <TabButton id="apps" icon={<Squares2X2Icon className="w-4 h-4" />} label={`Connected Apps`} active={activeTab} onClick={setActiveTab} />
                        <TabButton id="attributes" icon={<ShieldCheckIcon className="w-4 h-4" />} label="Admin Data" active={activeTab} onClick={setActiveTab} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-8 bg-gray-50/30">
                        {activeTab === 'profile' && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <section>
                                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Basic Information</h3>
                                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <Input label="First Name" value={user.firstName} onChange={e => handleSave({ firstName: e.target.value })} />
                                            <Input label="Last Name" value={user.lastName} onChange={e => handleSave({ lastName: e.target.value })} />
                                        </div>
                                        <div className="relative">
                                            <EnvelopeIcon className="w-4 h-4 absolute right-3 top-[34px] text-gray-400" />
                                            <Input label="Email Address" value={user.email} onChange={e => handleSave({ email: e.target.value })} />
                                        </div>
                                    </div>
                                </section>

                                <section>
                                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Account Management</h3>
                                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden divide-y divide-gray-50">
                                        <div className="p-5">
                                            <ToggleSwitch 
                                                checked={user.status === 'active'}
                                                onChange={checked => handleSave({ status: checked ? 'active' : 'inactive' })}
                                                label="Account Status"
                                                description="Disable to block all application access immediately."
                                            />
                                        </div>
                                        <div className="p-5 flex items-center justify-between">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-slate-900">Email Verification</span>
                                                <span className="text-xs text-slate-500">Enable if the user has verified their email.</span>
                                            </div>
                                            <Badge variant={user.isVerified ? 'success' : 'warning'}>
                                                {user.isVerified ? 'Verified' : 'Pending'}
                                            </Badge>
                                        </div>
                                    </div>
                                </section>

                                <section>
                                     <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Tags & Categories</h3>
                                     <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                                         <ChipField 
                                            chips={user.tags || []} 
                                            onChange={tags => handleSave({ tags })} 
                                            placeholder="Add tag..." 
                                         />
                                     </div>
                                </section>

                                <div className="flex gap-4 pt-4">
                                    <Button variant="outline" className="flex-1 h-11"><ArrowPathIcon className="w-4 h-4 mr-2" /> Reset Password</Button>
                                    <Button 
                                        variant="ghost" 
                                        className="flex-1 h-11 text-red-600 hover:text-red-700 hover:bg-red-50"
                                        onClick={() => handleSave({ status: user.status === 'banned' ? 'active' : 'banned' })}
                                    >
                                        <NoSymbolIcon className="w-4 h-4 mr-2" />
                                        {user.status === 'banned' ? 'Revoke Ban' : 'Permanent Ban'}
                                    </Button>
                                </div>
                            </div>
                        )}

                        {activeTab === 'apps' && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                {(!user.apps || user.apps.length === 0) ? (
                                    <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
                                        <Squares2X2Icon className="w-12 h-12 mx-auto mb-3 text-gray-200" />
                                        <p className="text-gray-400 font-medium">No applications connected.</p>
                                    </div>
                                ) : user.apps.map(app => (
                                    <div key={app.appId} className="flex items-center p-5 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                        <div className="h-12 w-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center font-bold shadow-inner mr-4">
                                            {app.appName[0]}
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-bold text-gray-900">{app.appName}</h4>
                                            <p className="text-xs text-gray-500">Member since {new Date(app.joinedAt).toLocaleDateString()}</p>
                                        </div>
                                        <Badge variant="info" size="sm" className="capitalize">
                                            {app.role}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        )}

                        {activeTab === 'attributes' && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <div className="bg-blue-600 rounded-2xl p-6 text-white shadow-lg shadow-blue-200">
                                    <h4 className="font-bold mb-2 flex items-center gap-2">
                                        <TagIcon className="w-5 h-5" />
                                        Advanced Metadata
                                    </h4>
                                    <p className="text-sm text-blue-100">
                                        These attributes define custom behavior for the user across different app environments.
                                    </p>
                                </div>
                                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                                    <UserAttributesEditor 
                                        attributes={Object.entries(user.attributes || {}).map(([key, value]) => ({ key, value }))}
                                        onChange={attrs => {
                                            const newAttributes = attrs.reduce((acc, curr) => ({ ...acc, [curr.key]: curr.value }), {});
                                            handleSave({ attributes: newAttributes });
                                        }}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </>
            )}

            <MediaPickerModal 
                isOpen={showAvatarPicker}
                onClose={() => setShowAvatarPicker(false)}
                onSelect={(file) => handleSave({ avatarUrl: file.url })}
                title="Update Avatar"
            />
        </Drawer>
    );
};

const TabButton = ({ id, label, icon, active, onClick }: any) => (
    <button
        onClick={() => onClick(id)}
        className={`px-6 py-4 text-sm font-bold transition-all flex items-center gap-2 border-b-2 whitespace-nowrap shrink-0 ${
            active === id 
                ? 'border-blue-600 text-blue-600' 
                : 'border-transparent text-gray-400 hover:text-gray-600 hover:border-gray-200'
        }`}
    >
        {icon}
        {label}
    </button>
);
