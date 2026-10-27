import React from 'react';
import { DocumentVerificationDesk } from './DocumentVerificationDesk';
import type { Institution, FDRInstrument } from '../types';

interface ForensicsWorkbenchProps {
  institutions: Institution[];
  selectedInstitutionId: number | null;
  onSelectInstitution: (id: number) => void;
  onFDRSubmitted: () => void;
  fdrs?: FDRInstrument[];
}

/**
 * ForensicsWorkbench - Re-exports DocumentVerificationDesk for clean backwards compatibility.
 * All AI and OpenCV modules have been deprecated and replaced with standard manual verification.
 */
export const ForensicsWorkbench: React.FC<ForensicsWorkbenchProps> = ({
  institutions,
  selectedInstitutionId,
  onSelectInstitution,
  onFDRSubmitted,
  fdrs = []
}) => {
  return (
    <DocumentVerificationDesk
      fdrs={fdrs}
      institutions={institutions}
      selectedInstitutionId={selectedInstitutionId}
      onSelectInstitution={onSelectInstitution}
      onRefreshAll={onFDRSubmitted}
    />
  );
};

export default ForensicsWorkbench;
