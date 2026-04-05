import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function AdminCertifications() {
    const [certs, setCerts] = useState([]);
    const [editing, setEditing] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ title: '', issuer: '', certificate_link: '' });

    useEffect(() => { fetchCerts(); }, []);

    const fetchCerts = async () => {
        const { data } = await supabase.from('certifications').select('*').order('created_at', { ascending: false });
        if (data) setCerts(data);
    };

    const handleSave = async () => {
        if (editing) {
            await supabase.from('certifications').update(form).eq('id', editing);
        } else {
            await supabase.from('certifications').insert(form);
        }
        resetForm();
        fetchCerts();
    };

    const handleEdit = (cert) => {
        setForm({ title: cert.title, issuer: cert.issuer, certificate_link: cert.certificate_link || '' });
        setEditing(cert.id);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Delete this certification?')) {
            const { error } = await supabase.from('certifications').delete().eq('id', id);
            if (error) {
                console.error('Error deleting:', error);
                alert('Failed to delete: ' + error.message);
            }
            fetchCerts();
        }
    };

    const resetForm = () => {
        setForm({ title: '', issuer: '', certificate_link: '' });
        setEditing(null);
        setShowForm(false);
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-text">Certifications</h1>
                    <p className="text-text-light text-sm mt-1">Manage your certifications and awards</p>
                </div>
                <button onClick={() => { resetForm(); setShowForm(true); }} className="btn-primary text-sm">
                    + Add Certification
                </button>
            </div>

            {showForm && (
                <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6">
                        <h2 className="text-lg font-bold mb-4">{editing ? 'Edit Certification' : 'Add Certification'}</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Title</label>
                                <input className="form-input" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Issuer</label>
                                <input className="form-input" value={form.issuer} onChange={e => setForm({ ...form, issuer: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Certificate Link</label>
                                <input className="form-input" value={form.certificate_link} onChange={e => setForm({ ...form, certificate_link: e.target.value })} placeholder="https://..." />
                            </div>
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button onClick={handleSave} className="btn-primary flex-1 justify-center text-sm">Save</button>
                            <button onClick={resetForm} className="btn-secondary flex-1 justify-center text-sm">Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            <div className="admin-card overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-border">
                            <th className="text-left p-4 text-sm font-semibold text-text-light">#</th>
                            <th className="text-left p-4 text-sm font-semibold text-text-light">Title</th>
                            <th className="text-left p-4 text-sm font-semibold text-text-light">Issuer</th>
                            <th className="text-left p-4 text-sm font-semibold text-text-light">Link</th>
                            <th className="text-right p-4 text-sm font-semibold text-text-light">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {certs.map((c, i) => (
                            <tr key={c.id} className="border-b border-border/50 hover:bg-background/50">
                                <td className="p-4 text-sm">{i + 1}</td>
                                <td className="p-4 text-sm font-medium">{c.title}</td>
                                <td className="p-4 text-sm text-text-light">{c.issuer}</td>
                                <td className="p-4 text-sm">
                                    {c.certificate_link ? (
                                        <a href={c.certificate_link} target="_blank" className="text-primary hover:underline text-xs">View ↗</a>
                                    ) : '—'}
                                </td>
                                <td className="p-4 text-right">
                                    <button onClick={() => handleEdit(c)} className="text-primary hover:bg-primary/5 px-3 py-1 rounded-lg text-sm cursor-pointer">Edit</button>
                                    <button onClick={() => handleDelete(c.id)} className="text-danger hover:bg-danger/5 px-3 py-1 rounded-lg text-sm ml-1 cursor-pointer">Delete</button>
                                </td>
                            </tr>
                        ))}
                        {certs.length === 0 && (
                            <tr><td colSpan={5} className="p-8 text-center text-text-light text-sm">No certifications yet</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
