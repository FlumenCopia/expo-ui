'use client';

import React, { useState } from 'react';

interface PasswordFormModalProps {
  userName: string;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (newPassword: string) => void;
}

export const PasswordFormModal: React.FC<PasswordFormModalProps> = ({
  userName,
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [newPassword, setNewPassword] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      alert('Password must be at least 6 characters');
      return;
    }

    onSubmit(newPassword);
    setNewPassword('');
    onClose();
  };

  return (
    <div
      className="ovl show"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal">
        <div className="m-h">
          <div className="m-t">Change Password — {userName}</div>
          <button className="m-x" onClick={onClose}>
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="m-b">
            <div className="fg">
              <label className="fl">New Password</label>
              <input
                className="fi"
                type="password"
                placeholder="Minimum 6 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="m-f">
            <button type="button" className="btn btn-s" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-p">
              Update Password
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
