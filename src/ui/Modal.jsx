
// Remove TypeScript interface, use JSDoc for prop types if needed
import PropTypes from 'prop-types';

/**
 * @param {{
 *   isOpen: boolean,
 *   onClose: () => void,
 *   title: string,
 *   children: React.ReactNode,
 *   maxWidth?: string
 * }} props
 */
export default function Modal({ isOpen, onClose, title, children, maxWidth = 'max-w-lg' }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className={`bg-white rounded-lg shadow-xl ${maxWidth} w-full mx-4`}>
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <button
            onClick={onClose}
            className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-600 cursor-pointer"
            aria-label="Close modal"
          >
            <i className="ri-close-line"></i>
          </button>
        </div>
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
}

// Optional: PropTypes for runtime prop validation
Modal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  maxWidth: PropTypes.string,
};