import { useState } from 'react';
import { supabase } from '../lib/supabase';

export default function AdminSettings() {
    const [step, setStep] = useState(1);
    const [newUsername, setNewUsername] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const adminEmail = 'abdullahctmail@gmail.com';

    const requestOtp = async () => {
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            const currentUsername = localStorage.getItem('adminUsername');
            if (!currentUsername) {
                setError('You are not logged in properly.');
                setLoading(false);
                return;
            }

            // Retrieve user
            const { data, error: dbError } = await supabase
                .from('admin_users')
                .select('id')
                .eq('username', currentUsername)
                .single();

            if (dbError || !data) {
                setError('Could not verify account.');
                setLoading(false);
                return;
            }

            // Generate OTP
            const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
            const expiry = new Date(Date.now() + 5 * 60000).toISOString();

            // Save seamlessly to the admin_users table under current_otp
            await supabase
                .from('admin_users')
                .update({ current_otp: generatedOtp, otp_expiry: expiry })
                .eq('id', data.id);

            // Send OTP to Telegram
            const botToken = import.meta.env.VITE_TELEGRAM_BOT_TOKEN;
            const chatId = import.meta.env.VITE_TELEGRAM_CHAT_ID;

            if (botToken && chatId) {
                try {
                    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            chat_id: chatId,
                            text: `⚠️ *Security Alert*\n\nYour OTP to change admin credentials is: \`${generatedOtp}\`\n\n_Valid for 5 minutes._`,
                            parse_mode: 'Markdown'
                        })
                    });
                } catch (e) {
                    console.error("Telegram error", e);
                }
            }

            setStep(2);
        } catch (err) {
            setError('An error occurred requesting OTP.');
        }

        setLoading(false);
    };

    const handleRequestChange = async (e) => {
        e.preventDefault();
        await requestOtp();
    };

    const handleVerifyAndChange = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            const currentUsername = localStorage.getItem('adminUsername');

            // Verify OTP from local DB
            const { data, error: dbError } = await supabase
                .from('admin_users')
                .select('*')
                .eq('username', currentUsername)
                .single();

            if (dbError || !data) {
                setError('Account validation failed');
                setLoading(false);
                return;
            }

            if (data.current_otp !== otp) {
                setError('Invalid OTP');
                setLoading(false);
                return;
            }

            if (new Date() > new Date(data.otp_expiry)) {
                setError('OTP has expired');
                setLoading(false);
                return;
            }

            // Update Credentials and clear OTP in custom table
            await supabase
                .from('admin_users')
                .update({
                    username: newUsername,
                    password_hash: newPassword,
                    current_otp: null,
                    otp_expiry: null
                })
                .eq('id', data.id);

            // Update local storage
            localStorage.setItem('adminUsername', newUsername);

            setSuccess('Credentials updated successfully!');
            setStep(1);
            setNewUsername('');
            setNewPassword('');
            setOtp('');

        } catch (err) {
            setError('An error occurred during verification.');
        }

        setLoading(false);
    };

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-text">Security Settings</h1>
                <p className="text-text-light text-sm mt-1">Change your admin username and password using OTP</p>
            </div>

            <div className="admin-card max-w-lg">
                {error && (
                    <div className="mb-6 p-3 bg-danger/10 border border-danger/20 text-danger text-sm rounded-xl font-medium">
                        {error}
                    </div>
                )}
                {success && (
                    <div className="mb-6 p-3 bg-success/10 border border-success/20 text-success text-sm rounded-xl font-medium">
                        {success}
                    </div>
                )}

                {step === 1 ? (
                    <form onSubmit={handleRequestChange} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">New Username</label>
                            <input
                                className="form-input"
                                value={newUsername}
                                onChange={e => setNewUsername(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">New Password</label>
                            <input
                                className="form-input"
                                type="password"
                                value={newPassword}
                                onChange={e => setNewPassword(e.target.value)}
                                required
                            />
                        </div>
                        <p className="text-xs text-text-light mt-2 mb-4">
                            Your secure OTP will be dispatched to your Telegram app to confirm these changes.
                        </p>
                        <button
                            type="submit"
                            disabled={loading || !newUsername || !newPassword}
                            className="btn-primary w-full justify-center text-sm"
                        >
                            {loading ? 'Requesting...' : 'Request Change (Send OTP)'}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleVerifyAndChange} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1 flex justify-between">
                                <span>Enter 6-Digit OTP</span>
                                <span className="text-primary text-xs flex items-center justify-end overflow-hidden max-w-[200px] truncate">
                                    Check Telegram
                                </span>
                            </label>
                            <input
                                type="text"
                                maxLength="6"
                                value={otp}
                                onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                                className="form-input text-center tracking-[0.3em] font-semibold text-lg"
                                placeholder="000000"
                                required
                            />
                        </div>
                        <div className="flex gap-3 pt-2">
                            <button
                                type="submit"
                                disabled={loading || otp.length < 6}
                                className="btn-primary flex-1 justify-center text-sm"
                            >
                                {loading ? 'Verifying...' : 'Verify & Change'}
                            </button>
                            <button
                                type="button"
                                onClick={requestOtp}
                                disabled={loading}
                                className="btn-secondary flex-1 justify-center text-sm"
                            >
                                {loading ? '...' : 'Resend OTP'}
                            </button>
                        </div>
                        <button
                            type="button"
                            onClick={() => setStep(1)}
                            className="text-sm text-text-light hover:text-primary w-full text-center mt-3 transition-colors block"
                        >
                            Cancel
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
