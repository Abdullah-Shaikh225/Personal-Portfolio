import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';

export default function AdminProfile() {
    const [imageUrl, setImageUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    const fileInputRef = useRef(null);

    useEffect(() => {
        fetchProfileImage();
    }, []);

    const fetchProfileImage = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('contacts')
            .select('message')
            .eq('email', 'system@portfolio.local')
            .eq('name', 'SITE_PROFILE_IMAGE')
            .single();

        if (data && !error) {
            setImageUrl(data.message);
        }
        setLoading(false);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Ensure smaller than 2MB
        if (file.size > 2 * 1024 * 1024) {
            setMessage({ type: 'error', text: 'Image absolutely must be under 2MB to ensure fast loading.' });
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            const base64String = reader.result;
            setImageUrl(base64String);
        };
        reader.readAsDataURL(file);
    };

    const saveImage = async () => {
        if (!imageUrl) return;
        setSaving(true);
        setMessage('');

        try {
            // Check if exists
            const { data: existing } = await supabase
                .from('contacts')
                .select('id')
                .eq('email', 'system@portfolio.local')
                .eq('name', 'SITE_PROFILE_IMAGE')
                .single();

            if (existing) {
                // Update
                await supabase
                    .from('contacts')
                    .update({ message: imageUrl })
                    .eq('id', existing.id);
            } else {
                // Insert
                await supabase
                    .from('contacts')
                    .insert({
                        name: 'SITE_PROFILE_IMAGE',
                        email: 'system@portfolio.local',
                        message: imageUrl
                    });
            }

            setMessage({ type: 'success', text: 'Live Profile Image Saved Successfully!' });

            // Clean up old ones just in case there are duplicates
            if (existing) {
                await supabase
                    .from('contacts')
                    .delete()
                    .eq('email', 'system@portfolio.local')
                    .eq('name', 'SITE_PROFILE_IMAGE')
                    .neq('id', existing.id);
            }

        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to save image.' });
        }
        setSaving(false);
    };

    const removeImage = async () => {
        setSaving(true);
        await supabase
            .from('contacts')
            .delete()
            .eq('email', 'system@portfolio.local')
            .eq('name', 'SITE_PROFILE_IMAGE');

        setImageUrl('');
        setMessage({ type: 'success', text: 'Image removed successfully.' });
        setSaving(false);
    };

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-text">Profile Appearance</h1>
                <p className="text-text-light text-sm mt-1">Upload exactly what visitors see on your homepage.</p>
            </div>

            <div className="admin-card max-w-2xl">
                {message && (
                    <div className={`mb-6 p-4 rounded-xl text-sm font-semibold ${message.type === 'error' ? 'bg-danger/10 text-danger border border-danger/20' : 'bg-success/10 text-success border border-success/20'}`}>
                        {message.text}
                    </div>
                )}

                <h3 className="font-semibold text-lg mb-4">Hero Section Photo</h3>

                <div className="flex flex-col sm:flex-row gap-8 items-start">
                    {/* Image Preview Box */}
                    <div className="w-full sm:w-[250px] aspect-square rounded-[2rem] border-2 border-dashed border-border flex items-center justify-center bg-background overflow-hidden relative group">
                        {loading ? (
                            <div className="spinner"></div>
                        ) : imageUrl ? (
                            <>
                                <img src={imageUrl} alt="Profile Preview" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <button
                                        onClick={() => fileInputRef.current.click()}
                                        className="bg-white text-text font-semibold px-4 py-2 rounded-lg text-sm shadow-xl hover:scale-105 transition-transform"
                                    >
                                        Change
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="text-center p-6 flex flex-col items-center justify-center h-full text-text-light hover:text-primary transition-colors cursor-pointer" onClick={() => fileInputRef.current.click()}>
                                <svg className="w-10 h-10 mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <span>Click to Upload</span>
                            </div>
                        )}
                        <input
                            type="file"
                            accept="image/jpeg, image/png, image/webp"
                            className="hidden"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                        />
                    </div>

                    {/* Controls */}
                    <div className="flex-1 w-full space-y-4">
                        <p className="text-sm text-text-light leading-relaxed">
                            Upload a high quality studio portrait. This image automatically scales and borders itself in the Hero section's glass pane.<br /><br />
                            <strong className="text-text">Note:</strong> Maximum upload size is strictly 2MB. Use JPEG or WebP formats for best browser performance.
                        </p>

                        <div className="flex flex-wrap gap-3 pt-4">
                            <button
                                onClick={saveImage}
                                disabled={saving || !imageUrl}
                                className="btn-primary py-2.5 px-6 min-w-[120px] justify-center"
                            >
                                {saving ? <div className="spinner border-white border-t-transparent w-4 h-4"></div> : 'Publish Live'}
                            </button>

                            {imageUrl && (
                                <button
                                    onClick={removeImage}
                                    disabled={saving}
                                    className="px-6 py-2.5 rounded-xl border border-danger/20 text-danger hover:bg-danger/5 font-semibold text-sm transition-colors"
                                >
                                    Delete Image
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
