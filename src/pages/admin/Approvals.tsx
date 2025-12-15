// Halaman untuk admin approve/reject registrasi
import { useState, useEffect } from 'react';

interface PendingUser {
  id: string;
  name: string;
  nisn: string;
  email: string;
  class: string;
  faceImages: string[];
  createdAt: string;
}

export default function ApprovalsPage() {
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  
  const handleApprove = async (userId: string) => {
    // Update status to 'approved'
    // Send email notification
  };
  
  const handleReject = async (userId: string, reason: string) => {
    // Update status to 'rejected'
    // Send email with reason
  };
  
  return (
    <div>
      {/* List pending registrations with photos */}
      {/* Approve/Reject buttons */}
    </div>
  );
}