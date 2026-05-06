import { useEffect, useState, useCallback } from "react";
import * as contactsApi from "../../services/contactsApi.js";

export default function ContactManager() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadContacts = useCallback(async () => {
    setError(null);
    try {
      const rows = await contactsApi.listContacts();
      setContacts(Array.isArray(rows) ? rows : []);
    } catch (e) {
      setError(e?.message || "Failed to load contacts");
      setContacts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadContacts();
  }, [loadContacts]);

  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";
    const date = new Date(timestamp);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  const handleEmailClick = (email) => {
    if (!email) return;
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}`;
    window.open(gmailUrl, "_blank");
  };

  return (
    <div className="container p-2 mx-auto sm:p-4 dark:text-gray-800">
      <h2 className="mb-4 text-2xl font-semibold leading-tight">Emails</h2>

      {error && (
        <p className="text-sm text-red-600 mb-4" role="alert">{error}</p>
      )}

      {loading ? (
        <div className="p-4 text-center text-gray-500">Loading…</div>
      ) : (
      <>
      <div className="hidden sm:flex flex-col overflow-x-auto text-xs">
        <div className="flex text-left bg-gray-100 dark:bg-gray-300 font-semibold">
          <div className="w-32 px-2 py-3 sm:p-3">Sender</div>
          <div className="flex-1 px-2 py-3 sm:p-3">Message</div>
          <div className="w-[80px] px-2 py-3 sm:p-3 text-center">Email</div>
          <div className="hidden w-24 px-2 py-3 text-right sm:p-3 sm:block">Received</div>
        </div>
      </div>

      {contacts.length === 0 ? (
        <div className="p-4 text-center text-gray-500">No submissions found.</div>
      ) : (
        <div className="space-y-2">
          {contacts.map((contact) => (
            <div
              key={`${contact._source || "c"}-${contact.id}`}
              className="border border-gray-200 rounded-lg p-3 text-sm dark:border-gray-300 dark:bg-gray-50 hover:bg-gray-50 transition sm:flex sm:border-0 sm:border-b sm:rounded-none"
            >

              <div className="flex flex-col flex-1 space-y-1 sm:space-y-0 sm:flex-row sm:items-center sm:w-full sm:space-x-4">
                <div className="sm:w-32 font-medium truncate">{contact.name || "N/A"}</div>

                <div className="sm:flex-1 whitespace-pre-wrap break-words max-w-full">
                  {contact.message || "N/A"}
                </div>

                <div
                  className="sm:w-[300px] text-blue-600 underline cursor-pointer break-words text-center"
                  onClick={() => handleEmailClick(contact.email)}
                  title="Click to email via Gmail"
                >
                  {contact.email || "N/A"}
                </div>

                <div className="sm:w-24 sm:text-right text-gray-500">
                  {formatDate(contact.timestamp)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      </>
      )}
    </div>
  );
}
