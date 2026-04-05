import { supabase, isSupabaseConfigured } from './supabase';

// Generate unique visitor ID
const getVisitorId = () => {
    let id = localStorage.getItem('visitor_id');
    if (!id) {
        id = 'v_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
        localStorage.setItem('visitor_id', id);
    }
    return id;
};

// Detect device type
const getDeviceType = () => {
    const ua = navigator.userAgent;
    if (/tablet|ipad|playbook|silk/i.test(ua)) return 'tablet';
    if (/mobile|iphone|ipod|android|blackberry|opera mini|iemobile/i.test(ua)) return 'mobile';
    return 'desktop';
};

// Detect browser
const getBrowser = () => {
    const ua = navigator.userAgent;
    if (ua.includes('Firefox')) return 'Firefox';
    if (ua.includes('SamsungBrowser')) return 'Samsung Browser';
    if (ua.includes('Opera') || ua.includes('OPR')) return 'Opera';
    if (ua.includes('Trident')) return 'IE';
    if (ua.includes('Edg')) return 'Edge';
    if (ua.includes('Chrome')) return 'Chrome';
    if (ua.includes('Safari')) return 'Safari';
    return 'Unknown';
};

// Get referrer source
const getReferrerSource = () => {
    const ref = document.referrer;
    if (!ref) return 'direct';
    if (ref.includes('linkedin.com')) return 'LinkedIn';
    if (ref.includes('google.com') || ref.includes('google.co')) return 'Google';
    if (ref.includes('github.com')) return 'GitHub';
    if (ref.includes('wa.me') || ref.includes('whatsapp.com') || ref.includes('api.whatsapp.com')) return 'WhatsApp';
    if (ref.includes('t.me') || ref.includes('telegram')) return 'Telegram';
    if (ref.includes('twitter.com') || ref.includes('x.com')) return 'Twitter/X';
    if (ref.includes('facebook.com') || ref.includes('fb.com')) return 'Facebook';
    if (ref.includes('instagram.com')) return 'Instagram';
    try {
        return new URL(ref).hostname;
    } catch {
        return ref;
    }
};

// Get location from free IP API
const getLocation = async () => {
    try {
        const res = await fetch('http://ip-api.com/json/?fields=country,city');
        if (res.ok) {
            const data = await res.json();
            return { country: data.country || 'Unknown', city: data.city || 'Unknown' };
        }
    } catch (e) {
        // silently fail
    }
    return { country: 'Unknown', city: 'Unknown' };
};

// Track page visit
export const trackPageVisit = async (pageName = 'home') => {
    if (!isSupabaseConfigured()) return;

    const location = await getLocation();

    try {
        await supabase.from('analytics').insert({
            page_name: pageName,
            device_type: getDeviceType(),
            browser: getBrowser(),
            country: location.country,
            city: location.city,
            referrer: getReferrerSource(),
            event_type: 'page_visit'
        });
    } catch (e) {
        console.error('Analytics error:', e);
    }
};

// Track section view
export const trackSectionView = async (sectionName) => {
    if (!isSupabaseConfigured()) return;

    try {
        await supabase.from('analytics').insert({
            section: sectionName,
            device_type: getDeviceType(),
            browser: getBrowser(),
            event_type: 'section_view'
        });
    } catch (e) {
        console.error('Analytics error:', e);
    }
};

// Track project click
export const trackProjectClick = async (projectId) => {
    if (!isSupabaseConfigured()) return;

    try {
        await supabase.from('analytics').insert({
            event_type: 'project_click',
            project_id: projectId,
            device_type: getDeviceType(),
            browser: getBrowser()
        });
    } catch (e) {
        console.error('Analytics error:', e);
    }
};

// Track CV download
export const trackCVDownload = async () => {
    if (!isSupabaseConfigured()) return;

    try {
        await supabase.from('cv_downloads').insert({
            device_type: getDeviceType(),
            browser: getBrowser()
        });
    } catch (e) {
        console.error('Analytics error:', e);
    }
};

// Heartbeat for active visitor tracking
let heartbeatInterval = null;

export const startVisitorHeartbeat = () => {
    if (!isSupabaseConfigured()) return;

    const visitorId = getVisitorId();

    const sendHeartbeat = async () => {
        try {
            await supabase.from('active_visitors').upsert({
                visitor_id: visitorId,
                last_seen: new Date().toISOString(),
                page_name: window.location.pathname
            }, { onConflict: 'visitor_id' });
        } catch (e) {
            // silently fail
        }
    };

    sendHeartbeat();
    heartbeatInterval = setInterval(sendHeartbeat, 30000); // every 30s
};

export const stopVisitorHeartbeat = async () => {
    if (heartbeatInterval) clearInterval(heartbeatInterval);
    if (!isSupabaseConfigured()) return;

    const visitorId = getVisitorId();
    try {
        await supabase.from('active_visitors').delete().eq('visitor_id', visitorId);
    } catch (e) {
        // silently fail
    }
};

// Setup Intersection Observer for section tracking
export const setupSectionTracking = () => {
    if (!isSupabaseConfigured()) return;

    const trackedSections = new Set();

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting && !trackedSections.has(entry.target.id)) {
                    trackedSections.add(entry.target.id);
                    trackSectionView(entry.target.id);
                }
            });
        },
        { threshold: 0.3 }
    );

    // Observe all sections after a small delay (for DOM to be ready)
    setTimeout(() => {
        const sections = document.querySelectorAll('section[id]');
        sections.forEach((section) => observer.observe(section));
    }, 1000);

    return observer;
};
