import { useState, useEffect } from 'react';
import Button from '../../ui/Button.jsx';
import Card from '../../ui/Card.jsx';
import { database } from '../../../firebase';
import { ref, onValue } from 'firebase/database';

export default function NewsletterPage() {
  const [subscribers, setSubscribers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const subRef = ref(database, 'sub-form');
    const unsubscribe = onValue(subRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const loaded = Object.keys(data).map((key) => ({
          id: key,
          ...data[key],
          subscriptionDate: data[key].subscriptionDate || new Date().toISOString(),
          status: data[key].status || 'active',
        }));
        setSubscribers(loaded);
        console.log('Newsletter Subscribers:', loaded);
      } else {
        setSubscribers([]);
        console.log('Newsletter Subscribers: []');
      }
    });
    return () => unsubscribe();
  }, []);

  const filteredSubscribers = subscribers.filter(subscriber => {
    const matchesSearch = (subscriber.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (subscriber.email || '').toLowerCase().includes(searchTerm.toLowerCase());
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

  // Calculate "This Month" count
  const thisMonthCount = subscribers.filter(sub => {
    const date = new Date(sub.subscriptionDate);
    const now = new Date();
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  }).length;

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
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Email</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Subscription Date</th>
              </tr>
            </thead>
            <tbody>
              {paginatedSubscribers.map((subscriber) => {
                const formattedDate = new Date(subscriber.subscriptionDate).toLocaleDateString();
                return (
                  <tr key={subscriber.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4 text-gray-700">{subscriber.email}</td>
                    <td className="py-4 px-4 text-sm text-gray-600">{formattedDate}</td>
                  </tr>
                );
              })}
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
