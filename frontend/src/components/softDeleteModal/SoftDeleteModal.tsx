import { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import './SoftDeleteModal.css';

type SoftDeleteType = 'user' | 'recipe';

type SoftDeleteModalProps = {
  type: SoftDeleteType;
  name: string;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
  additionalInfo?: string;
};

const SoftDeleteModal = ({ type, name, onConfirm, onCancel, additionalInfo }: SoftDeleteModalProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const isUser = type === 'user';
  const deleteDate = new Date();
  deleteDate.setDate(deleteDate.getDate() + 90);
  const formattedDeleteDate = deleteDate.toLocaleDateString('sv-SE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const handleConfirm = async () => {
    setIsLoading(true);
    setError('');
    try {
      await onConfirm();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Kunde inte soft delete:a. Försök igen senare.';
      setError(errorMessage);
      setIsLoading(false);
    }
  };

  return (
    <div className="soft-delete-overlay">
      <div className="soft-delete-modal">
        <div className="soft-delete-header">
          <AlertCircle size={32} className="alert-icon" />
          <h2>Soft delete {isUser ? 'användare' : 'recept'}</h2>
          <p className="modal-subtitle">Datan sparas under 90 dagar</p>
        </div>

        <div className="soft-delete-content">
          <div className="info-box info-box-warning">
            <h3>⚠️ Du håller på att soft delete:a</h3>
            <p>
              <strong>{isUser ? 'Användare' : 'Recept'}:</strong> {name}
              {additionalInfo && <>
                <br />
                <strong>Info:</strong> {additionalInfo}
              </>}
            </p>
          </div>

          {isUser && (
            <div className="info-box info-box-info">
              <h3>📋 Vad händer när en användare soft delete:as?</h3>
              <ul>
                <li>Användarkontot markeras som borttaget</li>
                <li>Användaren kan inte logga in längre</li>
                <li>Alla användarens recept dolls för andra</li>
                <li>Användarens favoriter visas inte</li>
                <li>All data sparas i databasen under 90 dagar</li>
              </ul>
            </div>
          )}

          {!isUser && (
            <div className="info-box info-box-info">
              <h3>📋 Vad händer när ett recept soft delete:as?</h3>
              <ul>
                <li>Receptet dölls från appen för alla användare</li>
                <li>Receptet syns inte i utforska eller användarens profil</li>
                <li>Receptet kan inte förklas av andra</li>
                <li>All receptdata sparas i databasen under 90 dagar</li>
              </ul>
            </div>
          )}

          <div className="info-box info-box-timeline">
            <div className="timeline-item">
              <div className="timeline-marker">Nu</div>
              <div className="timeline-content">
                <h4>Soft delete aktiveras</h4>
                <p>Data markeras som borttaget men sparas i databasen</p>
              </div>
            </div>

            <div className="timeline-arrow">↓</div>

            <div className="timeline-item">
              <div className="timeline-marker">90 dagar</div>
              <div className="timeline-content">
                <h4>Permanent radering: {formattedDeleteDate}</h4>
                <p>Automatisk radering av all data från databasen enligt GDPR</p>
              </div>
            </div>
          </div>

          <div className="info-box info-box-gdpr">
            <h3>🔒 GDPR-kompatibel process</h3>
            <p>
              Soft delete följer GDPR-riktlinjer för dataskydd. Datan är faktiskt borttagen från vyn
              men sparas för säkerhetskopiering och rättslig överensstämmelse under 90 dagar,
              varefter den tas bort helt automatiskt.
            </p>
          </div>

          {error && <p className="error-message">{error}</p>}
        </div>

        <div className="soft-delete-actions">
          <button
            onClick={onCancel}
            className="btn-cancel"
            disabled={isLoading}
          >
            Avbryt
          </button>
          <button
            onClick={handleConfirm}
            className="btn-delete"
            disabled={isLoading}
          >
            {isLoading ? 'Arbetar...' : 'Bekräfta soft delete'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SoftDeleteModal;
