import { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import './DeleteAccountModal.css';

type DeleteAccountModalProps = {
  onConfirm: (password: string) => Promise<void>;
  onCancel: () => void;
  username: string;
  onSuccess?: () => void;
};

const DeleteAccountModal = ({ onConfirm, onCancel, username, onSuccess }: DeleteAccountModalProps) => {
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const isConfirmed = password.length > 0;
  const isLastAdminError = error.toLowerCase().includes('sista admin');

  useEffect(() => {
    if (isSuccess && onSuccess) {
      const timer = setTimeout(onSuccess, 2000);
      return () => clearTimeout(timer);
    }
  }, [isSuccess, onSuccess]);

  const handleConfirm = async () => {
    if (!isConfirmed) return;

    setIsLoading(true);
    setError('');
    try {
      await onConfirm(password);
      setIsSuccess(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Kunde inte radera kontot. Försök igen senare.';
      setError(errorMessage);
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="delete-account-overlay">
        <div className="delete-account-modal">
          <div className="delete-account-header success-header">
            <h2>Konto raderat</h2>
            <p className="modal-subtitle">Ditt konto och all data har raderats permanent</p>
          </div>

          <div className="delete-account-content">
            <div className="info-box info-box-success">
              <p>
                Ditt konto för <strong>{username}</strong> har raderats framgångsrikt.
                Du omdirigeras nu till inloggningssidan...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isLastAdminError) {
    return (
      <div className="delete-account-overlay">
        <div className="delete-account-modal">
          <div className="delete-account-header">
            <AlertCircle size={32} className="alert-icon" />
            <h2>Kan inte radera konto</h2>
          </div>

          <div className="delete-account-content">
            <div className="info-box info-box-warning">
              <h3>⚠️ Du är den enda administratören</h3>
              <p>
                {error || 'Det finns endast en administratör kvar i systemet. För att bibehålla systemets säkerhet måste det finnas minst en administratör. Du måste först ge administratörsrättigheter till en annan användare innan du kan radera ditt konto.'}
              </p>
            </div>
          </div>

          <div className="delete-account-actions">
            <button onClick={onCancel} className="btn-cancel">
              Stäng
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="delete-account-overlay">
      <div className="delete-account-modal">
        <div className="delete-account-header">
          <AlertCircle size={32} className="alert-icon" />
          <h2>Radera konto</h2>
          <p className="modal-subtitle">Denna åtgärd kan inte ångras</p>
        </div>

        <div className="delete-account-content">
          <div className="info-box info-box-warning">
            <h3>⚠️ Varning</h3>
            <p>
              Du håller på att radera ditt konto för <strong>{username}</strong> permanent.
              Se till att du är helt säker innan du fortsätter.
            </p>
          </div>

          <div className="info-box info-box-info">
            <h3>📋 Detta kommer att ta bort:</h3>
            <ul>
              <li>Ditt användarkonto och all autentiseringsinformation</li>
              <li>Alla recept du har skapat</li>
              <li>Din favoritlista</li>
              <li>All personlig data kopplad till ditt konto</li>
              <li>Alla kommentarer och betyg du har gjort</li>
            </ul>
          </div>

          <div className="info-box info-box-gdpr">
            <h3>🔒 Hard Delete &amp; Permanent Borttagning</h3>
            <p>
              Din data raderas permanent och omedelbar från databasen enligt GDPR. Det finns ingen 90-dagars väntperiod.
              Du kan omedelbar återskapa ett konto med samma e-postadress efter borttagningen.
            </p>
          </div>

          <div className="confirmation-section">
            <p className="confirmation-instruction">
              För att bekräfta radering, ange ditt lösenord:
            </p>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Ange ditt lösenord"
              className="confirmation-input"
              disabled={isLoading}
              autoFocus
            />
          </div>

          {error && <p className="error-message">{error}</p>}
        </div>

        <div className="delete-account-actions">
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
            disabled={!isConfirmed || isLoading}
          >
            {isLoading ? 'Raderar...' : 'Radera mitt konto'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteAccountModal;
