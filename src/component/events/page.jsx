import { useState, useEffect } from 'react';
import Button from '../../ui/Button.jsx';
import Card from '../../ui/Card.jsx';
import { database } from '../../../firebase.js';
import { ref, onValue } from 'firebase/database';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import Swal from 'sweetalert2';

export default function EventsSubscribersPage() {
  const [subscribers, setSubscribers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  // Removed unused statusFilter state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [loading, setLoading] = useState(true);

  // Fetch all event subscribers from Firebase
  useEffect(() => {
    setLoading(true);
    const subscribersRef = ref(database, 'event_registrations');
    const unsubscribe = onValue(subscribersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list = Object.entries(data).map(([id, value]) => ({
          id,
          ...value,
        }));
        setSubscribers(list);
      } else {
        setSubscribers([]);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Filtering logic
  const filteredSubscribers = subscribers.filter(subscriber => {
    // Combine first and last name for search
    const fullName = (subscriber.firstName || subscriber.lastName)
      ? `${subscriber.firstName || ''} ${subscriber.lastName || ''}`.trim()
      : (subscriber.name || '');

    const matchesSearch =
      fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (subscriber.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (subscriber.phone || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (subscriber.school || '').toLowerCase().includes(searchTerm.toLowerCase());
    // Removed statusFilter logic
    return matchesSearch;
  });

  const totalPages = Math.ceil(filteredSubscribers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedSubscribers = filteredSubscribers.slice(startIndex, startIndex + itemsPerPage);

  // CSV Export
  const exportData = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      "Full Name,Email,Phone Number,Subscription Date,School/Institution,Event,Status\n" +
      filteredSubscribers
        .map(sub => {
          // Combine first and last name for Full Name
          const fullName = (sub.firstName || sub.lastName)
            ? `${sub.firstName || ''} ${sub.lastName || ''}`.trim()
            : (sub.name || '');
          // Format date
          const date = sub.timestamp
            ? (
                typeof sub.timestamp === 'number'
                  ? new Date(sub.timestamp).toLocaleString()
                  : new Date(Date.parse(sub.timestamp)).toLocaleString()
              )
            : (sub.subscriptionDate || '');
          return `"${fullName}","${sub.email || ''}","${sub.phone || ''}","${date}","${sub.school || sub.institution || ''}","${sub.event || ''}","${sub.status || ''}"`;
        })
        .join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "event_subscribers.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // PDF Download with SweetAlert
  const downloadPDF = () => {
    try {
      const doc = new jsPDF();
      doc.text("Event Subscribers", 14, 16);
      doc.autoTable({
        startY: 22,
        head: [
          [
            "Full Name",
            "Email",
            "Phone Number",
            "Subscription Date",
            "School/Institution",
            "Event",
            "Status"
          ]
        ],
        body: filteredSubscribers.map(sub => {
          const fullName = (sub.firstName || sub.lastName)
            ? `${sub.firstName || ''} ${sub.lastName || ''}`.trim()
            : (sub.name || '');
          const date = sub.timestamp
            ? (
                typeof sub.timestamp === 'number'
                  ? new Date(sub.timestamp).toLocaleString()
                  : new Date(Date.parse(sub.timestamp)).toLocaleString()
              )
            : (sub.subscriptionDate || '');
          return [
            fullName,
            sub.email || '',
            sub.phone || '',
            date,
            sub.school || sub.institution || '',
            sub.event || '',
            sub.status || ''
          ];
        }),
        styles: { fontSize: 8 }
      });
      doc.save("event_subscribers.pdf");
      Swal.fire({
        icon: 'success',
        title: 'PDF Downloaded',
        text: 'Your event subscribers PDF has been downloaded successfully.',
        confirmButtonText: 'OK'
      });
    } catch (error) {
      console.error('PDF download error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Download Failed',
        text: 'There was an error downloading the PDF.',
        confirmButtonText: 'OK'
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Event Subscribers</h1>
          <p className="text-gray-600 mt-1">Manage your event subscriber list</p>
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
        {loading ? (
          <div className="text-center text-gray-500 py-10">Loading subscribers...</div>
        ) : (
          <>
            {/* Responsive Table Wrapper */}
            <div className="w-full overflow-x-auto">
              <table className="min-w-full">
                <thead className="hidden sm:table-header-group">
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Full Name</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Email</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Phone Number</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">School/Institution</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Event</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedSubscribers.map((subscriber) => (
                    <tr
                      key={subscriber.id}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      {/* Desktop/Table view */}
                      <td className="py-4 px-4 text-gray-700 hidden sm:table-cell">
                        {subscriber.firstName || subscriber.lastName
                          ? `${subscriber.firstName || ''} ${subscriber.lastName || ''}`.trim()
                          : subscriber.name || ''}
                      </td>
                      <td className="py-4 px-4 text-gray-700 hidden sm:table-cell">{subscriber.email || ''}</td>
                      <td className="py-4 px-4 text-gray-700 hidden sm:table-cell">{subscriber.phone || ''}</td>
                      <td className="py-4 px-4 text-sm text-gray-600 hidden sm:table-cell">{subscriber.school || subscriber.institution || ''}</td>
                      <td className="py-4 px-4 text-sm text-gray-600 hidden sm:table-cell">{subscriber.event || ''}</td>

                      {/* Mobile/Column view */}
                      <td className="py-4 px-4 text-gray-700 sm:hidden" colSpan={7}>
                        <div className="flex flex-col gap-2 border rounded-lg p-3 bg-gray-50 overflow-hidden">
                          <div>
                            <span className="font-semibold">Full Name: </span>
                            {subscriber.firstName || subscriber.lastName
                              ? `${subscriber.firstName || ''} ${subscriber.lastName || ''}`.trim()
                              : subscriber.name || ''}
                          </div>
                          <div>
                            <span className="font-semibold">Email: </span>
                            {subscriber.email || ''}
                          </div>
                          <div>
                            <span className="font-semibold">Phone: </span>
                            {subscriber.phone || ''}
                          </div>
                          <div>
                            <span className="font-semibold">School/Institution: </span>
                            {subscriber.school || subscriber.institution || ''}
                          </div>
                          <div>
                            <span className="font-semibold">Event: </span>
                            {subscriber.event || ''}
                          </div>
                         
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
          </>
        )}
      </Card>
    </div>
  );
}