import { useState } from 'react';
// FIX: Use correct relative imports for Button and Card
import Button from '../../ui/Button.jsx';
import Card from '../../ui/Card.jsx';

/**
 * @typedef {Object} Subscriber
 * @property {string} id
 * @property {string} name
 * @property {string} email
 * @property {string} subscriptionDate
 * @property {'active'|'unsubscribed'} status
 * @property {string} source
 */

const mockSubscribers = [
  {
    id: '1',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@example.com',
    subscriptionDate: '2024-01-15',
    status: 'active',
    source: 'Website'
  },
  {
    id: '2',
    name: 'Michael Chen',
    email: 'michael.chen@example.com',
    subscriptionDate: '2024-01-14',
    status: 'active',
    source: 'Social Media'
  },
  {
    id: '3',
    name: 'Emily Rodriguez',
    email: 'emily.rodriguez@example.com',
    subscriptionDate: '2024-01-13',
    status: 'unsubscribed',
    source: 'Website'
  },
  {
    id: '4',
    name: 'David Wilson',
    email: 'david.wilson@example.com',
    subscriptionDate: '2024-01-12',
    status: 'active',
    source: 'Event'
  },
  {
    id: '5',
    name: 'Lisa Thompson',
    email: 'lisa.thompson@example.com',
    subscriptionDate: '2024-01-11',
    status: 'active',
    source: 'Website'
  },
  {
    id: '6',
    name: 'Robert Brown',
    email: 'robert.brown@example.com',
    subscriptionDate: '2024-01-10',
    status: 'active',
    source: 'Referral'
  },
  {
    id: '7',
    name: 'Amanda Davis',
    email: 'amanda.davis@example.com',
    subscriptionDate: '2024-01-09',
    status: 'active',
    source: 'Social Media'
  },
  {
    id: '8',
    name: 'James Miller',
    email: 'james.miller@example.com',
    subscriptionDate: '2024-01-08',
    status: 'unsubscribed',
    source: 'Website'
  }
];

export default function NewsletterPage() {
  // FIX: Remove TypeScript generics from useState
  const [subscribers] = useState(mockSubscribers);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredSubscribers = subscribers.filter(subscriber => {
    const matchesSearch = subscriber.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         subscriber.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || subscriber.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredSubscribers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedSubscribers = filteredSubscribers.slice(startIndex, startIndex + itemsPerPage);

  const downloadPDF = () => {
    alert('PDF download feature would be implemented here');
  };

  const exportData = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Name,Email,Subscription Date,Status,Source\n"
      + filteredSubscribers.map(sub => 
          `${sub.name},${sub.email},${sub.subscriptionDate},${sub.status},${sub.source}`
        ).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "newsletter_subscribers.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Newsletter Subscribers</h1>
          <p className="text-gray-600 mt-1">Manage your newsletter subscriber list</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={exportData}>
            <i className="ri-download-cloud-line mr-2"></i>
            Export CSV
          </Button>
          <Button variant="secondary" onClick={downloadPDF}>
            <i className="ri-file-pdf-line mr-2"></i>
            Download PDF
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <i className="ri-search-line absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
          <input
            type="text"
            placeholder="Search subscribers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm w-full"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm pr-8"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="unsubscribed">Unsubscribed</option>
        </select>
      </div>

      <Card>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                <i className="ri-mail-line text-blue-600"></i>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Subscribers</p>
                <p className="text-2xl font-bold text-gray-900">{subscribers.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                <i className="ri-user-line text-green-600"></i>
              </div>
              <div>
                <p className="text-sm text-gray-600">Active</p>
                <p className="text-2xl font-bold text-gray-900">
                  {subscribers.filter(s => s.status === 'active').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-3">
                <i className="ri-user-unfollow-line text-red-600"></i>
              </div>
              <div>
                <p className="text-sm text-gray-600">Unsubscribed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {subscribers.filter(s => s.status === 'unsubscribed').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                <i className="ri-calendar-line text-purple-600"></i>
              </div>
              <div>
                <p className="text-sm text-gray-600">This Month</p>
                <p className="text-2xl font-bold text-gray-900">24</p>
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Email</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Subscription Date</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Source</th>
              </tr>
            </thead>
            <tbody>
              {paginatedSubscribers.map((subscriber) => (
                <tr key={subscriber.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-4 text-gray-700">{subscriber.email}</td>
                  <td className="py-4 px-4 text-sm text-gray-600">{subscriber.subscriptionDate}</td>
                  <td className="py-4 px-4 text-sm text-gray-600">{subscriber.source}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredSubscribers.length)} of {filteredSubscribers.length} results
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