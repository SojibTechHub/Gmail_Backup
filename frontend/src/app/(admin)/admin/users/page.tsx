'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ArrowLeft, Users, Shield, Edit, Search, X } from 'lucide-react';
import { toast } from 'sonner';
import adminService from '../../../../services/admin.service';
import { IUser, UserRole } from '../../../../types';
import { DataTable, Column } from '../../../../components/ui/DataTable';
import { Modal } from '../../../../components/ui/Modal';
import { Button } from '../../../../components/ui/Button';
import { Avatar } from '../../../../components/ui/Avatar';
import { formatDate, timeAgo } from '../../../../utils/helpers';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<IUser[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');

  // Role Edit Modal
  const [selectedUser, setSelectedUser] = useState<IUser | null>(null);
  const [newRole, setNewRole] = useState<UserRole>(UserRole.USER);
  const [savingRole, setSavingRole] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminService.getUsers({
        search: search || undefined,
        role: role || undefined,
      });
      setUsers(data.users);
    } catch (err: unknown) {
      toast.error('Failed to load user directory');
    } finally {
      setLoading(false);
    }
  }, [search, role]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleUpdateRole = async () => {
    if (!selectedUser) return;
    setSavingRole(true);
    try {
      const updated = await adminService.updateUserRole(
        selectedUser.id || selectedUser._id || '',
        newRole
      );
      if (updated) {
        setUsers((prev) =>
          prev.map((u) => (u.id === updated.id || u._id === updated._id ? updated : u))
        );
      }
      setSelectedUser(null);
      toast.success('User role updated successfully');
    } catch (err: unknown) {
      toast.error('Failed to update role');
    } finally {
      setSavingRole(false);
    }
  };

  const columns: Column<IUser>[] = [
    {
      header: 'User',
      accessor: (row) => (
        <div className="flex items-center gap-3">
          <Avatar name={row.name} src={row.avatar} size="sm" />
          <div>
            <p className="font-bold text-xs text-base-content">{row.name}</p>
            <p className="text-[11px] text-base-content/60">{row.email}</p>
          </div>
        </div>
      ),
    },
    {
      header: 'Role',
      accessor: (row) => (
        <span
          className={`badge badge-sm font-semibold uppercase text-[10px] ${
            row.role === UserRole.ADMIN ? 'badge-primary text-white' : 'badge-ghost'
          }`}
        >
          {row.role}
        </span>
      ),
    },
    {
      header: 'Verified',
      accessor: (row) => (
        <span
          className={`badge badge-xs ${
            row.isEmailVerified ? 'badge-success text-white' : 'badge-warning'
          }`}
        >
          {row.isEmailVerified ? 'Verified' : 'Pending'}
        </span>
      ),
    },
    {
      header: 'MFA',
      accessor: (row) => (
        <span className="text-xs">{row.isMfaEnabled ? 'Enabled' : 'Disabled'}</span>
      ),
    },
    {
      header: 'Last Login',
      accessor: (row) => (
        <span className="text-xs text-base-content/70">
          {row.lastLogin ? timeAgo(row.lastLogin) : 'Never'}
        </span>
      ),
    },
    {
      header: 'Actions',
      accessor: (row) => (
        <Button
          variant="ghost"
          size="xs"
          leftIcon={Edit}
          onClick={() => {
            setSelectedUser(row);
            setNewRole(row.role);
          }}
        >
          Edit Role
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin"
          className="inline-flex items-center gap-1.5 text-xs text-base-content/60 hover:text-base-content font-medium mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Admin Overview
        </Link>
        <h1 className="text-2xl font-extrabold text-base-content tracking-tight">
          User Management Directory
        </h1>
        <p className="text-xs text-base-content/60 mt-0.5">
          View users, adjust permissions, and monitor authentication posture
        </p>
      </div>

      {/* Filter Bar */}
      <div className="card bg-base-100 border border-base-300 p-4 rounded-2xl shadow-sm flex flex-wrap items-center gap-3">
        <input
          type="text"
          placeholder="Search users by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input input-bordered input-sm rounded-xl text-xs flex-1 max-w-sm"
        />

        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="select select-bordered select-sm rounded-xl text-xs w-40"
        >
          <option value="">All Roles</option>
          <option value={UserRole.USER}>User</option>
          <option value={UserRole.ADMIN}>Admin</option>
          <option value={UserRole.SUPER_ADMIN}>Super Admin</option>
        </select>

        {(search || role) && (
          <button
            type="button"
            onClick={() => {
              setSearch('');
              setRole('');
            }}
            className="btn btn-ghost btn-sm text-xs text-error gap-1"
          >
            <X className="w-3.5 h-3.5" /> Clear Filters
          </button>
        )}
      </div>

      {/* Users Table */}
      <DataTable
        columns={columns}
        data={users}
        loading={loading}
        emptyTitle="No users found"
        emptyDescription="No registered users match your query."
      />

      {/* Role Edit Modal */}
      <Modal
        open={!!selectedUser}
        onClose={() => setSelectedUser(null)}
        title="Change User Authorization Role"
        maxWidth="sm"
      >
        {selectedUser && (
          <div className="space-y-4 py-2">
            <p className="text-xs text-base-content/70">
              Modifying privileges for{' '}
              <strong className="text-base-content">{selectedUser.name}</strong> ({selectedUser.email}):
            </p>

            <div>
              <label className="label text-xs font-semibold text-base-content/80 pb-1">
                Assign System Role:
              </label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as UserRole)}
                className="select select-bordered w-full rounded-xl text-sm"
              >
                <option value={UserRole.USER}>Standard User</option>
                <option value={UserRole.ADMIN}>Administrator (Full Access)</option>
                <option value={UserRole.SUPER_ADMIN}>Super Administrator</option>
              </select>
            </div>

            <div className="modal-action">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedUser(null)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                loading={savingRole}
                onClick={handleUpdateRole}
              >
                Save Role
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
