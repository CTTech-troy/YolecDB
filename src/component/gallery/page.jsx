import { useState, useEffect } from 'react';
import Button from '../../ui/Button.jsx';
import Card from '../../ui/Card.jsx';
import Modal from '../../ui/Modal.jsx';
import ImageUpload from '../../blog/ImageUpload.jsx';
import { database } from '../../../firebase.js';
import { ref, push, onValue, remove, update } from 'firebase/database';
import Swal from 'sweetalert2';

const TYPE_OPTIONS = [
    { label: 'Conference', value: 'conference', color: 'bg-blue-100 text-blue-700' },
    { label: 'Workshop', value: 'workshop', color: 'bg-green-100 text-green-700' },
    { label: 'Seminar', value: 'seminar', color: 'bg-yellow-100 text-yellow-700' },
    { label: 'Symposium', value: 'symposium', color: 'bg-purple-100 text-purple-700' },
    { label: 'Virtual', value: 'virtual', color: 'bg-pink-100 text-pink-700' },
    { label: 'Masterclass', value: 'masterclass', color: 'bg-indigo-100 text-indigo-700' },
];

export default function GalleryPage() {
    const [images, setImages] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [imagePreview, setImagePreview] = useState('');
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        type: 'conference',
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const imagesRef = ref(database, 'modelImages');
        const unsubscribe = onValue(imagesRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const loadedImages = Object.entries(data)
                    .map(([id, value]) => ({ id, ...value }))
                    .reverse();
                setImages(loadedImages);
            } else {
                setImages([]);
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const handleImageSelect = (file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            if (e.target?.result) {
                setImagePreview(e.target.result);
            }
        };
        reader.readAsDataURL(file);
    };

    const handleSave = () => {
        if (!formData.title || !imagePreview) {
            Swal.fire('Error', 'Please fill in all required fields and select an image', 'error');
            return;
        }

        const typeMeta = TYPE_OPTIONS.find(opt => opt.value === formData.type);
        const newImage = {
            url: imagePreview,
            title: formData.title,
            description: formData.description,
            uploadDate: new Date().toISOString().split('T')[0],
            type: formData.type,
            typeColor: typeMeta?.color || '',
        };

        const imagesRef = ref(database, 'modelImages');
        push(imagesRef, newImage)
            .then(() => {
                Swal.fire('Saved!', 'Image saved successfully', 'success');
                setIsModalOpen(false);
                resetForm();
            })
            .catch(() => {
                Swal.fire('Error', 'Failed to save image', 'error');
            });
    };

    const resetForm = () => {
        setFormData({ title: '', description: '', type: 'conference' });
        setImagePreview('');
    };

    const handlePublish = (id) => {
        Swal.fire({
            title: 'Publish this image?',
            text: 'Once published, it will appear live on your gallery.',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Yes, Publish!',
        }).then((result) => {
            if (result.isConfirmed) {
                const imageRef = ref(database, `modelImages/${id}`);
                update(imageRef, { status: 'published' })
                    .then(() => {
                        Swal.fire('Published!', 'The image is now live.', 'success');
                    })
                    .catch(() => {
                        Swal.fire('Error', 'Failed to publish image.', 'error');
                    });
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
        }).then((result) => {
            if (result.isConfirmed) {
                const imageRef = ref(database, `modelImages/${id}`);
                remove(imageRef)
                    .then(() => {
                        Swal.fire('Deleted!', 'Image has been deleted.', 'success');
                    })
                    .catch(() => {
                        Swal.fire('Error', 'Failed to delete image.', 'error');
                    });
            }
        });
    };

    return (
        <div className="space-y-6 overflow-x-hidden">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Model Display Pictures</h1>
                    <p className="text-gray-600 mt-1">Manage your model gallery and showcase images</p>
                </div>
                <Button onClick={() => setIsModalOpen(true)}>
                    <i className="ri-add-line mr-2"></i>
                    Add New Image
                </Button>
            </div>

            {loading ? (
                <div className="text-center text-gray-500 py-10">Loading images...</div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {images.map((image) => (
                        <Card key={image.id} padding={false} className="overflow-hidden">
                            <div className="relative">
                                <img src={image.url} alt={image.title} className="w-full max-h-64 object-cover object-top" />
                                <div className={`absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-medium ${image.typeColor}`}>
                                    {image.type}
                                </div>
                            </div>
                            <div className="p-4">
                                <h3 className="font-semibold text-gray-900 mb-1">{image.title}</h3>
                                <p className="text-sm text-gray-600 mb-2 line-clamp-2">{image.description}</p>
                                <p className="text-xs text-gray-500 mb-3">{image.uploadDate}</p>
                                <div className="flex flex-wrap gap-2">
                                    {image.status !== 'published' && (
                                        <Button size="sm" variant="secondary" onClick={() => handlePublish(image.id)} className="flex-1">
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
                onClose={() => setIsModalOpen(false)}
                title="Add New Image"
                maxWidth="max-w-lg"
            >
                <div className="space-y-6 overflow-y-auto max-h-[80vh] pr-2">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Image Title *</label>
                        <input
                            type="text"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            placeholder="Enter image title..."
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            rows={3}
                            placeholder="Enter image description..."
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Select Type</label>
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
                        <label className="block text-sm font-medium text-gray-700 mb-2">Upload Image *</label>
                        <ImageUpload onImageSelect={handleImageSelect} preview={imagePreview} />
                    </div>
                    <div className="flex flex-wrap gap-3 pt-4">
                        <Button onClick={handleSave} className="flex-1">
                            <i className="ri-save-line mr-2"></i> Save Image
                        </Button>
                        <Button variant="secondary" onClick={() => setIsModalOpen(false)} className="flex-1">
                            <i className="ri-close-line mr-2"></i> Cancel
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}