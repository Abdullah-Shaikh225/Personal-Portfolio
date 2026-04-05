import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function AdminContacts() {
    const [contacts, setContacts] = useState([]);

    useEffect(() => {
        fetchContacts();

        const channel = supabase
            .channel('contacts-realtime')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'contacts' }, (payload) => {
                if (payload.new && !payload.new.email.includes('@portfolio.local')) {
                    setContacts(prev => [payload.new, ...prev]);
                }
            })
            .subscribe();

        return () => supabase.removeChannel(channel);
    }, []);

    const fetchContacts = async () => {
        const { data } = await supabase
            .from('contacts')
            .select('*')
            .not('email', 'like', '%@portfolio.local%')
            .order('created_at', { ascending: false });
        if (data) setContacts(data);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Delete this message?')) {
            const { error } = await supabase.from('contacts').delete().eq('id', id);
            if (error) {
                console.error('Error deleting:', error);
                alert('Failed to delete: ' + error.message);
            }
            fetchContacts();
        }
    };

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-text">Contact Submissions</h1>
                <p className="text-text-light text-sm mt-1">Messages received from the contact form — updates in real-time</p>
            </div>

            <div className="admin-card overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-border">
                            <th className="text-left p-4 text-sm font-semibold text-text-light">Name</th>
                            <th className="text-left p-4 text-sm font-semibold text-text-light">Email</th>
                            <th className="text-left p-4 text-sm font-semibold text-text-light">Message</th>
                            <th className="text-left p-4 text-sm font-semibold text-text-light">Date</th>
                            <th className="text-right p-4 text-sm font-semibold text-text-light">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {contacts.map(c => (
                            <tr key={c.id} className="border-b border-border/50 hover:bg-background/50">
                                <td className="p-4 text-sm font-medium">{c.name}</td>
                                <td className="p-4 text-sm">
                                    <a href={`mailto:${c.email}`} className="text-primary hover:underline">{c.email}</a>
                                </td>
                                <td className="p-4 text-sm text-text-light max-w-[300px]">
                                    <p className="line-clamp-2">{c.message}</p>
                                </td>
                                <td className="p-4 text-sm text-text-light whitespace-nowrap">
                                    {new Date(c.created_at).toLocaleDateString('en-IN', {
                                        day: 'numeric', month: 'short', year: 'numeric',
                                        hour: '2-digit', minute: '2-digit'
                                    })}
                                </td>
                                <td className="p-4 text-right">
                                    <button onClick={() => handleDelete(c.id)} className="text-danger hover:bg-danger/5 px-3 py-1 rounded-lg text-sm cursor-pointer">
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {contacts.length === 0 && (
                            <tr><td colSpan={5} className="p-8 text-center text-text-light text-sm">No messages yet</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
