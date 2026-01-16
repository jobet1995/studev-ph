"use client";

import { useState } from 'react';

interface SettingCategory {
  id: string;
  title: string;
  description: string;
}

interface SettingItem {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'checkbox' | 'select' | 'number';
  value: string | number | boolean;
  options?: { value: string; label: string }[];
  description?: string;
}

const SettingsPage = () => {
  const [activeCategory, setActiveCategory] = useState('general');

  // Mock settings data
  const settingCategories: SettingCategory[] = [
    { id: 'general', title: 'General', description: 'Basic site settings' },
    { id: 'appearance', title: 'Appearance', description: 'Theme and styling options' },
    { id: 'seo', title: 'SEO', description: 'Search engine optimization settings' },
    { id: 'security', title: 'Security', description: 'Authentication and security options' },
    { id: 'integrations', title: 'Integrations', description: 'Third-party services and APIs' },
  ];

  const [settings, setSettings] = useState<Record<string, SettingItem[]>>({
    general: [
      {
        id: 'site_title',
        label: 'Site Title',
        type: 'text',
        value: 'StuDev Platform',
        description: 'The name of your website'
      },
      {
        id: 'site_description',
        label: 'Site Description',
        type: 'textarea',
        value: 'A platform for student developers to learn and grow',
        description: 'Brief description of your website'
      },
      {
        id: 'site_email',
        label: 'Contact Email',
        type: 'text',
        value: 'contact@studev.com',
        description: 'Email address for contact'
      },
      {
        id: 'maintenance_mode',
        label: 'Maintenance Mode',
        type: 'checkbox',
        value: false,
        description: 'Enable maintenance mode for visitors'
      }
    ],
    appearance: [
      {
        id: 'theme_color',
        label: 'Primary Theme Color',
        type: 'select',
        value: '#4f46e5',
        options: [
          { value: '#4f46e5', label: 'Indigo (Default)' },
          { value: '#7c3aed', label: 'Violet' },
          { value: '#ec4899', label: 'Pink' },
          { value: '#f59e0b', label: 'Amber' },
          { value: '#10b981', label: 'Emerald' }
        ],
        description: 'Primary color for your theme'
      },
      {
        id: 'show_author',
        label: 'Show Author Info',
        type: 'checkbox',
        value: true,
        description: 'Display author information on blog posts'
      },
      {
        id: 'posts_per_page',
        label: 'Posts Per Page',
        type: 'number',
        value: 10,
        description: 'Number of posts to show per page'
      }
    ],
    seo: [
      {
        id: 'meta_keywords',
        label: 'Meta Keywords',
        type: 'textarea',
        value: 'student, developer, learning, programming, coding',
        description: 'Comma-separated keywords for SEO'
      },
      {
        id: 'google_analytics',
        label: 'Google Analytics ID',
        type: 'text',
        value: '',
        description: 'Your Google Analytics tracking ID'
      },
      {
        id: 'sitemap_enabled',
        label: 'Enable Sitemap',
        type: 'checkbox',
        value: true,
        description: 'Generate and serve a sitemap.xml'
      }
    ],
    security: [
      {
        id: 'require_login_blogs',
        label: 'Require Login for Blogs',
        type: 'checkbox',
        value: false,
        description: 'Users must log in to view blog posts'
      },
      {
        id: 'recaptcha_enabled',
        label: 'Enable reCAPTCHA',
        type: 'checkbox',
        value: false,
        description: 'Protect forms with reCAPTCHA'
      },
      {
        id: 'session_timeout',
        label: 'Session Timeout (minutes)',
        type: 'number',
        value: 60,
        description: 'Duration before session expires'
      }
    ],
    integrations: [
      {
        id: 'mailchimp_api',
        label: 'Mailchimp API Key',
        type: 'text',
        value: '',
        description: 'API key for Mailchimp integration'
      },
      {
        id: 'slack_webhook',
        label: 'Slack Webhook URL',
        type: 'text',
        value: '',
        description: 'Webhook URL for Slack notifications'
      },
      {
        id: 'discord_notifications',
        label: 'Enable Discord Notifications',
        type: 'checkbox',
        value: false,
        description: 'Send notifications to Discord channel'
      }
    ]
  });

  const handleSettingChange = (categoryId: string, settingId: string, value: string | number | boolean) => {
    setSettings(prev => ({
      ...prev,
      [categoryId]: prev[categoryId].map(setting => 
        setting.id === settingId ? { ...setting, value } : setting
      )
    }));
  };

  const saveSettings = () => {
    // In a real app, this would send the settings to the backend
    alert('Settings saved successfully!');
  };

  const renderSettingField = (setting: SettingItem) => {
    switch (setting.type) {
      case 'text':
        return (
          <input
            type="text"
            value={setting.value as string}
            onChange={(e) => handleSettingChange(activeCategory, setting.id, e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 bg-white text-gray-900 shadow-inner focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200 sm:text-sm p-2 border-2 transition duration-200"
          />
        );
      case 'textarea':
        return (
          <textarea
            value={setting.value as string}
            onChange={(e) => handleSettingChange(activeCategory, setting.id, e.target.value)}
            rows={4}
            className="mt-1 block w-full rounded-md border-gray-300 bg-white text-gray-900 shadow-inner focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200 sm:text-sm p-2 border-2 transition duration-200"
          />
        );
      case 'checkbox':
        return (
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={setting.value as boolean}
              onChange={(e) => handleSettingChange(activeCategory, setting.id, e.target.checked)}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
          </div>
        );
      case 'select':
        return (
          <select
            value={setting.value as string}
            onChange={(e) => handleSettingChange(activeCategory, setting.id, e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 bg-white text-gray-900 shadow-inner focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200 sm:text-sm p-2 border-2 transition duration-200"
          >
            {setting.options?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
      case 'number':
        return (
          <input
            type="number"
            value={setting.value as number}
            onChange={(e) => handleSettingChange(activeCategory, setting.id, Number(e.target.value))}
            className="mt-1 block w-full rounded-md border-gray-300 bg-white text-gray-900 shadow-inner focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200 sm:text-sm p-2 border-2 transition duration-200"
          />
        );
      default:
        return null;
    }
  };

  const currentSettings = settings[activeCategory] || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-800">Configure your application settings and preferences</p>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex overflow-x-auto">
            {settingCategories.map(category => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`whitespace-nowrap py-4 px-6 text-sm font-medium ${
                  activeCategory === category.id
                    ? 'border-b-2 border-indigo-500 text-indigo-600'
                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {category.title}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <h2 className="text-lg font-medium text-gray-900">
              {settingCategories.find(cat => cat.id === activeCategory)?.title}
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              {settingCategories.find(cat => cat.id === activeCategory)?.description}
            </p>
          </div>

          <div className="space-y-6">
            {currentSettings.map(setting => (
              <div key={setting.id} className="border-b border-gray-200 pb-6 last:border-0 last:pb-0">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">{setting.label}</h3>
                    {setting.description && (
                      <p className="mt-1 text-sm text-gray-500">{setting.description}</p>
                    )}
                  </div>
                  <div className="md:col-span-2">
                    {renderSettingField(setting)}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 flex justify-end">
            <button
              onClick={saveSettings}
              className="bg-indigo-600 text-white px-6 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 transition duration-200"
            >
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;