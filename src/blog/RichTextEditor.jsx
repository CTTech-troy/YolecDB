import { useState } from 'react';

export default function RichTextEditor({ value, onChange, placeholder }) {
  const [activeFormats, setActiveFormats] = useState([]);

  const formatText = (command, val) => {
    document.execCommand(command, false, val);
    updateActiveFormats();
  };

  const updateActiveFormats = () => {
    const formats = [];
    if (document.queryCommandState('bold')) formats.push('bold');
    if (document.queryCommandState('italic')) formats.push('italic');
    if (document.queryCommandState('underline')) formats.push('underline');
    setActiveFormats(formats);
  };

  const handleInput = (e) => {
    onChange(e.currentTarget.innerHTML);
  };

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden">
      <div className="flex items-center gap-1 p-2 border-b border-gray-200 bg-gray-50">
        <button
          type="button"
          onClick={() => formatText('bold')}
          className={`w-8 h-8 flex items-center justify-center rounded hover:bg-gray-200 cursor-pointer ${
            activeFormats.includes('bold') ? 'bg-gray-300' : ''
          }`}
        >
          <i className="ri-bold text-sm"></i>
        </button>
        <button
          type="button"
          onClick={() => formatText('italic')}
          className={`w-8 h-8 flex items-center justify-center rounded hover:bg-gray-200 cursor-pointer ${
            activeFormats.includes('italic') ? 'bg-gray-300' : ''
          }`}
        >
          <i className="ri-italic text-sm"></i>
        </button>
        <button
          type="button"
          onClick={() => formatText('underline')}
          className={`w-8 h-8 flex items-center justify-center rounded hover:bg-gray-200 cursor-pointer ${
            activeFormats.includes('underline') ? 'bg-gray-300' : ''
          }`}
        >
          <i className="ri-underline text-sm"></i>
        </button>
        <div className="w-px h-6 bg-gray-300 mx-1"></div>
        <button
          type="button"
          onClick={() => formatText('insertUnorderedList')}
          className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-200 cursor-pointer"
        >
          <i className="ri-list-unordered text-sm"></i>
        </button>
        <button
          type="button"
          onClick={() => formatText('insertOrderedList')}
          className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-200 cursor-pointer"
        >
          <i className="ri-list-ordered text-sm"></i>
        </button>
      </div>
      <div
        contentEditable
        onInput={handleInput}
        onMouseUp={updateActiveFormats}
        onKeyUp={updateActiveFormats}
        className="p-4 min-h-32 focus:outline-none"
        style={{ minHeight: '120px' }}
        dangerouslySetInnerHTML={{ __html: value }}
        data-placeholder={placeholder}
      />
    </div>
  );
}