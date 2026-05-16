import { useState, useEffect, useCallback } from 'react';
import Button from '../../ui/Button.jsx';
import Card from '../../ui/Card.jsx';
import Modal from '../../ui/Modal.jsx';
import ImageUpload from '../../blog/ImageUpload.jsx';
import Swal from 'sweetalert2';
import * as eventsApi from '../../services/eventsApi.js';
import { fileToDataUrlForStorage } from '../../utils/fileToDataUrlForStorage.js';

const TYPE_OPTIONS = [
    { label: 'Conference', value: 'conference', color: 'bg-blue-100 text-blue-700' },
    { label: 'Workshop', value: 'workshop', color: 'bg-green-100 text-green-700' },
    { label: 'Seminar', value: 'seminar', color: 'bg-yellow-100 text-yellow-700' },
    { label: 'Symposium', value: 'symposium', color: 'bg-purple-100 text-purple-700' },
    { label: 'Virtual', value: 'virtual', color: 'bg-pink-100 text-pink-700' },
    { label: 'Masterclass', value: 'masterclass', color: 'bg-indigo-100 text-indigo-700' },
];

const EVENT_CATEGORIES = ['Conferences', 'Workshops', 'Summits', 'Virtual'];
const MAX_STORED_IMAGE_CHARS = 9 * 1024 * 1024;

const siteBase = (import.meta.env.VITE_PUBLIC_SITE_URL || '').replace(/\/$/, '');

function registerPublicUrl(id) {
    return siteBase ? `${siteBase}/register/${id}` : `/register/${id}`;
}

function eventPublicUrl(id) {
    return siteBase ? `${siteBase}/event/${id}` : `/event/${id}`;
}

async function copyText(text) {
    try {
        await navigator.clipboard.writeText(text);
        Swal.fire({ icon: 'success', title: 'Copied', timer: 1200, showConfirmButton: false });
    } catch {
        window.prompt('Copy:', text);
    }
}

const emptyForm = () => ({
    title: '',
    description: '',
    overview: '',
    date: '',
    location: '',
    category: 'Conferences',
    price: '',
    showPrice: false,
    takingResponses: true,
    registrationLink: '',
    registrationEnabled: false,
    whatsappLink: '',
    publishLive: true,
    type: 'conference',
    eventLifecycle: 'upcoming',
    listOnEventsPage: true,
});

function isListedOnEventsPage(row) {
    if (!row || typeof row !== 'object') return false;
    if (row.kind === 'event' || row.contentType === 'event') return true;
    if (row.date != null && String(row.date).trim()) return true;
    if (row.category != null && String(row.category).trim()) return true;
    return false;
}

export default function GalleryPage() {
    const [images, setImages] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const [formData, setFormData] = useState(emptyForm);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [regStats, setRegStats] = useState({ blogCounts: {}, eventCounts: {} });

    const loadImages = useCallback(async () => {
        setError(null);
        try {
            const [rows, stats] = await Promise.all([
                eventsApi.listEvents(),
                eventsApi.getRegistrationStats().catch(() => ({ blogCounts: {}, eventCounts: {} })),
            ]);
            setImages(Array.isArray(rows) ? rows : []);
            setRegStats(stats && typeof stats === 'object' ? stats : { blogCounts: {}, eventCounts: {} });
        } catch (e) {
            setError(e?.message || 'Failed to load images');
            setImages([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadImages();
    }, [loadImages]);

    const handleImageSelect = async (file) => {
        if (!file) return;
        try {
            const dataUrl = await fileToDataUrlForStorage(file);
            setImagePreview(dataUrl);
        } catch (e) {
            Swal.fire('Image error', e?.message || 'Could not read image', 'error');
        }
    };

    const openCreateModal = (opts = {}) => {
        setEditingId(null);
        setFormData({ ...emptyForm(), listOnEventsPage: opts.listOnEventsPage !== false });
        setImagePreview('');
        setIsModalOpen(true);
    };

    const openEditModal = (image) => {
        setEditingId(image.id);
        setImagePreview(image.url || '');
        setFormData({
            title: image.title || '',
            description: image.description || '',
            overview: image.overview || image.description || '',
            date: image.date || '',
            location: image.location != null ? String(image.location) : '',
            category: image.category || 'Conferences',
            price: image.price != null ? String(image.price) : '',
            showPrice: image.showPrice === true,
            takingResponses: image.takingResponses !== false,
            registrationLink: image.registrationLink || '',
            registrationEnabled: image.registrationEnabled === true,
            whatsappLink: typeof image.whatsappLink === 'string' ? image.whatsappLink : '',
            publishLive: image.publish === true || image.status === 'published',
            type: image.type || 'conference',
            eventLifecycle: image.eventLifecycle === 'past' ? 'past' : 'upcoming',
            listOnEventsPage: isListedOnEventsPage(image),
        });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingId(null);
        setFormData(emptyForm());
        setImagePreview('');
    };

    const buildPayload = () => {
        const typeMeta = TYPE_OPTIONS.find((opt) => opt.value === formData.type);
        const base = {
            url: imagePreview,
            title: formData.title.trim(),
            description: formData.description.trim(),
            type: formData.type,
            typeColor: typeMeta?.color || '',
            uploadDate: new Date().toISOString().split('T')[0],
        };
        if (!formData.listOnEventsPage) {
            return base;
        }
        return {
            ...base,
            kind: 'event',
            overview: (formData.overview || formData.description).trim(),
            date: formData.date.trim(),
            location: formData.location.trim(),
            category: formData.category.trim(),
            price: formData.price.trim(),
            showPrice: formData.showPrice === true,
            takingResponses: formData.takingResponses === true,
            registrationLink: formData.registrationLink.trim(),
            registrationEnabled: formData.registrationEnabled === true,
            whatsappLink: (formData.whatsappLink || '').trim(),
            eventLifecycle: formData.eventLifecycle,
            publish: formData.publishLive === true,
            status: formData.publishLive ? 'published' : 'draft',
        };
    };

    const handleSave = async () => {
        if (!formData.title.trim() || !imagePreview) {
            Swal.fire('Error', 'Title and image are required', 'error');
            return;
        }
        if (imagePreview.length > MAX_STORED_IMAGE_CHARS) {
            Swal.fire('Error', 'Image data is too large. Use a smaller image file.', 'error');
            return;
        }
        if (formData.listOnEventsPage) {
            if (!formData.date.trim()) {
                Swal.fire('Error', 'Event date/time is required for Events page posts', 'error');
                return;
            }
            if (formData.takingResponses && !formData.registrationLink.trim()) {
                const r = await Swal.fire({
                    title: 'No registration link',
                    text: 'Taking responses is on but registration URL is empty. Site visitors will use the built-in registration form instead. Continue?',
                    icon: 'question',
                    showCancelButton: true,
                    confirmButtonText: 'Continue',
                });
                if (!r.isConfirmed) return;
            }
        }

        const payload = buildPayload();

        try {
            if (editingId) {
                await eventsApi.updateEvent(editingId, payload);
                Swal.fire('Saved!', 'Updated successfully', 'success');
            } else {
                await eventsApi.createEvent(payload);
                Swal.fire('Saved!', 'Created successfully', 'success');
            }
            closeModal();
            setLoading(true);
            await loadImages();
        } catch (err) {
            Swal.fire('Error', err?.message || 'Failed to save', 'error');
        }
    };

    const handlePublish = (id) => {
        Swal.fire({
            title: 'Publish this image?',
            text: 'Once published, it will appear live on your gallery.',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Yes, Publish!',
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await eventsApi.updateEvent(id, { publish: true, status: 'published' });
                    Swal.fire('Published!', 'The image is now live.', 'success');
                    await loadImages();
                } catch (err) {
                    Swal.fire('Error', err?.message || 'Failed to publish image.', 'error');
                }
            }
        });
    };

    const deleteImage = (id) => {
        Swal.fire({
            title: 'Delete this image?',
            text: 'This action cannot be undone.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes, Delete it!',
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await eventsApi.deleteEvent(id);
                    Swal.fire('Deleted!', 'Image has been deleted.', 'success');
                    await loadImages();
                } catch (err) {
                    Swal.fire('Error', err?.message || 'Failed to delete image.', 'error');
                }
            }
        });
    };

    const patchTakingResponses = async (id, next) => {
        try {
            await eventsApi.updateEvent(id, { takingResponses: next });
            await loadImages();
        } catch (err) {
            Swal.fire('Error', err?.message || 'Failed to update', 'error');
        }
    };

    const patchPublish = async (id, next) => {
        try {
            await eventsApi.updateEvent(id, {
                publish: next,
                status: next ? 'published' : 'draft',
            });
            await loadImages();
        } catch (err) {
            Swal.fire('Error', err?.message || 'Failed to update publish', 'error');
        }
    };

    const patchRegistrationEnabled = async (id, next) => {
        try {
            await eventsApi.updateEvent(id, { registrationEnabled: next });
            await loadImages();
        } catch (err) {
            Swal.fire('Error', err?.message || 'Failed to update', 'error');
        }
    };

    return (
        <div className="space-y-6 overflow-x-hidden min-w-0">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Event Display</h1>
                    <p className="text-gray-600 mt-1 text-sm sm:text-base">
                        Gallery images and conference posts (same data powers the public Events page)
                    </p>
                </div>
                <div className="flex flex-col sm:flex-row flex-wrap gap-2 w-full lg:w-auto shrink-0">
                    <Button variant="secondary" className="w-full sm:w-auto shrink-0" onClick={() => openCreateModal({ listOnEventsPage: false })}>
                        <i className="ri-image-add-line mr-2"></i>
                        Gallery image only
                    </Button>
                    <Button className="w-full sm:w-auto shrink-0" onClick={() => openCreateModal({ listOnEventsPage: true })}>
                        <i className="ri-calendar-event-line mr-2"></i>
                        Conference / event article
                    </Button>
                </div>
            </div>

            {error && (
                <p className="text-sm text-red-600" role="alert">{error}</p>
            )}

            {!siteBase && (
                <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                    Set <code className="text-xs">VITE_PUBLIC_SITE_URL</code> in Dashboard <code>.env</code> so copied registration links point at the public site.
                </p>
            )}

            <Card>
                <h2 className="text-lg font-semibold text-gray-900 mb-1">Events & registration</h2>
                <p className="text-sm text-gray-600 mb-4">
                    Publish controls the public catalog. Registration uses <code className="text-xs">/register/:id</code> when no external URL is set.
                </p>
                {loading ? (
                    <p className="text-sm text-gray-500">Loading…</p>
                ) : images.length === 0 ? (
                    <p className="text-sm text-gray-500">No entries yet.</p>
                ) : (
                    <div className="dashboard-table-wrap rounded-lg border border-slate-200/80 dark:border-slate-800">
                        <table className="dashboard-table">
                            <thead>
                                <tr>
                                    <th>Title</th>
                                    <th className="whitespace-nowrap">Published</th>
                                    <th className="whitespace-nowrap">Responses</th>
                                    <th className="whitespace-nowrap">Reg. form</th>
                                    <th className="whitespace-nowrap">Regs</th>
                                    <th className="whitespace-nowrap">Event link</th>
                                    <th className="whitespace-nowrap">Reg. link</th>
                                </tr>
                            </thead>
                            <tbody>
                                {images.map((row) => {
                                    const listed = isListedOnEventsPage(row);
                                    const count = listed ? (regStats.eventCounts?.[row.id] ?? 0) : 0;
                                    return (
                                    <tr key={row.id}>
                                        <td className="max-w-[10rem] truncate font-medium text-slate-900 dark:text-slate-100 sm:max-w-xs">{row.title || '—'}</td>
                                        <td className="py-2 px-3">
                                            {listed ? (
                                                <label className="inline-flex items-center gap-2 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        className="rounded border-gray-300"
                                                        checked={row.publish === true || row.status === 'published'}
                                                        onChange={(e) => patchPublish(row.id, e.target.checked)}
                                                    />
                                                    <span className="text-slate-600 dark:text-slate-300">Live</span>
                                                </label>
                                            ) : (
                                                <span className="text-slate-400 dark:text-slate-500">—</span>
                                            )}
                                        </td>
                                        <td className="py-2 px-3">
                                            <label className="inline-flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    className="rounded border-gray-300"
                                                    checked={row.takingResponses !== false}
                                                    onChange={(e) => patchTakingResponses(row.id, e.target.checked)}
                                                    disabled={!listed}
                                                />
                                                <span className="text-slate-600 dark:text-slate-300">Open</span>
                                            </label>
                                        </td>
                                        <td className="py-2 px-3">
                                            {listed ? (
                                                <label className="inline-flex items-center gap-2 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        className="rounded border-gray-300"
                                                        checked={row.registrationEnabled === true}
                                                        onChange={(e) => patchRegistrationEnabled(row.id, e.target.checked)}
                                                    />
                                                    <span className="text-slate-600 dark:text-slate-300">On</span>
                                                </label>
                                            ) : (
                                                <span className="text-slate-400 dark:text-slate-500">—</span>
                                            )}
                                        </td>
                                        <td className="tabular-nums">{listed ? count : '—'}</td>
                                        <td className="py-2 px-3">
                                            {listed ? (
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    variant="secondary"
                                                    onClick={() => copyText(eventPublicUrl(row.id))}
                                                >
                                                    Copy link
                                                </Button>
                                            ) : (
                                                <span className="text-slate-400 dark:text-slate-500">—</span>
                                            )}
                                        </td>
                                        <td className="py-2 px-3">
                                            {listed ? (
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    variant="secondary"
                                                    onClick={() => copyText(registerPublicUrl(row.id))}
                                                >
                                                    Copy /reg
                                                </Button>
                                            ) : (
                                                <span className="text-slate-400 dark:text-slate-500">—</span>
                                            )}
                                        </td>
                                    </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>

            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 py-6">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="rounded-xl border border-gray-200 overflow-hidden animate-pulse bg-gray-100 h-64" />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {images.map((image) => (
                        <Card key={image.id} padding={false} className="overflow-hidden">
                            <div className="relative">
                                <img src={image.url} alt={image.title} className="w-full max-h-64 object-cover object-top" />
                                <div className={`absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-medium ${image.typeColor || 'bg-gray-100 text-gray-700'}`}>
                                    {image.type || '—'}
                                </div>
                            </div>
                            <div className="p-4">
                                <h3 className="font-semibold text-gray-900 mb-1">{image.title}</h3>
                                <p className="text-sm text-gray-600 mb-2 line-clamp-2">{image.description}</p>
                                <p className="text-xs text-gray-500 mb-3">{image.uploadDate}</p>
                                <div className="flex flex-wrap gap-2">
                                    <Button size="sm" variant="secondary" onClick={() => openEditModal(image)} className="flex-1">
                                        <i className="ri-edit-line mr-1"></i> Edit
                                    </Button>
                                    {image.status !== 'published' && (
                                        <Button size="sm" variant="secondary" onClick={() => handlePublish(image.id)}>
                                            <i className="ri-upload-cloud-line mr-1"></i> Publish
                                        </Button>
                                    )}
                                    <Button size="sm" variant="danger" onClick={() => deleteImage(image.id)}>
                                        <i className="ri-delete-bin-line"></i>
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            <Modal
                isOpen={isModalOpen}
                onClose={closeModal}
                title={editingId ? 'Edit entry' : 'Add entry'}
                maxWidth="max-w-2xl"
                footer={
                    <>
                        <Button variant="secondary" onClick={closeModal} className="w-full sm:flex-1">
                            <i className="ri-close-line mr-2"></i> Cancel
                        </Button>
                        <Button onClick={handleSave} className="w-full sm:flex-1">
                            <i className="ri-save-line mr-2"></i> {editingId ? 'Update' : 'Save'}
                        </Button>
                    </>
                }
            >
                <div className="space-y-4">
                    <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={formData.listOnEventsPage}
                            onChange={(e) => setFormData({ ...formData, listOnEventsPage: e.target.checked })}
                        />
                        List on public Events page (conference article)
                    </label>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            placeholder="Title"
                        />
                    </div>

                    {formData.listOnEventsPage && (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Date / time (display) *</label>
                                <input
                                    type="text"
                                    value={formData.date}
                                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                    placeholder="e.g. June 12, 2026 · 9:00 AM"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Overview</label>
                                <textarea
                                    value={formData.overview}
                                    onChange={(e) => setFormData({ ...formData, overview: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                    rows={4}
                                    placeholder="Overview for the event page"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Event location</label>
                                <input
                                    type="text"
                                    value={formData.location}
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                    placeholder="Address, city, or online details"
                                />
                                <p className="text-xs text-gray-500 mt-1">Shown in the hero, sidebar, and Venue Information on the public event page.</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                                <select
                                    value={formData.category}
                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                >
                                    {EVENT_CATEGORIES.map((c) => (
                                        <option key={c} value={c}>{c}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Event status</label>
                                <select
                                    value={formData.eventLifecycle}
                                    onChange={(e) => setFormData({ ...formData, eventLifecycle: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                >
                                    <option value="upcoming">Upcoming</option>
                                    <option value="past">Past</option>
                                </select>
                            </div>
                            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.showPrice}
                                    onChange={(e) => setFormData({ ...formData, showPrice: e.target.checked })}
                                />
                                Show price on event page
                            </label>
                            {formData.showPrice && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Price</label>
                                    <input
                                        type="text"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                        placeholder="e.g. $99 or Free"
                                    />
                                </div>
                            )}
                            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.takingResponses}
                                    onChange={(e) => setFormData({ ...formData, takingResponses: e.target.checked })}
                                />
                                Taking responses (Register Now enabled when event is upcoming)
                            </label>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Registration link</label>
                                <input
                                    type="url"
                                    value={formData.registrationLink}
                                    onChange={(e) => setFormData({ ...formData, registrationLink: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                    placeholder="https://…"
                                />
                                <p className="text-xs text-gray-500 mt-1">If set, Register Now opens this URL. Otherwise visitors use the public registration page.</p>
                            </div>
                            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.publishLive}
                                    onChange={(e) => setFormData({ ...formData, publishLive: e.target.checked })}
                                />
                                Published on public Events catalog
                            </label>
                            <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.registrationEnabled}
                                    onChange={(e) => setFormData({ ...formData, registrationEnabled: e.target.checked })}
                                />
                                Enable built-in registration (WhatsApp after submit)
                            </label>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">WhatsApp group link</label>
                                <input
                                    type="url"
                                    value={formData.whatsappLink}
                                    onChange={(e) => setFormData({ ...formData, whatsappLink: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                    placeholder="https://chat.whatsapp.com/…"
                                />
                            </div>
                        </>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            rows={3}
                            placeholder="Short description / card text"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Badge type</label>
                        <div className="flex flex-wrap gap-2">
                            {TYPE_OPTIONS.map((option) => (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, type: option.value })}
                                    className={`px-3 py-1 rounded-full text-xs font-medium border ${
                                        formData.type === option.value
                                            ? `${option.color} border-blue-500`
                                            : 'border-gray-300 bg-gray-100 text-gray-700'
                                    }`}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Image *</label>
                        <ImageUpload onImageSelect={handleImageSelect} preview={imagePreview} />
                    </div>
                </div>
            </Modal>
        </div>
    );
}
