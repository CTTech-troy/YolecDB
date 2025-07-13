import { useState } from 'react';
import Button from '../../ui/Button';
import Card from '../../ui/Card';

// Removed TypeScript interfaces and types

const mockTestimonials = [
  {
    id: '1',
    name: 'Sarah Johnson',
    email: 'sarah@example.com',
    photo: 'https://readdy.ai/api/search-image?query=professional%20headshot%20portrait%20of%20a%20smiling%20businesswoman%20with%20brown%20hair%2C%20clean%20white%20background%2C%20corporate%20photography%20style%2C%20friendly%20and%20approachable%20expression&width=60&height=60&seq=user1&orientation=squarish',
    content: 'Excellent service! The team was professional and delivered exactly what we needed. Highly recommend their expertise.',
    rating: 5,
    date: '2024-01-15',
    status: 'approved'
  },
  {
    id: '2',
    name: 'Michael Chen',
    email: 'michael@example.com',
    photo: 'https://readdy.ai/api/search-image?query=professional%20headshot%20portrait%20of%20a%20confident%20asian%20businessman%20wearing%20glasses%2C%20clean%20white%20background%2C%20corporate%20photography%20style%2C%20professional%20appearance&width=60&height=60&seq=user2&orientation=squarish',
    content: 'Outstanding results! The project was completed on time and exceeded our expectations. Great communication throughout.',
    rating: 5,
    date: '2024-01-12',
    status: 'approved'
  },
  {
    id: '3',
    name: 'Emily Rodriguez',
    email: 'emily@example.com',
    photo: 'https://readdy.ai/api/search-image?query=professional%20headshot%20portrait%20of%20a%20smiling%20latina%20businesswoman%20with%20dark%20hair%2C%20clean%20white%20background%2C%20corporate%20photography%20style%2C%20warm%20and%20professional%20expression&width=60&height=60&seq=user3&orientation=squarish',
    content: 'Very satisfied with the service. The team was responsive and provided excellent support. Will definitely work with them again.',
    rating: 4,
    date: '2024-01-10',
    status: 'pending'
  },
  {
    id: '4',
    name: 'David Wilson',
    email: 'david@example.com',
    photo: 'https://readdy.ai/api/search-image?query=professional%20headshot%20portrait%20of%20a%20middle-aged%20businessman%20with%20grey%20hair%2C%20clean%20white%20background%2C%20corporate%20photography%20style%2C%20confident%20and%20trustworthy%20appearance&width=60&height=60&seq=user4&orientation=squarish',
    content: 'Good experience overall. The final product met our requirements and the process was smooth.',
    rating: 4,
    date: '2024-01-08',
    status: 'approved'
  }
];

export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState(mockTestimonials);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredTestimonials = testimonials.filter(testimonial => {
    const matchesSearch = testimonial.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      testimonial.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      testimonial.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || testimonial.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredTestimonials.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTestimonials = filteredTestimonials.slice(startIndex, startIndex + itemsPerPage);

  const updateStatus = (id, status) => {
    setTestimonials(testimonials.map(t =>
      t.id === id ? { ...t, status } : t
    ));
  };

  const deleteTestimonial = (id) => {
    if (window.confirm('Are you sure you want to delete this testimonial?')) {
      setTestimonials(testimonials.filter(t => t.id !== id));
    }
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
            <input
              type="text"
              placeholder="Search testimonials..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm w-full sm:w-64"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm pr-8"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
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
              {paginatedTestimonials.map((testimonial) => (
                <tr key={testimonial.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={testimonial.photo}
                        alt={testimonial.name}
                        className="w-10 h-10 rounded-full object-cover object-top"
                      />
                      <div>
                        <div className="font-medium text-gray-900">{testimonial.name}</div>
                        <div className="text-sm text-gray-500">{testimonial.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <p className="text-sm text-gray-700 line-clamp-2 max-w-xs">
                      {testimonial.content}
                    </p>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }, (_, i) => (
                        <i
                          key={i}
                          className={`ri-star-${i < testimonial.rating ? 'fill' : 'line'} text-yellow-400`}
                        ></i>
                      ))}
                    </div>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-600">
                    {testimonial.date}
                  </td>
                  <td className="py-4 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(testimonial.status)}`}>
                      {testimonial.status.charAt(0).toUpperCase() + testimonial.status.slice(1)}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      {testimonial.status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => updateStatus(testimonial.id, 'approved')}
                            className="whitespace-nowrap"
                          >
                            <i className="ri-check-line mr-1"></i>
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => updateStatus(testimonial.id, 'rejected')}
                            className="whitespace-nowrap"
                          >
                            <i className="ri-close-line mr-1"></i>
                            Reject
                          </Button>
                        </>
                      )}
                      {testimonial.status === 'approved' && (
                        <Button
                          size="sm"
                          variant="secondary"
                          className="whitespace-nowrap"
                        >
                          <i className="ri-external-link-line mr-1"></i>
                          Push to Website
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => deleteTestimonial(testimonial.id)}
                      >
                        <i className="ri-delete-bin-line"></i>
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredTestimonials.length)} of {filteredTestimonials.length} results
            </p>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <i className="ri-arrow-left-line"></i>
              </Button>
              <span className="px-3 py-1 text-sm font-medium text-gray-700">
                {currentPage} of {totalPages}
              </span>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setCurrentPage(currentPage + 1)}
                              disabled={currentPage === totalPages}
                            >
                              <i className="ri-arrow-right-line"></i>
                            </Button>
                          </div>
                        </div>
                      )}
                    </Card>
                  </div>
                );
              }