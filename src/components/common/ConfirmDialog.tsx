import React from 'react';
import { Archive, Trash2, Flag } from 'lucide-react';

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'delete' | 'archive' | 'unarchive' | 'warning';
  isProcessing?: boolean;
  itemName?: string;
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  cancelText = 'Cancel',
  type = 'delete',
  isProcessing = false,
  itemName,
}) => {
  if (!isOpen) return null;

  const isDelete = type === 'delete';
  const isUnarchive = type === 'unarchive';
  const isWarning = type === 'warning';
  const iconBgColor = isDelete ? '#FFE5E5' : isUnarchive ? '#E5F5FF' : isWarning ? '#FFE5E5' : '#FFF4E5';
  const iconColor = isDelete ? '#FF4444' : isUnarchive ? '#3B82F6' : isWarning ? '#FF4444' : '#F59E0B';
  const buttonBgColor = isDelete ? '#FF4444' : isUnarchive ? '#3B82F6' : isWarning ? '#FF4444' : '#4C4185';
  const buttonHoverColor = isDelete ? '#E63939' : isUnarchive ? '#2563EB' : isWarning ? '#E63939' : '#3d3469';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop with Blur */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-all"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full">
          {/* Header */}
          <div className="px-6 py-5 border-b border-[#E5ECF0]">
            <div className="flex items-center gap-3">
              {/* Warning Icon */}
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
                style={{ backgroundColor: iconBgColor }}
              >
                {isDelete ? (
                  <Trash2 className="h-6 w-6" style={{ color: iconColor }} />
                ) : (
                  <Archive className="h-6 w-6" style={{ color: iconColor }} />
                )}
              </div>
              <div>
                <h3 className="text-xl font-semibold text-[#0D1317]">{title}</h3>
                <p className="text-sm text-[#5F6F7E] mt-0.5">
                  {isDelete ? 'This action cannot be undone' : isUnarchive ? 'This will restore the project' : 'This will archive the project'}
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-6">
            <p className="text-[#0D1317] leading-relaxed">
              {message}
              {itemName && (
                <>
                  {' '}
                  <span className="font-semibold" style={{ color: iconColor }}>
                    &ldquo;{itemName}&rdquo;
                  </span>
                  ?
                </>
              )}
            </p>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-[#F9FAFB] rounded-b-xl">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isProcessing}
                className="flex-1 px-4 py-2.5 border border-[#CBD7E5] text-[#5F6F7E] font-medium rounded-lg hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {cancelText}
              </button>
              <button
                type="button"
                onClick={onConfirm}
                disabled={isProcessing}
                className="flex-1 px-4 py-2.5 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                style={{
                  backgroundColor: isProcessing ? buttonBgColor + '80' : buttonBgColor,
                }}
                onMouseEnter={(e) => {
                  if (!isProcessing) {
                    e.currentTarget.style.backgroundColor = buttonHoverColor;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isProcessing) {
                    e.currentTarget.style.backgroundColor = buttonBgColor;
                  }
                }}
              >
                {isProcessing ? (
                  <>
                    <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>{isDelete ? 'Deleting...' : isUnarchive ? 'Unarchiving...' : isWarning ? 'Ending...' : 'Archiving...'}</span>
                  </>
                ) : (
                  <>
                    {isDelete ? (
                      <Trash2 className="h-4 w-4" />
                    ) : isWarning ? (
                      <Flag className="h-4 w-4" />
                    ) : (
                      <Archive className="h-4 w-4" />
                    )}
                    <span>{confirmText || (isDelete ? 'Delete' : isUnarchive ? 'Unarchive' : isWarning ? 'End Sprint' : 'Archive')}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
