import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function AdminProjects() {
    const [projects, setProjects] = useState([]);
    const [editing, setEditing] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [file, setFile] = useState(null);
    const [form, setForm] = useState({
        title: '', description: '', tech_stack: '',
        live_link: '', order_index: 0, is_visible: true, image_url: ''
    });

    useEffect(() => { fetchProjects(); }, []);

    const fetchProjects = async () => {
        const { data } = await supabase.from('projects').select('*').order('order_index');
        if (data) setProjects(data);
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleSave = async () => {
        setUploading(true);
        let finalImageUrl = form.image_url;

        // Handle file upload to Supabase Storage
        if (file) {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from('project-logos')
                .upload(fileName, file);

            if (!uploadError) {
                const { data } = supabase.storage.from('project-logos').getPublicUrl(fileName);
                finalImageUrl = data.publicUrl;
            } else {
                alert('Image upload failed. Please ensure the Supabase bucket "project-logos" is created and public.');
            }
        }

        const payload = {
            title: form.title,
            description: form.description,
            live_link: form.live_link,
            image_url: finalImageUrl,
            is_visible: form.is_visible,
            tech_stack: form.tech_stack.split(',').map(s => s.trim()).filter(Boolean),
            order_index: parseInt(form.order_index) || 0
        };

        if (editing) {
            await supabase.from('projects').update(payload).eq('id', editing);
        } else {
            await supabase.from('projects').insert(payload);
        }

        setUploading(false);
        resetForm();
        fetchProjects();
    };

    const handleEdit = (project) => {
        setForm({
            title: project.title,
            description: project.description,
            tech_stack: (project.tech_stack || []).join(', '),
            live_link: project.live_link || '',
            image_url: project.image_url || '',
            is_visible: project.is_visible !== false,
            order_index: project.order_index || 0
        });
        setEditing(project.id);
        setFile(null);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Delete this project?')) {
            const { error } = await supabase.from('projects').delete().eq('id', id);
            if (error) {
                console.error('Error deleting:', error);
                alert('Failed to delete: ' + error.message);
            }
            fetchProjects();
        }
    };

    const resetForm = () => {
        setForm({ title: '', description: '', tech_stack: '', live_link: '', order_index: 0, is_visible: true, image_url: '' });
        setEditing(null);
        setFile(null);
        setShowForm(false);
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-text">Projects</h1>
                    <p className="text-text-light text-sm mt-1">Manage your portfolio projects</p>
                </div>
                <button onClick={() => { resetForm(); setShowForm(true); }} className="btn-primary text-sm">
                    + Add Project
                </button>
            </div>

            {/* Form Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
                        <h2 className="text-lg font-bold mb-4">{editing ? 'Edit Project' : 'Add Project'}</h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Title</label>
                                    <input className="form-input" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Description</label>
                                    <textarea className="form-input min-h-[100px] resize-none" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Tech Stack (comma separated)</label>
                                    <input className="form-input" value={form.tech_stack} onChange={e => setForm({ ...form, tech_stack: e.target.value })} placeholder="React, Node.js, MongoDB" />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Logo Image Upload</label>
                                    {form.image_url && !file && (
                                        <div className="mb-2">
                                            <img src={form.image_url} alt="Current logo" className="w-16 h-16 rounded-xl object-cover border border-border" />
                                        </div>
                                    )}
                                    <input type="file" accept="image/*" onChange={handleFileChange} className="form-input text-sm p-2" />
                                    <p className="text-xs text-text-light mt-1">Select a JPG/PNG to upload to Supabase storage.</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Live Link (Optional)</label>
                                    <input className="form-input" value={form.live_link} onChange={e => setForm({ ...form, live_link: e.target.value })} placeholder="https://..." />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Order Index</label>
                                    <input className="form-input" type="number" value={form.order_index} onChange={e => setForm({ ...form, order_index: e.target.value })} />
                                </div>
                                <div className="flex items-center gap-2 mt-4">
                                    <input type="checkbox" id="visibilityToggle" checked={form.is_visible} onChange={e => setForm({ ...form, is_visible: e.target.checked })} className="w-4 h-4 cursor-pointer" />
                                    <label htmlFor="visibilityToggle" className="text-sm font-medium cursor-pointer">Show project on website</label>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-8">
                            <button onClick={handleSave} disabled={uploading} className="btn-primary flex-1 justify-center text-sm">
                                {uploading ? 'Saving...' : 'Save'}
                            </button>
                            <button onClick={resetForm} disabled={uploading} className="btn-secondary flex-1 justify-center text-sm">
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Table */}
            <div className="admin-card overflow-hidden mt-6">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-border">
                            <th className="text-left p-4 text-sm font-semibold text-text-light">Logo & Title</th>
                            <th className="text-left p-4 text-sm font-semibold text-text-light w-[100px]">Visibility</th>
                            <th className="text-left p-4 text-sm font-semibold text-text-light">Tech Stack</th>
                            <th className="text-right p-4 text-sm font-semibold text-text-light">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {projects.map((p) => (
                            <tr key={p.id} className="border-b border-border/50 hover:bg-background/50 transition-colors">
                                <td className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-border/30 flex shrink-0 items-center justify-center overflow-hidden">
                                            {p.image_url ? (
                                                <img src={p.image_url} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-xs text-text-light">No img</span>
                                            )}
                                        </div>
                                        <span className="text-sm font-medium">{p.title}</span>
                                    </div>
                                </td>
                                <td className="p-4 text-sm">
                                    <span className={`px-2 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${p.is_visible !== false ? 'bg-success/10 text-success' : 'bg-text-light/10 text-text-light'}`}>
                                        {p.is_visible !== false ? 'Visible' : 'Hidden'}
                                    </span>
                                </td>
                                <td className="p-4">
                                    <div className="flex flex-wrap gap-1">
                                        {(p.tech_stack || []).slice(0, 3).map(t => (
                                            <span key={t} className="tech-tag text-[10px] px-2 py-0.5">{t}</span>
                                        ))}
                                    </div>
                                </td>
                                <td className="p-4 text-right whitespace-nowrap">
                                    <button onClick={() => handleEdit(p)} className="text-primary hover:bg-primary/5 px-3 py-1.5 rounded-lg text-sm transition-colors cursor-pointer font-medium">Edit</button>
                                    <button onClick={() => handleDelete(p.id)} className="text-danger hover:bg-danger/5 px-3 py-1.5 rounded-lg text-sm ml-1 transition-colors cursor-pointer font-medium">Delete</button>
                                </td>
                            </tr>
                        ))}
                        {projects.length === 0 && (
                            <tr><td colSpan={4} className="p-8 text-center text-text-light text-sm">No projects yet</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
