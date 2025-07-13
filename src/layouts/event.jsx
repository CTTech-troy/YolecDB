import React, { useState, useEffect } from 'react';

const Event = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeSection, setActiveSection] = useState('events');
  const [showPreview, setShowPreview] = useState(false);
  const [previewMode, setPreviewMode] = useState('desktop');
  const [formData, setFormData] = useState({
    title: '',
    eventType: '',
    description: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    timezone: 'UTC-5',
    locationType: 'physical',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    meetingLink: '',
    featuredImage: null
  });
  const [errors, setErrors] = useState({});
  const [isDragOver, setIsDragOver] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  // Track window width for responsiveness
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Responsive sidebar behavior
  useEffect(() => {
    if (windowWidth < 768) {
      setSidebarCollapsed(true);
    } else {
      setSidebarCollapsed(false);
    }
  }, [windowWidth]);

  // Responsive preview behavior
  useEffect(() => {
    if (windowWidth < 1024) {
      setPreviewMode('mobile');
    } else {
      setPreviewMode('desktop');
    }
  }, [windowWidth]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard Overview', icon: 'fas fa-tachometer-alt' },
    { id: 'testimonials', label: 'Testimonials', icon: 'fas fa-quote-left' },
    { id: 'blog', label: 'Blog Manager', icon: 'fas fa-blog' },
    { id: 'analytics', label: 'Analytics', icon: 'fas fa-chart-line' },
    { id: 'model', label: 'Model Display Pictures', icon: 'fas fa-image' },
    { id: 'newsletter', label: 'Newsletter Subscribers', icon: 'fas fa-envelope' },
    { id: 'events', label: 'Event Manager', icon: 'fas fa-calendar-alt' }
  ];

  const eventTypes = [
    'Conference',
    'Workshop',
    'Webinar',
    'Seminar',
    'Networking Event',
    'Product Launch',
    'Training Session',
    'Panel Discussion'
  ];

  const timezones = [
    'UTC-12', 'UTC-11', 'UTC-10', 'UTC-9', 'UTC-8', 'UTC-7', 'UTC-6', 'UTC-5',
    'UTC-4', 'UTC-3', 'UTC-2', 'UTC-1', 'UTC+0', 'UTC+1', 'UTC+2', 'UTC+3',
    'UTC+4', 'UTC+5', 'UTC+6', 'UTC+7', 'UTC+8', 'UTC+9', 'UTC+10', 'UTC+11', 'UTC+12'
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    
    if (!formData.title.trim()) newErrors.title = 'Event title is required';
    if (!formData.eventType) newErrors.eventType = 'Event type is required';
    if (!formData.description.trim()) newErrors.description = 'Event description is required';
    if (!formData.startDate) newErrors.startDate = 'Start date is required';
    if (!formData.startTime) newErrors.startTime = 'Start time is required';
    if (!formData.endDate) newErrors.endDate = 'End date is required';
    if (!formData.endTime) newErrors.endTime = 'End time is required';
    
    if (formData.locationType === 'physical') {
      if (!formData.address.trim()) newErrors.address = 'Address is required for physical events';
      if (!formData.city.trim()) newErrors.city = 'City is required for physical events';
    } else {
      if (!formData.meetingLink.trim()) newErrors.meetingLink = 'Meeting link is required for virtual events';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleImageUpload = (file) => {
    if (file && file.type.startsWith('image/')) {
      setFormData(prev => ({ ...prev, featuredImage: file }));
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleImageUpload(files[0]);
    }
  };

  const handleSaveDraft = () => {
    console.log('Saving as draft...', formData);
  };

  const handlePublish = () => {
    if (validateForm()) {
      console.log('Publishing event...', formData);
    }
  };

  const renderEventForm = () => (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-sm text-gray-500 mb-2 flex-wrap">
            <a href="https://readdy.ai/home/80bf8fc2-c347-4b33-a25a-b3fb581a3a50/cca344bf-6fbc-442a-9794-61a02daf6cb5" data-readdy="true" className="cursor-pointer hover:text-blue-600">Dashboard</a>
            <i className="fas fa-chevron-right text-xs"></i>
            <span>Event Manager</span>
            <i className="fas fa-chevron-right text-xs"></i>
            <span className="text-gray-900">Create Event</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Create New Event</h1>
          <p className="text-gray-600 mt-2">Fill in the details below to create and publish your event announcement</p>
        </div>
        <div className="flex items-center justify-end md:justify-start">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="!rounded-button whitespace-nowrap cursor-pointer bg-gray-100 text-gray-700 px-4 py-2 md:px-6 md:py-3 hover:bg-gray-200 transition-colors text-sm md:text-base"
          >
            <i className="fas fa-eye mr-2"></i>
            {showPreview ? 'Hide Preview' : 'Show Preview'}
          </button>
        </div>
      </div>

      <div className={`grid ${showPreview ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'} gap-8`}>
        {/* Form Section */}
        <div className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Basic Information</h3>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Event Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.title ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="Enter event title"
                />
                {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Event Type <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={formData.eventType}
                    onChange={(e) => handleInputChange('eventType', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none ${errors.eventType ? 'border-red-500' : 'border-gray-300'}`}
                  >
                    <option value="">Select event type</option>
                    {eventTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                  <i className="fas fa-chevron-down absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"></i>
                </div>
                {errors.eventType && <p className="text-red-500 text-xs mt-1">{errors.eventType}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Event Description <span className="text-red-500">*</span>
                </label>
                <div className="border rounded-lg">
                  <div className="flex items-center space-x-2 p-3 border-b border-gray-200 bg-gray-50 overflow-x-auto">
                    <button className="!rounded-button whitespace-nowrap cursor-pointer p-2 text-gray-600 hover:bg-gray-200 transition-colors">
                      <i className="fas fa-bold text-sm"></i>
                    </button>
                    <button className="!rounded-button whitespace-nowrap cursor-pointer p-2 text-gray-600 hover:bg-gray-200 transition-colors">
                      <i className="fas fa-italic text-sm"></i>
                    </button>
                    <button className="!rounded-button whitespace-nowrap cursor-pointer p-2 text-gray-600 hover:bg-gray-200 transition-colors">
                      <i className="fas fa-underline text-sm"></i>
                    </button>
                    <button className="!rounded-button whitespace-nowrap cursor-pointer p-2 text-gray-600 hover:bg-gray-200 transition-colors">
                      <i className="fas fa-list-ul text-sm"></i>
                    </button>
                    <button className="!rounded-button whitespace-nowrap cursor-pointer p-2 text-gray-600 hover:bg-gray-200 transition-colors">
                      <i className="fas fa-link text-sm"></i>
                    </button>
                  </div>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={6}
                    className={`w-full p-4 text-sm focus:outline-none resize-none ${errors.description ? 'border-red-500' : ''}`}
                    placeholder="Describe your event in detail..."
                  />
                </div>
                {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
              </div>
            </div>
          </div>

          {/* Date and Time */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Date and Time</h3>
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleInputChange('startDate', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.startDate ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {errors.startDate && <p className="text-red-500 text-xs mt-1">{errors.startDate}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => handleInputChange('startTime', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.startTime ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {errors.startTime && <p className="text-red-500 text-xs mt-1">{errors.startTime}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => handleInputChange('endDate', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.endDate ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {errors.endDate && <p className="text-red-500 text-xs mt-1">{errors.endDate}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => handleInputChange('endTime', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.endTime ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {errors.endTime && <p className="text-red-500 text-xs mt-1">{errors.endTime}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Time Zone</label>
                <div className="relative">
                  <select
                    value={formData.timezone}
                    onChange={(e) => handleInputChange('timezone', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                  >
                    {timezones.map(tz => (
                      <option key={tz} value={tz}>{tz}</option>
                    ))}
                  </select>
                  <i className="fas fa-chevron-down absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"></i>
                </div>
              </div>
            </div>
          </div>

          {/* Location Details */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Location Details</h3>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Location Type</label>
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                  <button
                    onClick={() => handleInputChange('locationType', 'physical')}
                    className={`!rounded-button whitespace-nowrap cursor-pointer flex items-center space-x-2 px-4 py-3 border transition-colors ${
                      formData.locationType === 'physical'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <i className="fas fa-map-marker-alt"></i>
                    <span>Physical Location</span>
                  </button>
                  <button
                    onClick={() => handleInputChange('locationType', 'virtual')}
                    className={`!rounded-button whitespace-nowrap cursor-pointer flex items-center space-x-2 px-4 py-3 border transition-colors ${
                      formData.locationType === 'virtual'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <i className="fas fa-video"></i>
                    <span>Virtual Event</span>
                  </button>
                </div>
              </div>

              {formData.locationType === 'physical' ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      className={`w-full px-4 py-3 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.address ? 'border-red-500' : 'border-gray-300'}`}
                      placeholder="Enter street address"
                    />
                    {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        City <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        className={`w-full px-4 py-3 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.city ? 'border-red-500' : 'border-gray-300'}`}
                        placeholder="City"
                      />
                      {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                      <input
                        type="text"
                        value={formData.state}
                        onChange={(e) => handleInputChange('state', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="State"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">ZIP Code</label>
                      <input
                        type="text"
                        value={formData.zipCode}
                        onChange={(e) => handleInputChange('zipCode', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="ZIP"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Meeting Link <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="url"
                    value={formData.meetingLink}
                    onChange={(e) => handleInputChange('meetingLink', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.meetingLink ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="https://zoom.us/j/..."
                  />
                  {errors.meetingLink && <p className="text-red-500 text-xs mt-1">{errors.meetingLink}</p>}
                </div>
              )}
            </div>
          </div>

          {/* Featured Image Upload */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Featured Image</h3>
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                isDragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
              }`}
            >
              {formData.featuredImage ? (
                <div className="space-y-4">
                  <div className="w-32 h-32 mx-auto bg-gray-100 rounded-lg flex items-center justify-center">
                    <i className="fas fa-image text-4xl text-gray-400"></i>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{formData.featuredImage.name}</p>
                    <p className="text-xs text-gray-500">{(formData.featuredImage.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                  <button
                    onClick={() => setFormData(prev => ({ ...prev, featuredImage: null }))}
                    className="!rounded-button whitespace-nowrap cursor-pointer text-red-600 hover:text-red-700 text-sm"
                  >
                    Remove Image
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="w-16 h-16 mx-auto bg-gray-100 rounded-lg flex items-center justify-center">
                    <i className="fas fa-cloud-upload-alt text-2xl text-gray-400"></i>
                  </div>
                  <div>
                    <p className="text-lg font-medium text-gray-900">Drop your image here</p>
                    <p className="text-sm text-gray-500">or click to browse</p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => e.target.files && handleImageUpload(e.target.files[0])}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="!rounded-button whitespace-nowrap cursor-pointer inline-block bg-blue-600 text-white px-4 py-2 md:px-6 md:py-3 hover:bg-blue-700 transition-colors text-sm md:text-base"
                  >
                    Choose File
                  </label>
                  <p className="text-xs text-gray-400">Supported formats: JPG, PNG, GIF (Max 5MB)</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Preview Section */}
        {showPreview && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                <h3 className="text-xl font-semibold text-gray-900">Event Preview</h3>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setPreviewMode('desktop')}
                    className={`!rounded-button whitespace-nowrap cursor-pointer px-3 py-2 text-sm transition-colors ${
                      previewMode === 'desktop'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <i className="fas fa-desktop mr-1"></i>Desktop
                  </button>
                  <button
                    onClick={() => setPreviewMode('mobile')}
                    className={`!rounded-button whitespace-nowrap cursor-pointer px-3 py-2 text-sm transition-colors ${
                      previewMode === 'mobile'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <i className="fas fa-mobile-alt mr-1"></i>Mobile
                  </button>
                </div>
              </div>

              <div className={`border rounded-lg overflow-hidden ${previewMode === 'mobile' ? 'max-w-sm mx-auto' : ''}`}>
                <div className="aspect-video bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center">
                  {formData.featuredImage ? (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <i className="fas fa-image text-4xl text-gray-400"></i>
                    </div>
                  ) : (
                    <img
                      src="https://readdy.ai/api/search-image?query=modern%20professional%20conference%20event%20with%20elegant%20lighting%20and%20contemporary%20design%20elements%20in%20a%20spacious%20venue%20with%20clean%20minimalist%20background&width=600&height=300&seq=event-preview-1&orientation=landscape"
                      alt="Event preview"
                      className="w-full h-full object-cover object-top"
                    />
                  )}
                </div>
                <div className="p-4 md:p-6">
                  <div className="flex items-center space-x-2 mb-3 flex-wrap">
                    {formData.eventType && (
                      <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded">
                        {formData.eventType}
                      </span>
                    )}
                    <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded">
                      {formData.locationType === 'physical' ? 'In-Person' : 'Virtual'}
                    </span>
                  </div>
                  <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-3">
                    {formData.title || 'Event Title'}
                  </h2>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {formData.description || 'Event description will appear here...'}
                  </p>
                  <div className="space-y-2 text-sm text-gray-500">
                    <div className="flex items-center space-x-2">
                      <i className="fas fa-calendar text-blue-600"></i>
                      <span>
                        {formData.startDate && formData.endDate
                          ? `${formData.startDate} - ${formData.endDate}`
                          : 'Event dates'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <i className="fas fa-clock text-blue-600"></i>
                      <span>
                        {formData.startTime && formData.endTime
                          ? `${formData.startTime} - ${formData.endTime} (${formData.timezone})`
                          : 'Event time'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <i className={`fas ${formData.locationType === 'physical' ? 'fa-map-marker-alt' : 'fa-video'} text-blue-600`}></i>
                      <span>
                        {formData.locationType === 'physical'
                          ? (formData.address && formData.city
                              ? `${formData.address}, ${formData.city}`
                              : 'Event location')
                          : (formData.meetingLink || 'Virtual meeting link')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Fixed Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-4 z-20">
        <div className={`flex flex-col md:flex-row items-center justify-between transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
          <button
            onClick={handleSaveDraft}
            className="!rounded-button whitespace-nowrap cursor-pointer bg-gray-100 text-gray-700 px-4 py-2 mb-2 md:mb-0 md:mr-4 hover:bg-gray-200 transition-colors w-full md:w-auto"
          >
            <i className="fas fa-save mr-2"></i>
            Save as Draft
          </button>
          <div className="flex space-y-2 md:space-y-0 flex-col md:flex-row w-full md:w-auto">
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="!rounded-button whitespace-nowrap cursor-pointer bg-blue-100 text-blue-700 px-4 py-2 mb-2 md:mb-0 md:mr-4 hover:bg-blue-200 transition-colors w-full md:w-auto"
            >
              <i className="fas fa-eye mr-2"></i>
              Preview
            </button>
            <button
              onClick={handlePublish}
              className="!rounded-button whitespace-nowrap cursor-pointer bg-blue-600 text-white px-4 py-2 hover:bg-blue-700 transition-colors w-full md:w-auto"
            >
              <i className="fas fa-rocket mr-2"></i>
              Publish Event
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'events':
        return renderEventForm();
      case 'dashboard':
        return (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
            <p className="text-gray-600">Welcome back to your admin dashboard</p>
          </div>
        );
      case 'testimonials':
        return (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">Testimonials Management</h1>
            <p className="text-gray-600">Manage and review customer testimonials</p>
          </div>
        );
      case 'blog':
        return (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">Blog Manager</h1>
            <p className="text-gray-600">Create and manage your blog posts</p>
          </div>
        );
      case 'analytics':
        return (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="text-gray-600">Track your website performance and user engagement</p>
          </div>
        );
      case 'model':
        return (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">Model Display Pictures</h1>
            <p className="text-gray-600">Manage homepage display images</p>
          </div>
        );
      case 'newsletter':
        return (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">Newsletter Subscribers</h1>
            <p className="text-gray-600">Manage your newsletter subscriber list</p>
          </div>
        );
      default:
        return renderEventForm();
    }
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      {/* Sidebar */}
      <div className={`fixed left-0 top-0 h-full bg-white border-r border-gray-200 transition-all duration-300 z-30 ${sidebarCollapsed ? 'w-16' : 'w-64'}`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-200">
            {!sidebarCollapsed && (
              <div className="flex items-center space-x-3">
                <div className="bg-blue-600 p-2 rounded-lg">
                  <i className="fas fa-crown text-white text-xl"></i>
                </div>
                <span className="text-xl font-bold text-gray-900">AdminPro</span>
              </div>
            )}
            <button
              onClick={toggleSidebar}
              className="!rounded-button whitespace-nowrap cursor-pointer p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <i className={`fas ${sidebarCollapsed ? 'fa-chevron-right' : 'fa-chevron-left'}`}></i>
            </button>
          </div>
          {/* Navigation */}
          <nav className="flex-1 p-2 md:p-4">
            <ul className="space-y-2">
              {sidebarItems.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => setActiveSection(item.id)}
                    className={`!rounded-button whitespace-nowrap cursor-pointer w-full flex items-center space-x-3 px-3 py-2 md:px-4 md:py-3 text-left transition-colors ${
                      activeSection === item.id
                        ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <i className={`${item.icon} text-lg`}></i>
                    {!sidebarCollapsed && <span className="font-medium text-sm md:text-base">{item.label}</span>}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-4 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="relative w-full md:w-80">
                <input
                  type="text"
                  placeholder="Search..."
                  className="border-none bg-gray-100 rounded-lg pl-10 pr-4 py-2 w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm"></i>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleDarkMode}
                className="!rounded-button whitespace-nowrap cursor-pointer p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <i className={`fas ${darkMode ? 'fa-sun' : 'fa-moon'} text-lg`}></i>
              </button>
              <button className="!rounded-button whitespace-nowrap cursor-pointer p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors relative">
                <i className="fas fa-bell text-lg"></i>
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">3</span>
              </button>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <i className="fas fa-user text-white text-sm"></i>
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-gray-900">Admin User</p>
                  <p className="text-xs text-gray-500">admin@example.com</p>
                </div>
                <button className="!rounded-button whitespace-nowrap cursor-pointer p-1 text-gray-500 hover:text-gray-700">
                  <i className="fas fa-chevron-down text-sm"></i>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 md:p-8 pb-24">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default Event;