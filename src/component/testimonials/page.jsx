import { useState, useEffect } from 'react';
import { database } from '../../../firebase';
import { ref, onValue, update, remove } from 'firebase/database';
import Button from '../../ui/Button';
import Card from '../../ui/Card';
import Swal from 'sweetalert2';

const pastelColors = ["#A3CEF1", "#F7D6E0", "#B8F2E6", "#F6EAC2", "#D0E6A5", "#FFD6BA", "#C3B1E1", "#FFB7B2"];

function getPastelColor(name) {
  if (!name) return pastelColors[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return pastelColors[Math.abs(hash) % pastelColors.length];
}

function getAvatar(name) {
  const letter = name ? name.trim()[0].toUpperCase() : "U";
  const bgColor = getPastelColor(name);
  const svg = `<svg width="512" height="512" xmlns="http://www.w3.org/2000/svg"><circle cx="256" cy="256" r="256" fill="${bgColor}" /><text x="50%" y="55%" text-anchor="middle" dominant-baseline="middle" font-size="260" font-family="sans-serif" fill="#fff" font-weight="bold">${letter}</text></svg>`;
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage] = useState(1);
  const itemsPerPage = 10;
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const testimonialsRef = ref(database, 'testimonials');
    const unsubscribe = onValue(testimonialsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const loadedTestimonials = Object.keys(data).map((key) => {
          const item = data[key];
          const formattedDate = item.timestamp ? new Date(item.timestamp).toLocaleDateString() + ' ' + new Date(item.timestamp).toLocaleTimeString() : '';
          return {
            id: key,
            name: item.name || '',
            email: item.email || '',
            company: item.company || '',
            content: item.testimonial || '',
            rating: item.rating || 0,
            date: formattedDate,
            status: item.status || 'pending',
            published: item.published || false,
            photo: item.photo || ''
          };
        });
        setTestimonials(loadedTestimonials);
      } else {
        setTestimonials([]);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  function truncateContent(content) {
    if (typeof content !== 'string') return '';
    const limit = 80;
    return content.length > limit ? content.slice(0, limit) + '...' : content;
  }

  const filteredTestimonials = testimonials.filter(testimonial => {
    const matchesSearch = testimonial.name.toLowerCase().includes(searchTerm.toLowerCase()) || testimonial.email.toLowerCase().includes(searchTerm.toLowerCase()) || testimonial.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || testimonial.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTestimonials = filteredTestimonials.slice(startIndex, startIndex + itemsPerPage);

  const updateStatus = (id, status) => {
    const testimonialRef = ref(database, `testimonials/${id}`);
    update(testimonialRef, { status })
      .then(() => {
        Swal.fire({ icon: 'success', title: 'Status Updated', text: `Testimonial status changed to ${status}.`, timer: 1500, showConfirmButton: false });
      })
      .catch(() => {
        Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to update status.' });
      });
  };

  const publishTestimonial = (id) => {
    const testimonialRef = ref(database, `testimonials/${id}`);
    update(testimonialRef, { published: true })
      .then(() => {
        Swal.fire({ icon: 'success', title: 'Testimonial Published', text: 'The testimonial has been published to the website.', timer: 1500, showConfirmButton: false });
      })
      .catch(() => {
        Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to publish testimonial.' });
      });
  };

  const deleteTestimonial = (id) => {
    Swal.fire({ title: 'Are you sure?', text: "This will permanently delete the testimonial.", icon: 'warning', showCancelButton: true, confirmButtonText: 'Yes, delete it!', cancelButtonText: 'Cancel' }).then((result) => {
      if (result.isConfirmed) {
        const testimonialRef = ref(database, `testimonials/${id}`);
        remove(testimonialRef)
          .then(() => {
            Swal.fire('Deleted!', 'The testimonial has been deleted.', 'success');
          })
          .catch(() => {
            Swal.fire('Error', 'Failed to delete testimonial.', 'error');
          });
      }
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'text-green-600 bg-green-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      default: return 'text-yellow-600 bg-yellow-100';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Testimonials</h1>
          <p className="text-gray-600 mt-1">Manage customer testimonials and reviews</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <i className="ri-search-line absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
            <input type="text" placeholder="Search testimonials..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm w-full sm:w-64" />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm pr-8">
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      <Card>
        <div className="overflow-x-auto max-w-full hidden md:block">
          <table className="w-full max-w-full min-w-[600px]">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">User</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Content</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Rating</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Date</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="py-10 text-center text-gray-500">Loading testimonials...</td></tr>
              ) : paginatedTestimonials.map((testimonial) => (
                <tr key={testimonial.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      {testimonial.photo ? <img src={testimonial.photo} alt={testimonial.name} className="w-10 h-10 rounded-full object-cover object-top" /> : <img src={getAvatar(testimonial.name)} alt={testimonial.name} className="w-10 h-10 rounded-full object-cover object-top" />}
                      <div>
                        <div className="font-medium text-gray-900">{testimonial.name}</div>
                        {testimonial.email && <div className="text-sm text-gray-500">{testimonial.email}</div>}
                        {testimonial.company && <div className="text-sm text-gray-400">{testimonial.company}</div>}
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4"><p className="text-sm text-gray-700 line-clamp-2 max-w-xs">{truncateContent(testimonial.content)}</p></td>
                  <td className="py-4 px-4"><div className="flex items-center gap-1">{Array.from({ length: 5 }, (_, i) => (<i key={i} className={`ri-star-${i < testimonial.rating ? 'fill' : 'line'} text-yellow-400`}></i>))}</div></td>
                  <td className="py-4 px-4 text-sm text-gray-600">{testimonial.date}</td>
                  <td className="py-4 px-4"><span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(testimonial.status)}`}>{testimonial.status.charAt(0).toUpperCase() + testimonial.status.slice(1)}</span></td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      {testimonial.status === 'pending' && (
                        <>
                          <Button size="sm" onClick={() => updateStatus(testimonial.id, 'approved')} className="whitespace-nowrap"><i className="ri-check-line mr-1"></i>Approve</Button>
                          <Button size="sm" variant="danger" onClick={() => updateStatus(testimonial.id, 'rejected')} className="whitespace-nowrap"><i className="ri-close-line mr-1"></i>Reject</Button>
                        </>
                      )}
                      {testimonial.status === 'approved' && !testimonial.published && (
                        <Button size="sm" variant="secondary" onClick={() => publishTestimonial(testimonial.id)} className="whitespace-nowrap"><i className="ri-external-link-line mr-1"></i>Push to Website</Button>
                      )}
                      {testimonial.published && <span className="text-green-600 text-xs font-semibold">Published</span>}
                      <Button size="sm" variant="danger" onClick={() => deleteTestimonial(testimonial.id)}><i className="ri-delete-bin-line"></i></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
