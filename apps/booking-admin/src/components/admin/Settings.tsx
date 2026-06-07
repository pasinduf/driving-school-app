import { useState } from 'react';
import { Settings as SettingsIcon } from 'lucide-react';
import ImagesTab from './settings/ImagesTab';
import GeneralTab from './settings/GeneralTab';
import OthersTab from './settings/OthersTab';

export default function Settings() {
    const [activeTab, setActiveTab] = useState<'images' | 'general' | 'others'>('general');

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <SettingsIcon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Company Settings</h2>
                        <p className="text-sm text-gray-500">Manage your company's visual branding and configurations.</p>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="flex border-b">
                    {[
                        { id: 'general', label: 'General' },
                        { id: 'images', label: 'Logo & Carousel' },
                        { id: 'others', label: 'Others' }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`px-6 py-4 text-sm font-medium transition-colors border-b-2 ${activeTab === tab.id ? 'border-primary text-primary bg-primary/5' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="p-8">
                    {activeTab === 'images' && <ImagesTab />}
                    {activeTab === 'general' && <GeneralTab />}
                    {activeTab === 'others' && <OthersTab />}
                </div>
            </div>
        </div>
    );
}
