'use client';

import React from 'react';
import { CheckCircle2, XCircle, AlertCircle, ShieldCheck } from 'lucide-react';
import { ReadinessReportData, RecoveryMethod } from '../../types';
import { ProgressBar } from '../ui/ProgressBar';
import { getReadinessBadge } from '../../utils/helpers';

export function ReadinessReport({ report }: { report: ReadinessReportData }) {
  const readinessBadge = getReadinessBadge(report.readiness);

  return (
    <div className="space-y-6">
      {/* Score Header */}
      <div className="p-5 rounded-2xl bg-base-200/50 border border-base-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-base-content/50">
            Account Assessment
          </span>
          <h3 className="text-lg font-bold text-base-content mt-0.5">{report.email}</h3>
          <div className="mt-1">
            <span className={`badge badge-sm font-semibold ${readinessBadge.className}`}>
              {readinessBadge.label}
            </span>
          </div>
        </div>

        <div className="w-full sm:w-48">
          <ProgressBar
            value={report.score}
            label="Recovery Health Score"
            size="md"
          />
        </div>
      </div>

      {/* Methods breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Available methods */}
        <div className="p-4 rounded-2xl border border-success/30 bg-success/5 space-y-3">
          <div className="flex items-center gap-2 text-success font-bold text-xs uppercase tracking-wider">
            <CheckCircle2 className="w-4 h-4" />
            <span>Configured Recovery Safeguards ({report.availableMethods.length})</span>
          </div>
          {report.availableMethods.length === 0 ? (
            <p className="text-xs text-base-content/60">No recovery safeguards configured.</p>
          ) : (
            <ul className="space-y-1.5 text-xs text-base-content/80">
              {report.availableMethods.map((m, i) => (
                <li key={i} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-success" />
                  <span className="capitalize">{m.replace(/_/g, ' ')}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Missing methods */}
        <div className="p-4 rounded-2xl border border-warning/30 bg-warning/5 space-y-3">
          <div className="flex items-center gap-2 text-warning font-bold text-xs uppercase tracking-wider">
            <XCircle className="w-4 h-4" />
            <span>Missing Recovery Safeguards ({report.missingMethods.length})</span>
          </div>
          {report.missingMethods.length === 0 ? (
            <p className="text-xs text-success font-medium">All safeguards are active!</p>
          ) : (
            <ul className="space-y-1.5 text-xs text-base-content/80">
              {report.missingMethods.map((m, i) => (
                <li key={i} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-warning" />
                  <span className="capitalize">{m.replace(/_/g, ' ')}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Recommendations */}
      {report.recommendations.length > 0 && (
        <div className="p-4 rounded-2xl bg-base-100 border border-base-300">
          <h4 className="text-xs font-bold text-base-content uppercase tracking-wider mb-2 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-warning" />
            <span>Actionable Next Steps</span>
          </h4>
          <ul className="space-y-1.5 text-xs text-base-content/80 list-disc list-inside">
            {report.recommendations.map((rec, i) => (
              <li key={i}>{rec}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
