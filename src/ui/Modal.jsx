
import PropTypes from 'prop-types';
import { AppModal } from '../components/ui/AppModal';

export default function Modal({ isOpen, onClose, title, children, footer, maxWidth = 'max-w-lg' }) {
  const size =
    maxWidth.includes('4xl') || maxWidth.includes('5xl') || maxWidth.includes('6xl')
      ? 'xl'
      : maxWidth.includes('2xl') || maxWidth.includes('3xl')
      ? 'lg'
      : maxWidth.includes('md')
      ? 'sm'
      : 'md';

  return (
    <AppModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size={size}
      footer={footer}
      bodyClassName="legacy-modal-body"
    >
      {children}
    </AppModal>
  );
}

Modal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  footer: PropTypes.node,
  maxWidth: PropTypes.string,
};
