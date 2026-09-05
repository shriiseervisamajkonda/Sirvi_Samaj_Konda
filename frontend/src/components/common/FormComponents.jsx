import React from 'react';
import { FiAlertCircle, FiCheck } from 'react-icons/fi';

/**
 * Standard Form Section Divider & Title
 */
export const FormSection = ({ title, subtitle, icon: Icon, children }) => (
  <div className="space-y-4 pt-4 first:pt-0">
    {title && (
      <div className="pb-2 border-b border-[#E8DCC8] flex items-center justify-between">
        <div className="flex items-center gap-2">
          {Icon && <Icon className="w-4 h-4 text-[#C85A17]" />}
          <h4 className="text-xs sm:text-sm font-black text-[#7A2525] uppercase tracking-wider">
            {title}
          </h4>
        </div>
        {subtitle && (
          <span className="text-[11px] text-[#766A60] font-medium hidden sm:inline">
            {subtitle}
          </span>
        )}
      </div>
    )}
    <div className="space-y-4">{children}</div>
  </div>
);

/**
 * Standard Form Field Wrapper (Label, Required Asterisk, Error Message, Helper Text)
 */
export const FormField = ({
  label,
  htmlFor,
  required = false,
  error,
  helperText,
  className = '',
  children,
}) => (
  <div className={`space-y-1.5 ${className}`}>
    {label && (
      <label htmlFor={htmlFor} className="block text-xs font-black uppercase tracking-wider text-[#7A2525]">
        {label} {required && <span className="text-red-500 font-black">*</span>}
      </label>
    )}
    {children}
    {error && (
      <p className="flex items-center gap-1 text-xs font-bold text-red-600 animate-fadeIn">
        <FiAlertCircle className="w-3.5 h-3.5 shrink-0" />
        <span>{typeof error === 'string' ? error : error.message || 'यह फ़ील्ड आवश्यक है'}</span>
      </p>
    )}
    {helperText && !error && (
      <p className="text-[11px] text-[#766A60] font-medium">{helperText}</p>
    )}
  </div>
);

/**
 * Standard Modal Form Actions Bar
 */
export const FormActions = ({
  onCancel,
  cancelText = 'रद्द करें (Cancel)',
  submitText = 'सहेजें (Save)',
  loading = false,
  loadingText = 'सहेजा जा रहा है...',
}) => (
  <div className="flex items-center justify-end gap-3 pt-6 border-t border-[#E8DCC8] bg-white sticky bottom-0">
    <button
      type="button"
      onClick={onCancel}
      disabled={loading}
      className="px-5 py-2.5 text-xs sm:text-sm font-bold text-[#766A60] bg-white hover:bg-[#FFF8EC] border border-[#E8DCC8] rounded-2xl transition cursor-pointer disabled:opacity-50"
    >
      {cancelText}
    </button>
    <button
      type="submit"
      disabled={loading}
      className="px-6 py-2.5 text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-[#7A2525] to-[#C85A17] hover:from-[#8C2C1D] hover:to-[#A7450D] rounded-2xl shadow-md hover:shadow-lg transition cursor-pointer disabled:opacity-50 flex items-center gap-2"
    >
      {loading ? (
        <>
          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          <span>{loadingText}</span>
        </>
      ) : (
        <span>{submitText}</span>
      )}
    </button>
  </div>
);
