// Update: Store image in DB as Base64 instead of Storage

import { useState, useEffect } from 'react';
import Button from '../../ui/Button.jsx';
import Card from '../../ui/Card.jsx';
import Modal from '../../ui/Modal.jsx';
import ImageUpload from '../../blog/ImageUpload.jsx';
import { database } from '../../../firebase.js';
import { ref, push, onValue, remove, update } from 'firebase/database';

export default function BlogManager() {
  const [blogs, setBlogs] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [imagePreview, setImagePreview] = useState('');
  const [formData, setFormData] = useState({ title: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const blogRef = ref(database, 'blogs');
    onValue(blogRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const loadedBlogs = Object.keys(data)
          .map((key) => ({ id: key, ...data[key] }))
          .sort((a, b) => new Date(b.date) - new Date(a.date));
        setBlogs(loadedBlogs);
      } else {
        setBlogs([]);
      }
      setLoading(false);
    });
  }, []);

  const handleImageSelect = async (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result); // reader.result is Base64 data URI
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!formData.title) {
      alert('Please enter the blog title');
      return;
    }
    const newBlog = {
      title: formData.title,
      image: imagePreview || '',
      date: new Date().toISOString().split('T')[0],
      author: 'Admin',
      published: false,
    };
    try {
      const blogRef = ref(database, 'blogs');
      await push(blogRef, newBlog);
      setIsModalOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error saving blog to database:', error);
      alert('Failed to save blog. Please try again.');
    }
  };

  const handlePublish = async (id, currentStatus) => {
    try {
      const blogRef = ref(database, `blogs/${id}`);
      await update(blogRef, { published: !currentStatus });
    } catch (error) {
      console.error('Error updating publish status:', error);
      alert('Failed to update publish status.');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this blog?')) {
      try {
        const blogRef = ref(database, `blogs/${id}`);
        await remove(blogRef);
      } catch (error) {
        console.error('Error deleting blog:', error);
        alert('Failed to delete blog.');
      }
    }
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({ title: '' });
    setImagePreview('');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Blog Manager</h1>
          <p className="text-gray-600 mt-1">Create and manage your blog posts</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <i className="ri-add-line mr-2"></i>
          Add New Blog
        </Button>
      </div>

      {loading ? (
        <p className="text-center text-gray-500 py-10">Loading blogs...</p>
      ) : blogs.length === 0 ? (
        <div className="text-center text-gray-500 py-10">
          <p>No blogs found.</p>
          <Button onClick={() => setIsModalOpen(true)} className="mt-4">
            <i className="ri-add-line mr-2"></i>
            Add Blog
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogs.map((blog) => (
            <Card key={blog.id} padding={false} className="overflow-hidden">
              {blog.image ? (
                <img src={blog.image} alt={blog.title} className="w-full h-48 object-cover object-top" />
              ) : (
                <div className="w-full h-48 flex items-center justify-center bg-gray-100 text-gray-400 text-sm">No Image</div>
              )}
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{blog.title}</h3>
                <p className="text-sm text-gray-600 mb-1">{blog.date}</p>
                <p className="text-xs mb-3">{blog.published ? 'Published' : 'Unpublished'}</p>
                <div className="flex gap-2">
                  <Button size="sm" variant="secondary" className="flex-1" onClick={() => handlePublish(blog.id, blog.published)}>
                    <i className="ri-upload-cloud-line mr-1"></i>
                    {blog.published ? 'Unpublish' : 'Publish'}
                  </Button>
                  <Button
                    size="sm"
                    color="bg-red-600 hover:bg-red-700 text-white flex-1 w-10"
                    onClick={() => handleDelete(blog.id)}
                  >
                    <i className="ri-delete-bin-line mr-1"></i>
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={handleCancel} title="Add New Blog Post" maxWidth="max-w-2xl">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Blog Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              placeholder="Enter blog title..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Featured Image</label>
            <ImageUpload onImageSelect={handleImageSelect} preview={imagePreview} />
          </div>

          <div className="flex gap-3 pt-4">
            <Button onClick={handleSave} className="flex-1">
              <i className="ri-save-line mr-2"></i>
              Save Blog
            </Button>
            <Button variant="secondary" onClick={handleCancel} className="flex-1">
              <i className="ri-close-line mr-2"></i>
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
