import React from 'react';
import type { UserSession, UserPreset, EvaluationScenario } from '../types';

interface PresenterDemoBarProps {
  currentSession: UserSession | null;
  onLoginAs: (session: UserSession) => void;
  onLogout: () => void;
  onResetSeed: () => Promise<void>;
  isResetting: boolean;
  onNavigateToScenario?: (scenarioId: number) => void;
  presets?: UserPreset[];
  scenarios?: EvaluationScenario[];
}

export const EVALUATION_SCENARIOS = [
  {
    id: 1,
    title: 'New FDR Submission',
    subtitle: 'Document Upload & Verification',
    badge: 'MANDATE 1'
  },
  {
    id: 2,
    title: 'Validity Tracking',
    subtitle: 'Centralized Repository / Bank Gateway',
    badge: 'MANDATE 2'
  },
  {
    id: 4,
    title: 'Renewal & Replacement',
    subtitle: 'Deposit History DAG Graph',
    badge: 'MANDATE 4'
  },
  {
    id: 5,
    title: 'Discrepancy Identification',
    subtitle: 'AI Forensics & Bank Mismatch View',
    badge: 'MANDATE 5'
  },
  {
    id: 6,
    title: 'Authorized Release Processing',
    subtitle: '4-Gate Refund Workflow',
    badge: 'MANDATE 6'
  }
];

export const DEMO_PRESETS: { label: string; icon: string; session: UserSession }[] = [
  {
    label: 'Apex Institute (Clean Matured ₹35L)',
    icon: '🏫',
    session: {
      role: 'INSTITUTION_NODAL_OFFICER',
      userId: '1-100200301',
      userName: 'Dr. Rameshwar Sharma',
      designation: 'Registrar & Nodal Officer',
      institutionId: 1,
      institutionPid: '1-100200301',
      institutionName: 'Apex Institute of Engineering & Technology, Jaipur'
    }
  },
  {
    label: 'Vanguard College (PGRC Dues ₹12.5L)',
    icon: '🏫',
    session: {
      role: 'INSTITUTION_NODAL_OFFICER',
      userId: '1-400500602',
      userName: 'Prof. Sneha Deshmukh',
      designation: 'Finance Officer',
      institutionId: 2,
      institutionPid: '1-400500602',
      institutionName: 'Vanguard Institute of Technology, Pune'
    }
  },
  {
    label: 'AICTE Scrutiny Officer (Regulation Desk)',
    icon: '🔍',
    session: {
      role: 'AICTE_SCRUTINY_OFFICER',
      userId: 'officer.rb@aicte-india.org',
      userName: 'Er. Amitav Sen',
      designation: 'Senior Scrutiny Officer, Regulation Bureau',
      department: 'Regulation & Approval Bureau, AICTE New Delhi'
    }
  },
  {
    label: 'Member Secretary / Competent Authority',
    icon: '🏛️',
    session: {
      role: 'COMPETENT_AUTHORITY',
      userId: 'ms@aicte-india.org',
      userName: 'Prof. Rajive Kumar',
      designation: 'Member Secretary & Competent Authority',
      department: 'Executive Council, AICTE Headquarters'
    }
  },
  {
    label: 'SBI Branch Manager (Bank Attestation Portal)',
    icon: '🏦',
    session: {
      role: 'BANK_BRANCH_MANAGER',
      userId: 'mgr.pune@sbi.co.in',
      userName: 'Mr. Rajesh Khurana',
      designation: 'Chief Branch Manager',
      bankName: 'State Bank of India (IFSC: SBIN0001234)',
      branchName: 'Shivaji Nagar Branch, Pune'
    }
  }
];

export const PresenterDemoBar: React.FC<PresenterDemoBarProps> = () => {
  // Demo Controls completely removed for production
  return null;
};
