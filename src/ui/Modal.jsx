
import PropTypes from 'prop-types';

export default function Modal({ isOpen, onClose, title, children, maxWidth = 'max-w-lg' }) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-0 sm:p-4 bg-black/50"
      onClick={onClose}
      role="presentation"
    >
      <div
        className={`bg-white shadow-xl w-full ${maxWidth} sm:rounded-lg rounded-t-2xl max-h-[min(92dvh,100svh)] flex flex-col sm:mx-0 min-w-0`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 px-4 py-4 sm:px-6 sm:py-4 border-b border-gray-200 shrink-0">
          <h3 id="modal-title" className="text-base sm:text-lg font-semibold text-gray-900 pr-2 leading-snug">
            {title}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 w-10 h-10 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg text-gray-500 hover:text-gray-800 hover:bg-gray-100"
            aria-label="Close modal"
          >
            <i className="ri-close-line text-xl" />
          </button>
        </div>
        <div className="px-4 py-4 sm:px-6 sm:pb-6 overflow-y-auto flex-1 min-h-0 overscroll-contain">
          {children}
        </div>
      </div>
    </div>
  );
}

Modal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  maxWidth: PropTypes.string,
};
