import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { motion } from 'framer-motion';

export default function AdminLogin({ onLogin }) {
    const [step, setStep] = useState(1);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Hardcoded email for admin as requested/configured
    const adminEmail = 'abdullahctmail@gmail.com';

    const sendOtp = async () => {
        setError('');
        setLoading(true);

        try {
            // Validate Username and Password against our custom table
            const { data, error: dbError } = await supabase
                .from('admin_users')
                .select('*')
                .eq('username', username)
                .eq('password_hash', password)
                .single();

            if (dbError || !data) {
                setError('Invalid username or password');
                setLoading(false);
                return;
            }

            // Generate 6-digit OTP
            const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
            const expiry = new Date(Date.now() + 5 * 60000).toISOString(); // 5 minutes

            // Save OTP securely to the DB
            await supabase
                .from('admin_users')
                .update({ current_otp: generatedOtp, otp_expiry: expiry })
                .eq('id', data.id);

            // Send OTP to Telegram seamlesslys
            const botToken = import.meta.env.VITE_TELEGRAM_BOT_TOKEN;
            const chatId = import.meta.env.VITE_TELEGRAM_CHAT_ID;

            if (botToken && chatId) {
                try {
                    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            chat_id: chatId,
                            text: `🔐 *Portfolio Admin Alert*\n\nYour Admin Login OTP is: \`${generatedOtp}\`\n\n_Valid for 5 minutes._`,
                            parse_mode: 'Markdown'
                        })
                    });
                } catch (e) {
                    console.error("Telegram error", e);
                }
            } else {
                console.warn("Telegram credentials not found in .env. Setup required.");
            }

            setStep(2);
        } catch (err) {
            setError('An error occurred. Please try again.');
        }

        setLoading(false);
    };

    const handleCredentialsSubmit = async (e) => {
        e.preventDefault();
        await sendOtp();
    };

    const handleOtpSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Verify OTP from our local database table
            const { data, error: dbError } = await supabase
                .from('admin_users')
                .select('*')
                .eq('username', username)
                .single();

            if (dbError || !data) {
                setError('Authentication failed');
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

            // Clear OTP
            await supabase
                .from('admin_users')
                .update({ current_otp: null, otp_expiry: null })
                .eq('id', data.id);

            // Give access
            localStorage.setItem('adminAuthenticated', 'true');
            localStorage.setItem('adminUsername', username);
            onLogin();

        } catch (err) {
            setError('An error occurred. Please try again.');
        }

        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-background">
            {/* Animated blobs */}
            <div className="blob blob-purple w-[400px] h-[400px] top-1/4 right-1/4 opacity-20" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
            >
                <div className="glass-card p-8 shadow-xl">
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold text-text">Admin Secure Login</h2>
                        <p className="text-text-light text-sm mt-2">
                            {step === 1 ? 'Enter your credentials to continue' : 'Enter the OTP sent to your Telegram'}
                        </p>
                    </div>

                    {error && (
                        <div className="mb-6 p-3 bg-danger/10 border border-danger/20 text-danger text-sm rounded-xl text-center font-medium">
                            {error}
                        </div>
                    )}

                    {step === 1 ? (
                        <form onSubmit={handleCredentialsSubmit} className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-text mb-2">Username</label>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="form-input"
                                    placeholder="admin"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text mb-2">Password</label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="form-input"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="btn-primary w-full justify-center mt-2 disabled:opacity-70"
                            >
                                {loading ? 'Checking...' : 'Send OTP'}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleOtpSubmit} className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-text mb-2">6-Digit OTP</label>
                                <input
                                    type="text"
                                    maxLength="6"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                    className="form-input text-center text-xl tracking-[0.5em] font-semibold"
                                    placeholder="000000"
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading || otp.length < 6}
                                className="btn-primary w-full justify-center mt-2 disabled:opacity-70"
                            >
                                {loading ? 'Verifying...' : 'Verify & Login'}
                            </button>
                            <div className="flex justify-between items-center mt-4">
                                <button
                                    type="button"
                                    onClick={() => setStep(1)}
                                    className="text-sm text-text-light hover:text-primary transition-colors"
                                >
                                    ← Back to login
                                </button>
                                <button
                                    type="button"
                                    onClick={sendOtp}
                                    disabled={loading}
                                    className="text-sm text-primary font-semibold hover:text-primary/80 transition-colors disabled:opacity-50"
                                >
                                    {loading ? 'Resending...' : 'Resend OTP'}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
