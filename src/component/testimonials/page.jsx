import { useState, useEffect, useCallback } from 'react';
import Button from '../../ui/Button';
import Card from '../../ui/Card';
import Swal from 'sweetalert2';
import * as testimonialsApi from '../../services/testimonialsApi.js';

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
  const [error, setError] = useState(null);

  const loadTestimonials = useCallback(async () => {
    setError(null);
    try {
      const raw = await testimonialsApi.listTestimonials();
      const rows = Array.isArray(raw) ? raw : [];
      const loadedTestimonials = rows.map((item) => {
        const formattedDate = item.timestamp ? new Date(item.timestamp).toLocaleDateString() + ' ' + new Date(item.timestamp).toLocaleTimeString() : '';
        return {
          id: item.id,
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
    } catch (e) {
      setError(e?.message || 'Failed to load testimonials');
      setTestimonials([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTestimonials();
  }, [loadTestimonials]);

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
    testimonialsApi.updateTestimonial(id, { status })
      .then(() => {
        Swal.fire({ icon: 'success', title: 'Status Updated', text: `Testimonial status changed to ${status}.`, timer: 1500, showConfirmButton: false });
        loadTestimonials();
      })
      .catch((err) => {
        Swal.fire({ icon: 'error', title: 'Error', text: err?.message || 'Failed to update status.' });
      });
  };

  const publishTestimonial = (id) => {
    testimonialsApi.updateTestimonial(id, { published: true })
      .then(() => {
        Swal.fire({ icon: 'success', title: 'Testimonial Published', text: 'The testimonial has been published to the website.', timer: 1500, showConfirmButton: false });
        loadTestimonials();
      })
      .catch((err) => {
        Swal.fire({ icon: 'error', title: 'Error', text: err?.message || 'Failed to publish testimonial.' });
      });
  };

  const deleteTestimonial = (id) => {
    Swal.fire({ title: 'Are you sure?', text: "This will permanently delete the testimonial.", icon: 'warning', showCancelButton: true, confirmButtonText: 'Yes, delete it!', cancelButtonText: 'Cancel' }).then((result) => {
      if (result.isConfirmed) {
        testimonialsApi.deleteTestimonial(id)
          .then(() => {
            Swal.fire('Deleted!', 'The testimonial has been deleted.', 'success');
            loadTestimonials();
          })
          .catch((err) => {
            Swal.fire('Error', err?.message || 'Failed to delete testimonial.', 'error');
          });
      }
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'text-emerald-700 bg-emerald-100 dark:text-emerald-300 dark:bg-emerald-900/50';
      case 'rejected':
        return 'text-red-700 bg-red-100 dark:text-red-300 dark:bg-red-900/50';
      default:
        return 'text-amber-700 bg-amber-100 dark:text-amber-300 dark:bg-amber-900/50';
    }
  };

  return (
    <div className="space-y-6 min-w-0">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Testimonials</h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">Manage customer testimonials and reviews</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full lg:w-auto">
          <div className="relative flex-1 min-w-0">
            <i className="ri-search-line absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
            <input type="text" placeholder="Search testimonials..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 pr-4 py-2.5 min-h-[44px] border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm w-full sm:min-w-[12rem] sm:max-w-xs" />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full sm:w-auto min-h-[44px] px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm pr-8">
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-600" role="alert">{error}</p>
      )}

      <Card padding={false} className="overflow-hidden">
        <div className="md:hidden divide-y divide-gray-100">
          {loading ? (
            <p className="p-6 text-center text-gray-500 text-sm">Loading testimonials...</p>
          ) : paginatedTestimonials.length === 0 ? (
            <p className="p-6 text-center text-gray-500 text-sm">No testimonials match your filters.</p>
          ) : (
            paginatedTestimonials.map((testimonial) => (
              <div key={testimonial.id} className="p-4 space-y-3">
                <div className="flex items-start gap-3">
                  {testimonial.photo ? (
                    <img src={testimonial.photo} alt="" className="w-12 h-12 rounded-full object-cover shrink-0" />
                  ) : (
                    <img src={getAvatar(testimonial.name)} alt="" className="w-12 h-12 rounded-full object-cover shrink-0" />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-gray-900 truncate">{testimonial.name}</div>
                    {testimonial.email && <div className="text-xs text-gray-500 truncate">{testimonial.email}</div>}
                    <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(testimonial.status)}`}>
                      {testimonial.status.charAt(0).toUpperCase() + testimonial.status.slice(1)}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-700 line-clamp-4">{testimonial.content}</p>
                <div className="flex flex-wrap gap-2">
                  {testimonial.status === 'pending' && (
                    <>
                      <Button size="sm" onClick={() => updateStatus(testimonial.id, 'approved')} className="flex-1 min-w-[7rem]">
                        <i className="ri-check-line mr-1"></i>Approve
                      </Button>
                      <Button size="sm" variant="danger" onClick={() => updateStatus(testimonial.id, 'rejected')} className="flex-1 min-w-[7rem]">
                        <i className="ri-close-line mr-1"></i>Reject
                      </Button>
                    </>
                  )}
                  {testimonial.status === 'approved' && !testimonial.published && (
                    <Button size="sm" variant="secondary" className="w-full" onClick={() => publishTestimonial(testimonial.id)}>
                      <i className="ri-external-link-line mr-1"></i>Push to Website
                    </Button>
                  )}
                  {testimonial.published && <span className="text-green-600 text-xs font-semibold w-full">Published</span>}
                  <Button size="sm" variant="danger" className="w-full sm:w-auto" onClick={() => deleteTestimonial(testimonial.id)}>
                    <i className="ri-delete-bin-line mr-1"></i>Delete
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
        <div className="dashboard-table-wrap hidden max-w-full p-4 sm:p-6 md:block">
          <table className="dashboard-table min-w-[600px]">
            <thead>
              <tr>
                <th>User</th>
                <th>Content</th>
                <th>Rating</th>
                <th>Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="py-10 text-center text-slate-500 dark:text-slate-400">Loading testimonials...</td></tr>
              ) : paginatedTestimonials.map((testimonial) => (
                <tr key={testimonial.id}>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      {testimonial.photo ? <img src={testimonial.photo} alt={testimonial.name} className="w-10 h-10 rounded-full object-cover object-top" /> : <img src={getAvatar(testimonial.name)} alt={testimonial.name} className="w-10 h-10 rounded-full object-cover object-top" />}
                      <div>
                        <div className="font-medium text-slate-900 dark:text-slate-100">{testimonial.name}</div>
                        {testimonial.email && <div className="text-sm text-slate-500 dark:text-slate-400">{testimonial.email}</div>}
                        {testimonial.company && <div className="text-sm text-slate-400 dark:text-slate-500">{testimonial.company}</div>}
                      </div>
                    </div>
                  </td>
                  <td><p className="line-clamp-2 max-w-xs text-slate-600 dark:text-slate-300">{truncateContent(testimonial.content)}</p></td>
                  <td className="py-4 px-4"><div className="flex items-center gap-1">{Array.from({ length: 5 }, (_, i) => (<i key={i} className={`ri-star-${i < testimonial.rating ? 'fill' : 'line'} text-yellow-400`}></i>))}</div></td>
                  <td className="text-slate-500 dark:text-slate-400">{testimonial.date}</td>
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
                      {testimonial.published && <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">Published</span>}
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

