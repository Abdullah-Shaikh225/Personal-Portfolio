import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const categories = ['Languages', 'Frameworks', 'Tools', 'Soft Skills'];

export default function AdminSkills() {
    const [skills, setSkills] = useState([]);
    const [editing, setEditing] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ name: '', category: 'Languages', level: 3 });

    useEffect(() => { fetchSkills(); }, []);

    const fetchSkills = async () => {
        const { data } = await supabase.from('skills').select('*').order('category');
        if (data) setSkills(data);
    };

    const handleSave = async () => {
        const payload = { ...form, level: parseInt(form.level) };
        if (editing) {
            await supabase.from('skills').update(payload).eq('id', editing);
        } else {
            await supabase.from('skills').insert(payload);
        }
        resetForm();
        fetchSkills();
    };

    const handleEdit = (skill) => {
        setForm({ name: skill.name, category: skill.category, level: skill.level });
        setEditing(skill.id);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Delete this skill?')) {
            const { error } = await supabase.from('skills').delete().eq('id', id);
            if (error) {
                console.error('Error deleting:', error);
                alert('Failed to delete: ' + error.message);
            }
            fetchSkills();
        }
    };

    const resetForm = () => {
        setForm({ name: '', category: 'Languages', level: 3 });
        setEditing(null);
        setShowForm(false);
    };

    const groupedSkills = categories.map(cat => ({
        category: cat,
        items: skills.filter(s => s.category === cat)
    })).filter(g => g.items.length > 0);

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-text">Skills</h1>
                    <p className="text-text-light text-sm mt-1">Manage your skills and proficiency levels</p>
                </div>
                <button onClick={() => { resetForm(); setShowForm(true); }} className="btn-primary text-sm">
                    + Add Skill
                </button>
            </div>

            {showForm && (
                <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6">
                        <h2 className="text-lg font-bold mb-4">{editing ? 'Edit Skill' : 'Add Skill'}</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Name</label>
                                <input className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Category</label>
                                <select className="form-input" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Level (1-5)</label>
                                <input className="form-input" type="number" min="1" max="5" value={form.level} onChange={e => setForm({ ...form, level: e.target.value })} />
                            </div>
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button onClick={handleSave} className="btn-primary flex-1 justify-center text-sm">Save</button>
                            <button onClick={resetForm} className="btn-secondary flex-1 justify-center text-sm">Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid sm:grid-cols-2 gap-6">
                {groupedSkills.map(group => (
                    <div key={group.category} className="admin-card">
                        <h3 className="font-bold text-lg mb-4">{group.category}</h3>
                        <div className="space-y-3">
                            {group.items.map(skill => (
                                <div key={skill.id} className="flex items-center justify-between p-3 rounded-xl bg-background/50 hover:bg-background">
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm font-medium">{skill.name}</span>
                                        <div className="flex gap-1">
                                            {[1, 2, 3, 4, 5].map(d => (
                                                <div key={d} className={`w-2 h-2 rounded-full ${d <= skill.level ? 'bg-primary' : 'bg-border'}`} />
                                            ))}
                                        </div>
                                    </div>
                                    <div className="flex gap-1">
                                        <button onClick={() => handleEdit(skill)} className="text-primary hover:bg-primary/5 px-2 py-1 rounded text-xs cursor-pointer">Edit</button>
                                        <button onClick={() => handleDelete(skill.id)} className="text-danger hover:bg-danger/5 px-2 py-1 rounded text-xs cursor-pointer">Del</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
