'use client';

import React, { useEffect, useState } from 'react';
import { Laptop, Smartphone, Monitor, ShieldAlert, LogOut, RefreshCw, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import authService from '../../services/auth.service';
import { Button } from '../ui/Button';

interface SessionItem {
  id: string;
  ipAddress: string;
  userAgent: string;
  createdAt: string;
  isCurrent: boolean;
}

export function DeviceSessionManager() {
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [revokingAll, setRevokingAll] = useState(false);

  const loadSessions = () => {
    setLoading(true);
    authService
      .getSessions()
      .then((data) => setSessions(data))
      .catch(() => toast.error('Failed to load active sessions'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadSessions();
  }, []);

  const handleRevoke = async (id: string) => {
    setRevokingId(id);
    try {
      await authService.revokeSession(id);
      toast.success('Remote session terminated successfully');
      setSessions((prev) => prev.filter((s) => s.id !== id));
    } catch {
      toast.error('Failed to revoke session');
    } finally {
      setRevokingId(null);
    }
  };

  const handleRevokeAllOther = async () => {
    setRevokingAll(true);
    try {
      await authService.revokeOtherSessions();
      toast.success('Logged out from all other devices');
      setSessions((prev) => prev.filter((s) => s.isCurrent));
    } catch {
      toast.error('Failed to revoke other sessions');
    } finally {
      setRevokingAll(false);
    }
  };

  const getDeviceIcon = (ua: string) => {
    const lower = ua.toLowerCase();
    if (lower.includes('mobile') || lower.includes('android') || lower.includes('iphone')) {
      return <Smartphone className="w-5 h-5 text-primary" />;
    }
    if (lower.includes('macintosh') || lower.includes('windows') || lower.includes('linux')) {
      return <Laptop className="w-5 h-5 text-primary" />;
    }
    return <Monitor className="w-5 h-5 text-primary" />;
  };

  const parseBrowser = (ua: string) => {
    if (!ua) return 'Unknown Device';
    if (ua.includes('Chrome')) return 'Chrome Browser';
    if (ua.includes('Firefox')) return 'Firefox Browser';
    if (ua.includes('Safari') && !ua.includes('Chrome')) return 'Safari Browser';
    if (ua.includes('Edge')) return 'Microsoft Edge';
    return ua.slice(0, 30);
  };

  const parseOS = (ua: string) => {
    if (!ua) return 'Unknown OS';
    if (ua.includes('Windows')) return 'Windows';
    if (ua.includes('Macintosh') || ua.includes('Mac OS')) return 'macOS';
    if (ua.includes('Linux')) return 'Linux';
    if (ua.includes('Android')) return 'Android';
    if (ua.includes('iPhone') || ua.includes('iPad')) return 'iOS';
    return 'Desktop/Server';
  };

  return (
    <div className="card bg-base-100 border border-base-300 p-6 sm:p-8 rounded-3xl shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-base-content">
              Active Devices &amp; Sessions
            </h3>
            <span className="badge badge-sm font-semibold badge-ghost">
              {sessions.length} active
            </span>
          </div>
          <p className="text-xs text-base-content/60 mt-1">
            Manage your logged-in browsers and instantly revoke access from unrecognized devices
          </p>
        </div>

        {sessions.some((s) => !s.isCurrent) && (
          <Button
            variant="error"
            size="sm"
            onClick={handleRevokeAllOther}
            loading={revokingAll}
            leftIcon={LogOut}
            className="font-semibold shadow-sm"
          >
            Log Out All Other Devices
          </Button>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-20 skeleton rounded-2xl" />
          ))}
        </div>
      ) : sessions.length === 0 ? (
        <div className="p-8 text-center rounded-2xl border border-dashed border-base-300 text-xs text-base-content/60">
          No active session records found.
        </div>
      ) : (
        <div className="space-y-3">
          {sessions.map((sess) => (
            <div
              key={sess.id}
              className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                sess.isCurrent
                  ? 'border-primary/40 bg-primary/5'
                  : 'border-base-300 bg-base-100 hover:border-base-content/20'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-base-200 flex items-center justify-center shrink-0 border border-base-300">
                  {getDeviceIcon(sess.userAgent)}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-bold text-base-content truncate">
                      {parseBrowser(sess.userAgent)} on {parseOS(sess.userAgent)}
                    </p>
                    {sess.isCurrent && (
                      <span className="badge badge-primary badge-xs font-semibold py-2 px-2 text-[10px]">
                        This Device
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-base-content/50 mt-0.5">
                    <span>IP: {sess.ipAddress || '127.0.0.1'}</span>
                    <span>&bull;</span>
                    <span>Logged in: {new Date(sess.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div>
                {sess.isCurrent ? (
                  <span className="text-[11px] font-bold text-success flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Active
                  </span>
                ) : (
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={() => handleRevoke(sess.id)}
                    loading={revokingId === sess.id}
                    className="text-error border border-error/30 hover:bg-error/10 hover:border-error"
                  >
                    Revoke Access
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
